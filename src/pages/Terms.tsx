import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export function Terms() {
  const navigate = useNavigate()

  return (
    <div className="app-shell min-h-screen bg-white">
      <div className="sticky top-0 bg-white border-b border-cream-100 px-4 py-3 flex items-center gap-3 z-10">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-xl hover:bg-cream-100 transition-colors">
          <ArrowLeft size={20} className="text-warm-700" />
        </button>
        <h1 className="font-medium text-warm-900">Termini di Servizio</h1>
      </div>

      <div className="px-5 py-6 space-y-6 text-sm text-warm-700 max-w-2xl mx-auto pb-16">
        <div>
          <p className="text-xs text-warm-400">Ultimo aggiornamento: maggio 2025</p>
        </div>

        <section className="space-y-2">
          <h2 className="font-semibold text-warm-900 text-base">1. Accettazione dei termini</h2>
          <p>
            Utilizzando BeautyShelf accetti i presenti Termini di Servizio. Se non li accetti,
            non puoi utilizzare l'applicazione. BeautyShelf è un servizio rivolto a professionisti
            del settore estetico (estetiste, centri benessere, freelance) maggiorenni.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-warm-900 text-base">2. Descrizione del servizio</h2>
          <p>
            BeautyShelf è un'applicazione web per la gestione del magazzino cosmetici professionale.
            Offre funzionalità di: inventario prodotti, scansione barcode, analisi INCI tramite AI,
            monitoraggio scadenze, aggiornamenti normativi cosmetici per Italia e Svizzera.
          </p>
          <p>
            Il servizio è fornito "così com'è" durante la fase di beta test gratuita.
            Ci riserviamo il diritto di modificare, sospendere o interrompere funzionalità in qualsiasi momento.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-warm-900 text-base">3. Account utente</h2>
          <ul className="space-y-1 pl-4 list-disc">
            <li>Sei responsabile della sicurezza delle tue credenziali di accesso</li>
            <li>Ogni account è strettamente personale e non cedibile a terzi</li>
            <li>Sei responsabile di tutte le attività effettuate con il tuo account</li>
            <li>Devi fornire informazioni veritiere durante la registrazione</li>
            <li>Puoi cancellare il tuo account in qualsiasi momento dalla sezione Impostazioni</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-warm-900 text-base">4. Uso corretto del servizio</h2>
          <p>È vietato utilizzare BeautyShelf per:</p>
          <ul className="space-y-1 pl-4 list-disc">
            <li>Attività illegali o contrarie alla normativa vigente</li>
            <li>Inserire dati falsi o fuorvianti</li>
            <li>Tentare di accedere a dati di altri utenti</li>
            <li>Sovraccaricare o danneggiare l'infrastruttura del servizio</li>
            <li>Uso commerciale non autorizzato dei dati normativi forniti</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-warm-900 text-base">5. Contenuti e responsabilità</h2>
          <p>
            Le informazioni normative fornite dall'app hanno scopo puramente informativo e non
            costituiscono consulenza legale o regolatoria. BeautyShelf non si assume responsabilità
            per decisioni prese sulla base delle normative visualizzate nell'app.
          </p>
          <p>
            L'analisi degli ingredienti tramite AI (Claude) è indicativa. Verifica sempre
            le schede tecniche ufficiali dei prodotti per decisioni professionali.
          </p>
          <p>
            Sei l'unico responsabile dei dati inseriti nel tuo magazzino e del loro aggiornamento.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-warm-900 text-base">6. Proprietà intellettuale</h2>
          <p>
            Il nome BeautyShelf, il design, il codice e i contenuti originali dell'app sono
            proprietà esclusiva dei titolari. È vietata la riproduzione o distribuzione
            senza autorizzazione scritta.
          </p>
          <p>
            I dati dei prodotti inseriti dall'utente rimangono di proprietà dell'utente.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-warm-900 text-base">7. Limitazione di responsabilità</h2>
          <p>
            Nei limiti consentiti dalla legge, BeautyShelf non è responsabile per danni diretti
            o indiretti derivanti dall'uso o dall'impossibilità di uso del servizio, inclusa
            la perdita di dati.
          </p>
          <p>
            Durante la fase beta il servizio potrebbe subire interruzioni, perdite di dati
            o modifiche sostanziali senza preavviso.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-warm-900 text-base">8. Legge applicabile</h2>
          <p>
            Per gli utenti italiani si applica la legge italiana e la normativa UE.
            Per gli utenti svizzeri si applica la legge svizzera, in particolare la nLPD.
            Foro competente: Milano (IT) o Lugano (CH) in base alla residenza dell'utente.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-warm-900 text-base">9. Modifiche ai termini</h2>
          <p>
            Ci riserviamo il diritto di modificare i presenti termini. Gli utenti verranno
            notificati via email con almeno 15 giorni di preavviso. L'uso continuato del
            servizio dopo la notifica costituisce accettazione dei nuovi termini.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-warm-900 text-base">10. Contatti</h2>
          <p>
            Per qualsiasi questione relativa ai presenti termini: <strong>privacy@beautyshelf.app</strong>
          </p>
        </section>

        <div className="border-t border-cream-200 pt-4 text-xs text-warm-400">
          BeautyShelf · privacy@beautyshelf.app
        </div>
      </div>
    </div>
  )
}
