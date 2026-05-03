import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY') ?? ''

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
}

interface ImageInput {
  data: string
  mediaType: 'image/jpeg' | 'image/png' | 'image/webp'
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { images } = await req.json() as { images: ImageInput[] }

    if (!images?.length) {
      return new Response(JSON.stringify({ error: 'Nessuna immagine fornita' }), {
        status: 400,
        headers: corsHeaders,
      })
    }

    const imageContent = images.map((img) => ({
      type: 'image' as const,
      source: {
        type: 'base64' as const,
        media_type: img.mediaType,
        data: img.data,
      },
    }))

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: [
              ...imageContent,
              {
                type: 'text',
                text: `Sei un esperto di cosmetici professionali. Analizza queste foto di un prodotto cosmetico ed estrai le informazioni in JSON con questa struttura esatta:

{
  "name": "nome completo del prodotto",
  "brand": "marca/brand del prodotto",
  "category": "categoria del prodotto (es: Siero, Crema viso, Maschera, Shampoo, ecc.)",
  "expiry_date": "data scadenza nel formato YYYY-MM-DD, oppure null se non visibile",
  "ingredients": ["INGREDIENTE1", "INGREDIENTE2", ...],
  "expiry_found": true o false
}

Note importanti:
- La data di scadenza può essere indicata come "EXP", "Best before", "Scade il", o simbolo clessidra seguita da data
- Formato date comuni: MM/YYYY, MM/YY, YYYY-MM-DD
- Ingredienti: lista INCI completa se visibile, altrimenti lista vuota
- expiry_found: true solo se la data di scadenza è chiaramente leggibile
- Rispondi SOLO con il JSON, senza markdown, senza testo aggiuntivo, senza \`\`\`json`,
              },
            ],
          },
        ],
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`Anthropic API error ${response.status}: ${errText}`)
    }

    const data = await response.json()
    const content = data.content?.[0]?.text ?? ''

    let parsed
    try {
      parsed = JSON.parse(content)
    } catch {
      const match = content.match(/\{[\s\S]*\}/)
      if (match) {
        parsed = JSON.parse(match[0])
      } else {
        throw new Error('Risposta AI non parseable')
      }
    }

    return new Response(JSON.stringify(parsed), { headers: corsHeaders })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Errore sconosciuto'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: corsHeaders,
    })
  }
})
