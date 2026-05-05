export type QuantityLevel = 'alta' | 'media' | 'bassa'
export type Severity = 'urgente' | 'attenzione' | 'info'

export interface Product {
  id: string
  user_id: string
  name: string
  brand: string | null
  category: string | null
  expiry_date: string | null
  quantity: QuantityLevel
  flagged: boolean
  flag_reason: string | null
  ingredients: string[] | null
  image_urls: string[] | null
  created_at: string
  updated_at: string
}

export interface QuantityHistoryEntry {
  id: string
  product_id: string
  quantity: QuantityLevel
  recorded_at: string
}

export interface Normativa {
  id: string
  title: string
  date: string
  summary: string | null
  category: string | null
  severity: Severity
  affected_ingredients: string[] | null
  source: string | null
  country: 'IT' | 'CH' | 'ALL'
  created_at: string
}

export type BusinessType = 'freelance' | 'salone'
export type Country = 'IT' | 'CH'
export type Specialization = 'viso' | 'corpo' | 'unghie' | 'epilazione' | 'massaggio' | 'trucco'
export type Gender = 'F' | 'M' | 'N'

export interface UserProfile {
  id: string
  display_name: string
  first_name: string | null
  gender: Gender
  business_type: BusinessType
  country: Country
  city: string | null
  specializations: Specialization[]
  created_at: string
  updated_at: string
}

export interface UserSupplier {
  id: string
  user_id: string
  name: string
  url: string
  created_at: string
}

export interface PriceAlert {
  id: string
  user_id: string
  product_id: string
  supplier_id: string
  original_price: number | null
  discounted_price: number | null
  url: string | null
  found_at: string
  product?: Product
  supplier?: UserSupplier
}

export interface ClaudeProductResult {
  name: string
  brand: string
  category: string
  expiry_date: string | null
  ingredients: string[]
  expiry_found: boolean
}

export interface ConsumptionStats {
  product_id: string
  product_name: string
  brand: string | null
  days_per_cycle: number | null
  predicted_runout: string | null
  cycles_recorded: number
}
