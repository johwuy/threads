import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import type { Tables } from '@/lib/database.types'

type Note = Tables<'note'>

interface UseNotesReturn {
  notes: Note[]
  loading: boolean
  createNote(data: { date: string; content: string }): Promise<void>
  updateNote(id: string, data: { date?: string; content?: string }): Promise<void>
  deleteNote(id: string): Promise<void>
}

export function useNotes(contactId: string | undefined): UseNotesReturn {
  const { user } = useAuth()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)

  const fetchNotes = useCallback(async () => {
    if (!user || !contactId) {
      setNotes([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('note')
        .select('*')
        .eq('contact_id', contactId)
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (error) throw error
      setNotes(data || [])
    } catch (error) {
      console.error('Error fetching notes:', error)
    } finally {
      setLoading(false)
    }
  }, [user, contactId])

  useEffect(() => {
    fetchNotes().catch(console.error)
  }, [fetchNotes])

  const createNote = useCallback(async (data: { date: string; content: string }) => {
    if (!user) throw new Error('Must be logged in to create notes')
    if (!contactId) throw new Error('Contact ID is required')

    const { error } = await supabase.from('note').insert({
      ...data,
      contact_id: contactId,
      user_id: user.id,
    })
    if (error) throw error
    await fetchNotes()
  }, [user, contactId, fetchNotes])

  const updateNote = useCallback(async (id: string, data: { date?: string; content?: string }) => {
    const { error } = await supabase
      .from('note')
      .update(data)
      .eq('id', id)
    if (error) throw error
    await fetchNotes()
  }, [fetchNotes])

  const deleteNote = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('note')
      .delete()
      .eq('id', id)
    if (error) throw error
    await fetchNotes()
  }, [fetchNotes])

  return { notes, loading, createNote, updateNote, deleteNote }
}
