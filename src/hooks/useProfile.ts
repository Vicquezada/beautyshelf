import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { UserProfile } from '../types'

export function useProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async () => {
    if (!userId) { setLoading(false); return }
    setLoading(true)
    try {
      const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()
      setProfile(data ?? null)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => { fetchProfile() }, [fetchProfile])

  const saveProfile = async (values: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>) => {
    if (!userId) return
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({ id: userId, ...values })
      .select()
      .single()
    if (error) throw error
    setProfile(data)
  }

  return { profile, loading, saveProfile, refetch: fetchProfile }
}
