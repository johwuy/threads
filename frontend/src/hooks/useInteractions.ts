import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import type { Tables } from '@/lib/database.types'

type Interaction = Tables<'interaction'>
type Rating = 'happy' | 'neutral' | 'sad'

interface UseInteractionsReturn {
  interactions: Interaction[]
  loading: boolean
  createInteraction(data: { date: string; content: string; rating: Rating }): Promise<void>
  updateInteraction(id: string, data: { date?: string; content?: string; rating?: Rating }): Promise<void>
  deleteInteraction(id: string): Promise<void>
}

export function useInteractions(contactId: string | undefined): UseInteractionsReturn {
  const { user } = useAuth()
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [loading, setLoading] = useState(true)

  const fetchInteractions = useCallback(async () => {
    if (!user || !contactId) {
      setInteractions([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('interaction')
        .select('*')
        .eq('contact_id', contactId)
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (error) throw error
      setInteractions(data || [])
    } catch (error) {
      console.error('Error fetching interactions:', error)
    } finally {
      setLoading(false)
    }
  }, [user, contactId])

  useEffect(() => {
    fetchInteractions().catch(console.error)
  }, [fetchInteractions])

  const createInteraction = useCallback(async (data: { date: string; content: string; rating: Rating }) => {
    if (!user) throw new Error('Must be logged in to create interactions')
    if (!contactId) throw new Error('Contact ID is required')

    const { error } = await supabase.from('interaction').insert({
      ...data,
      contact_id: contactId,
      user_id: user.id,
    })
    if (error) throw error
    await fetchInteractions()
  }, [user, contactId, fetchInteractions])

  const updateInteraction = useCallback(async (id: string, data: { date?: string; content?: string; rating?: Rating }) => {
    const { error } = await supabase
      .from('interaction')
      .update(data)
      .eq('id', id)
    if (error) throw error
    await fetchInteractions()
  }, [fetchInteractions])

  const deleteInteraction = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('interaction')
      .delete()
      .eq('id', id)
    if (error) throw error
    await fetchInteractions()
  }, [fetchInteractions])

  return { interactions, loading, createInteraction, updateInteraction, deleteInteraction }
}
