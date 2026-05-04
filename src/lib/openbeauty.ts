export interface OpenBeautyProduct {
  name: string
  brand: string
  category: string
  ingredients: string[]
  image_url: string | null
}

export async function lookupBarcode(barcode: string): Promise<OpenBeautyProduct | null> {
  const res = await fetch(
    `https://world.openbeautyfacts.org/api/v0/product/${barcode}.json`,
    { signal: AbortSignal.timeout(8000) }
  )

  if (!res.ok) return null

  const data = await res.json()
  if (data.status !== 1 || !data.product) return null

  const p = data.product

  const name: string = p.product_name_it ?? p.product_name ?? ''
  const brand: string = p.brands ?? ''
  const category: string = mapCategory(p.categories ?? p.categories_tags?.[0] ?? '')

  const ingredientsText: string = p.ingredients_text_it ?? p.ingredients_text ?? ''
  const ingredients: string[] = ingredientsText
    ? ingredientsText.split(/,\s*/).map((s: string) => s.trim()).filter(Boolean)
    : []

  const image_url: string | null = p.image_front_url ?? p.image_url ?? null

  if (!name) return null

  return { name, brand, category, ingredients, image_url }
}

function mapCategory(raw: string): string {
  const r = raw.toLowerCase()
  if (r.includes('nail') || r.includes('smalto') || r.includes('vernis')) return 'Smalto'
  if (r.includes('serum') || r.includes('siero')) return 'Siero'
  if (r.includes('shampoo')) return 'Shampoo'
  if (r.includes('conditioner') || r.includes('balsamo')) return 'Balsamo'
  if (r.includes('mascara') || r.includes('foundation') || r.includes('blush') || r.includes('ombretto')) return 'Make-up'
  if (r.includes('sun') || r.includes('spf') || r.includes('solare')) return 'SPF'
  if (r.includes('mask') || r.includes('maschera')) return 'Maschera'
  if (r.includes('cleanser') || r.includes('detergente') || r.includes('mousse')) return 'Detergente'
  if (r.includes('toner') || r.includes('tonico')) return 'Tonico'
  if (r.includes('eye') || r.includes('occhi')) return 'Contorno occhi'
  if (r.includes('oil') || r.includes('olio')) return 'Olio'
  if (r.includes('cream') || r.includes('crema') || r.includes('body')) return 'Crema corpo'
  return 'Altro'
}
