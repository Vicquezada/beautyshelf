import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Normativa, Product } from '../types'

export function useNormative(products: Product[] = []) {
  const [normative, setNormative] = useState<Normativa[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNormative = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('normative')
        .select('*')
        .order('date', { ascending: false })
      if (error) throw error
      setNormative(data ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Errore caricamento normative')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchNormative() }, [fetchNormative])

  // Returns products affected by a normativa based on ingredient matching
  const getAffectedProducts = (normativa: Normativa): Product[] => {
    if (!normativa.affected_ingredients?.length) return []
    const affected = normativa.affected_ingredients.map(i => i.toLowerCase())
    return products.filter(p =>
      p.ingredients?.some(ing => affected.some(a => ing.toLowerCase().includes(a)))
    )
  }

  // Returns normative that affect at least one product in the warehouse
  const relevantNormative = normative.filter(n => getAffectedProducts(n).length > 0)

  return { normative, loading, error, getAffectedProducts, relevantNormative, refetch: fetchNormative }
}
