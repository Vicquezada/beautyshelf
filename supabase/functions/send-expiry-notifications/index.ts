import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Send a web push notification
async function sendPush(subscription: { endpoint: string; p256dh: string; auth: string }, payload: object) {
  // Import web-push compatible library for Deno
  const { default: webpush } = await import('https://esm.sh/web-push@3.6.7')

  webpush.setVapidDetails(
    'mailto:privacy@beautyshelf.app',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  )

  await webpush.sendNotification(
    {
      endpoint: subscription.endpoint,
      keys: { p256dh: subscription.p256dh, auth: subscription.auth },
    },
    JSON.stringify(payload)
  )
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const today = new Date()
    const in7days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const in30days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const todayStr = today.toISOString().split('T')[0]

    // Get products expiring in 7 or 30 days
    const { data: products } = await supabase
      .from('products')
      .select('id, name, user_id, expiry_date')
      .not('expiry_date', 'is', null)
      .gte('expiry_date', todayStr)
      .lte('expiry_date', in30days)

    if (!products?.length) {
      return new Response(JSON.stringify({ sent: 0 }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Group by user
    const byUser = products.reduce((acc: Record<string, typeof products>, p) => {
      if (!acc[p.user_id]) acc[p.user_id] = []
      acc[p.user_id].push(p)
      return acc
    }, {})

    let sent = 0

    for (const [userId, userProducts] of Object.entries(byUser)) {
      const { data: subs } = await supabase
        .from('push_subscriptions')
        .select('endpoint, p256dh, auth')
        .eq('user_id', userId)

      if (!subs?.length) continue

      // Check if any expire in 7 days
      const urgent = userProducts.filter(p => p.expiry_date <= in7days)
      const soon = userProducts.filter(p => p.expiry_date > in7days)

      let title = '⚠️ Prodotti in scadenza'
      let body = ''

      if (urgent.length > 0) {
        title = '🚨 Scadenza imminente!'
        body = urgent.length === 1
          ? `${urgent[0].name} scade entro 7 giorni`
          : `${urgent.length} prodotti scadono entro 7 giorni`
      } else if (soon.length > 0) {
        body = soon.length === 1
          ? `${soon[0].name} scade entro 30 giorni`
          : `${soon.length} prodotti scadono entro 30 giorni`
      }

      const payload = { title, body, url: '/magazzino', tag: 'expiry' }

      for (const sub of subs) {
        try {
          await sendPush(sub, payload)
          sent++
        } catch {
          // Subscription expired — remove it
          await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
        }
      }
    }

    return new Response(JSON.stringify({ sent }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
