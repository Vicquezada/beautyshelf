import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Product, QuantityLevel } from '../types'

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setProducts(data ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Errore caricamento prodotti')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const addProduct = async (
    product: Omit<Product, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ): Promise<Product> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Non autenticato')

    const { data, error } = await supabase
      .from('products')
      .insert({ ...product, user_id: user.id })
      .select()
      .single()
    if (error) throw error

    await supabase.from('quantity_history').insert({
      product_id: data.id,
      quantity: product.quantity,
    })

    setProducts(prev => [data, ...prev])
    return data
  }

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    const { data, error } = await supabase
      .from('products')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    setProducts(prev => prev.map(p => p.id === id ? data : p))
  }

  const updateQuantity = async (id: string, quantity: QuantityLevel) => {
    const { error } = await supabase
      .from('products')
      .update({ quantity, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error

    await supabase.from('quantity_history').insert({ product_id: id, quantity })
    setProducts(prev => prev.map(p => p.id === id ? { ...p, quantity } : p))
  }

  const deleteProduct = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) throw error
    setProducts(prev => prev.filter(p => p.id !== id))
  }

  const flagProduct = async (id: string, flag_reason: string) => {
    const { error } = await supabase
      .from('products')
      .update({ flagged: true, flag_reason, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
    setProducts(prev => prev.map(p => p.id === id ? { ...p, flagged: true, flag_reason } : p))
  }

  return { products, loading, error, addProduct, updateProduct, updateQuantity, deleteProduct, flagProduct, refetch: fetchProducts }
}
