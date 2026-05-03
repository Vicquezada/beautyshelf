import { useState, useEffect, useCallback } from 'react'
import { differenceInDays, parseISO } from 'date-fns'
import { supabase } from '../lib/supabase'
import type { Product, QuantityHistoryEntry, ConsumptionStats, UserSupplier, PriceAlert } from '../types'

export function useAnalytics(products: Product[]) {
  const [history, setHistory] = useState<QuantityHistoryEntry[]>([])
  const [suppliers, setSuppliers] = useState<UserSupplier[]>([])
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const productIds = products.map(p => p.id)
      if (productIds.length === 0) {
        setLoading(false)
        return
      }

      const [histRes, suppRes, alertRes] = await Promise.all([
        supabase.from('quantity_history').select('*').in('product_id', productIds).order('recorded_at'),
        supabase.from('user_suppliers').select('*').order('name'),
        supabase.from('price_alerts').select('*').order('found_at', { ascending: false }),
      ])

      if (histRes.data) setHistory(histRes.data)
      if (suppRes.data) setSuppliers(suppRes.data)
      if (alertRes.data) setPriceAlerts(alertRes.data)
    } finally {
      setLoading(false)
    }
  }, [products])

  useEffect(() => { fetchData() }, [fetchData])

  const getConsumptionStats = useCallback((): ConsumptionStats[] => {
    return products.map(product => {
      const productHistory = history
        .filter(h => h.product_id === product.id)
        .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())

      // Count cycles: alta→bassa transitions
      const cycles: number[] = []
      let cycleStart: string | null = null

      for (const entry of productHistory) {
        if (entry.quantity === 'alta' && cycleStart === null) {
          cycleStart = entry.recorded_at
        } else if (entry.quantity === 'bassa' && cycleStart !== null) {
          cycles.push(differenceInDays(parseISO(entry.recorded_at), parseISO(cycleStart)))
          cycleStart = null
        }
      }

      const avgDays = cycles.length >= 2
        ? cycles.reduce((a, b) => a + b, 0) / cycles.length
        : null

      let predictedRunout: string | null = null
      if (avgDays && product.quantity !== 'alta') {
        const lastHigh = [...productHistory].reverse().find(h => h.quantity === 'alta')
        if (lastHigh) {
          const runoutDate = new Date(lastHigh.recorded_at)
          runoutDate.setDate(runoutDate.getDate() + avgDays)
          predictedRunout = runoutDate.toISOString()
        }
      }

      return {
        product_id: product.id,
        product_name: product.name,
        brand: product.brand,
        days_per_cycle: avgDays ? Math.round(avgDays) : null,
        predicted_runout: predictedRunout,
        cycles_recorded: cycles.length,
      }
    })
  }, [products, history])

  const getBrandStats = useCallback(() => {
    const brandMap = new Map<string, { count: number; products: string[] }>()
    for (const p of products) {
      const brand = p.brand ?? 'Senza brand'
      if (!brandMap.has(brand)) brandMap.set(brand, { count: 0, products: [] })
      const entry = brandMap.get(brand)!
      entry.count++
      entry.products.push(p.name)
    }
    return Array.from(brandMap.entries())
      .map(([brand, stats]) => ({ brand, ...stats }))
      .sort((a, b) => b.count - a.count)
  }, [products])

  const addSupplier = async (name: string, url: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Non autenticato')

    const { data, error } = await supabase
      .from('user_suppliers')
      .insert({ name, url, user_id: user.id })
      .select()
      .single()
    if (error) throw error
    setSuppliers(prev => [...prev, data])
  }

  const deleteSupplier = async (id: string) => {
    const { error } = await supabase.from('user_suppliers').delete().eq('id', id)
    if (error) throw error
    setSuppliers(prev => prev.filter(s => s.id !== id))
  }

  return {
    history,
    suppliers,
    priceAlerts,
    loading,
    getConsumptionStats,
    getBrandStats,
    addSupplier,
    deleteSupplier,
    refetch: fetchData,
  }
}
