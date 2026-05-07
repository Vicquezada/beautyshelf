import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export function Privacy() {
  const navigate = useNavigate()

  return (
    <div className="app-shell min-h-screen bg-white">
      <div className="sticky top-0 bg-white border-b border-cream-100 px-4 py-3 flex items-center gap-3 z-10">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-xl hover:bg-cream-100 transition-colors">
          <ArrowLeft size={20} className="text-warm-700" />
        </button>
        <h1 className="font-medium text-warm-900">Privacy Policy</h1>
      </div>

      <div className="px-5 py-6 space-y-6 text-sm text-warm-700 max-w-2xl mx-auto pb-16">
        <div>
          <p className="text-xs text-warm-400">Ultimo aggiornamento: maggio 2025</p>
        </div>

        <section className="space-y-2">
          <h2 className="font-semibold text-warm-900 text-base">1. Titolare del trattamento</h2>
          <p>
            Il titolare del trattamento dei dati personali è <strong>BeautyShelf</strong>, raggiungibile
            all'indirizzo email: <strong>privacy@beautyshelf.app</strong>
          </p>
          <p>
            La presente informativa è redatta in conformità al Regolamento (UE) 2016/679 (GDPR)
            e alla Legge federale svizzera sulla protezione dei dati (nLPD/nDSG, in vigore dal 1° settembre 2023).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-warm-900 text-base">2. Dati raccolti</h2>
          <p>BeautyShelf raccoglie le seguenti categorie di dati:</p>
          <ul className="space-y-1 pl-4 list-disc">
            <li><strong>Dati di registrazione:</strong> indirizzo email, password (cifrata)</li>
            <li><strong>Dati di profilo:</strong> nome, nome dello studio, tipo di attività, paese, città, genere, specializzazioni</li>
            <li><strong>Dati magazzino:</strong> prodotti cosmetici inseriti (nome, marca, categoria, date di scadenza, quantità, ingredienti, fotografie)</li>
            <li><strong>Dati di utilizzo:</strong> storico quantità, fornitori, avvisi prezzi</li>
          </ul>
          <p>Non raccogliamo dati sensibili ai sensi dell'art. 9 GDPR, né dati relativi a minori.</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-warm-900 text-base">3. Finalità e base giuridica</h2>
          <ul className="space-y-1 pl-4 list-disc">
            <li><strong>Erogazione del servizio</strong> (art. 6(1)(b) GDPR — esecuzione contratto): gestione account, funzionalità app, sincronizzazione dati</li>
            <li><strong>Analisi prodotti tramite AI</strong> (art. 6(1)(b) GDPR): le fotografie caricate vengono inviate ad Anthropic Claude per il riconoscimento degli ingredienti INCI</li>
            <li><strong>Normative cosmetiche</strong> (art. 6(1)(b) GDPR): il paese indicato nel profilo viene usato per filtrare le normative pertinenti</li>
            <li><strong>Sicurezza e prevenzione abusi</strong> (art. 6(1)(f) GDPR — legittimo interesse)</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-warm-900 text-base">4. Conservazione dei dati</h2>
          <p>
            I dati vengono conservati per tutta la durata dell'account attivo.
            In caso di cancellazione dell'account, tutti i dati personali vengono eliminati
            entro <strong>30 giorni</strong>, salvo obblighi di legge.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-warm-900 text-base">5. Condivisione con terze parti</h2>
          <p>I tuoi dati possono essere trattati dai seguenti responsabili del trattamento:</p>
          <ul className="space-y-2 pl-4 list-disc">
            <li>
              <strong>Supabase Inc.</strong> (database e autenticazione) — server in UE (AWS eu-west-1).
              DPA disponibile su supabase.com/privacy
            </li>
            <li>
              <strong>Vercel Inc.</strong> (hosting applicazione) — certificata secondo standard di sicurezza internazionali.
              Privacy policy su vercel.com/legal/privacy-policy
            </li>
            <li>
              <strong>Anthropic PBC</strong> (analisi AI fotografie prodotti) — le immagini vengono inviate solo quando utilizzi la funzione "Scatta foto". Non vengono usate per addestrare modelli AI.
              Privacy policy su anthropic.com/privacy
            </li>
            <li>
              <strong>Open Beauty Facts</strong> (database cosmetici open source) — nessun dato personale viene trasmesso, solo il codice EAN del prodotto
            </li>
          </ul>
          <p>Non vendiamo né cediamo dati a terzi per scopi commerciali.</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-warm-900 text-base">6. Cookie e tecnologie di tracciamento</h2>
          <p>
            BeautyShelf utilizza esclusivamente cookie tecnici necessari al funzionamento
            dell'autenticazione (sessione utente). Non utilizziamo cookie di profilazione
            o tracker di terze parti a fini pubblicitari.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-warm-900 text-base">7. I tuoi diritti</h2>
          <p>Ai sensi del GDPR e della nDSG hai diritto di:</p>
          <ul className="space-y-1 pl-4 list-disc">
            <li><strong>Accesso</strong> — richiedere copia dei tuoi dati</li>
            <li><strong>Rettifica</strong> — correggere dati inesatti</li>
            <li><strong>Cancellazione</strong> — eliminare il tuo account e tutti i dati (direttamente dall'app, sezione Impostazioni)</li>
            <li><strong>Portabilità</strong> — ricevere i tuoi dati in formato strutturato</li>
            <li><strong>Opposizione</strong> — opporti a trattamenti basati su legittimo interesse</li>
            <li><strong>Reclamo</strong> — presentare reclamo al Garante Privacy italiano (garanteprivacy.it) o al PFPDT svizzero (edoeb.admin.ch)</li>
          </ul>
          <p>Per esercitare i tuoi diritti: <strong>privacy@beautyshelf.app</strong></p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-warm-900 text-base">8. Trasferimenti internazionali</h2>
          <p>
            I dati trattati da Supabase risiedono in server UE. I dati inviati ad Anthropic per
            l'analisi AI possono essere trattati in USA, nel rispetto delle clausole contrattuali
            standard (SCC) approvate dalla Commissione europea.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-warm-900 text-base">9. Modifiche alla policy</h2>
          <p>
            In caso di modifiche sostanziali, gli utenti verranno notificati via email
            con almeno 30 giorni di preavviso.
          </p>
        </section>

        <div className="border-t border-cream-200 pt-4 text-xs text-warm-400">
          BeautyShelf · privacy@beautyshelf.app
        </div>
      </div>
    </div>
  )
}
