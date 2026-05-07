import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
}

interface Normativa {
  title: string
  date: string
  summary: string
  category: string
  severity: 'urgente' | 'attenzione' | 'info'
  affected_ingredients: string[]
  source: string
  country: 'IT' | 'CH' | 'ALL'
}

async function fetchForCountry(
  country: 'IT' | 'CH' | 'ALL',
  existingTitles: Set<string>,
  today: string
): Promise<Normativa[]> {
  const countryContext = country === 'IT'
    ? 'Italia (normativa UE + Ministero della Salute italiano, RAPEX)'
    : country === 'CH'
    ? 'Svizzera / Canton Ticino (Swissmedic, ODCos, nLPD, normativa svizzera sui cosmetici)'
    : 'Europa in generale (UE, ECHA, SCCS)'

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-5',
      max_tokens: 3000,
      messages: [{
        role: 'user',
        content: `Sei un esperto di normative cosmetiche per estetiste professioniste in ${countryContext}.

Data di oggi: ${today}

Genera un JSON array con 4-6 normative cosmetiche REALI e RECENTI (ultimi 2 anni) rilevanti per estetiste in ${countryContext}. Solo se sei sicuro della loro esistenza.

Concentrati su:
${country === 'IT' || country === 'ALL' ? '- Regolamento CE 1223/2009 e aggiornamenti EU\n- Restrizioni INCI: HEMA, formaldeide, parabeni, PFAS, coloranti, filtri UV\n- Allerte RAPEX su prodotti non conformi\n- Normative Ministero della Salute italiano' : ''}
${country === 'CH' ? '- Aggiornamenti Swissmedic e ODCos (Ordinanza sui cosmetici)\n- Differenze tra normativa svizzera e UE per ingredienti\n- Requisiti specifici per etichettatura in CH\n- nLPD (nuova legge protezione dati) impatto su trattamenti' : ''}
- Normative su gel UV/semipermanente, smalti, trattamenti professionali

Formato JSON richiesto:
[
  {
    "title": "titolo chiaro in italiano",
    "date": "YYYY-MM-DD",
    "summary": "spiegazione pratica in 2-3 frasi per l'estetista: cosa cambia, cosa deve verificare, entro quando",
    "category": "categoria (es: Smalti/Gel, Tutti, SPF/Solari, Make-up, Colorazione, Trattamenti viso)",
    "severity": "urgente|attenzione|info",
    "affected_ingredients": ["INCI_1", "INCI_2"],
    "source": "EUR-Lex|Swissmedic|ECHA|RAPEX|Ministero Salute|ODCos"
  }
]

Rispondi SOLO con il JSON array, senza markdown o testo aggiuntivo.`,
      }],
    }),
  })

  if (!res.ok) throw new Error(`Claude API error: ${res.status}`)

  const data = await res.json()
  const text = data.content?.[0]?.text ?? '[]'

  let normative: Omit<Normativa, 'country'>[] = []
  try {
    normative = JSON.parse(text)
  } catch {
    const match = text.match(/\[[\s\S]*\]/)
    if (match) normative = JSON.parse(match[0])
  }

  return normative
    .filter(n => !existingTitles.has(n.title.toLowerCase()))
    .map(n => ({ ...n, country }))
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const { data: existing } = await supabase.from('normative').select('title')
    const existingTitles = new Set((existing ?? []).map((n: { title: string }) => n.title.toLowerCase()))

    const today = new Date().toISOString().split('T')[0]

    // Fetch normative for IT, CH and ALL in parallel
    const [itNorm, chNorm, allNorm] = await Promise.all([
      fetchForCountry('IT', existingTitles, today),
      fetchForCountry('CH', existingTitles, today),
      fetchForCountry('ALL', existingTitles, today),
    ])

    const toInsert = [...itNorm, ...chNorm, ...allNorm]

    if (toInsert.length > 0) {
      const { error } = await supabase.from('normative').insert(toInsert)
      if (error) throw error
    }

    return new Response(
      JSON.stringify({
        message: 'OK',
        inserted: toInsert.length,
        breakdown: { IT: itNorm.length, CH: chNorm.length, ALL: allNorm.length },
      }),
      { headers: corsHeaders }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Errore sconosciuto'
    return new Response(JSON.stringify({ error: message }), { status: 500, headers: corsHeaders })
  }
})
