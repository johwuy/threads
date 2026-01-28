import { createContext, useCallback, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import type { Tables, TablesInsert, TablesUpdate } from '@/lib/database.types'

type Contact = Tables<'contact'>
type SortField = 'birthday' | 'name'
type SortDirection = 'asc' | 'desc'

export interface ContactsContextType {
  // State
  contacts: Contact[]
  loading: boolean
  sortField: SortField
  sortDirection: SortDirection
  
  // CRUD Operations
  createContact: (data: TablesInsert<'contact'>) => Promise<void>
  updateContact: (id: number, data: TablesUpdate<'contact'>) => Promise<void>
  deleteContact: (id: number) => Promise<void>
  getContact: (id: number) => Contact | undefined
  
  // Utilities
  setSorting: (field: SortField, direction: SortDirection) => void
  refreshContacts: () => Promise<void>
}

// eslint-disable-next-line react-refresh/only-export-components
export const ContactsContext = createContext<ContactsContextType | null>(null)

interface ContactsProviderProps {
  children: ReactNode
}

export function ContactsProvider({ children }: ContactsProviderProps) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [sortField, setSortField] = useState<SortField>('birthday')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('contact')
        .select('*')
        .order(sortField, { ascending: sortDirection === 'asc', nullsFirst: false })

      if (error) throw error
      setContacts(data || [])
    } catch (error) {
      console.error('Error fetching contacts:', error)
    } finally {
      setLoading(false)
    }
  }, [sortField, sortDirection])

  useEffect(() => {
    fetchContacts()
  }, [fetchContacts])

  const createContact = useCallback(async (data: TablesInsert<'contact'>) => {
    try {
      const { error } = await supabase.from('contact').insert(data)
      if (error) throw error
      await fetchContacts()
    } catch (error) {
      console.error('Error creating contact:', error)
      throw error
    }
  }, [fetchContacts])

  const updateContact = useCallback(async (id: number, data: TablesUpdate<'contact'>) => {
    try {
      const { error } = await supabase
        .from('contact')
        .update(data)
        .eq('id', id)
      if (error) throw error
      await fetchContacts()
    } catch (error) {
      console.error('Error updating contact:', error)
      throw error
    }
  }, [fetchContacts])

  const deleteContact = useCallback(async (id: number) => {
    try {
      const { error } = await supabase
        .from('contact')
        .delete()
        .eq('id', id)
      if (error) throw error
      await fetchContacts()
    } catch (error) {
      console.error('Error deleting contact:', error)
      throw error
    }
  }, [fetchContacts])

  const getContact = useCallback((id: number) => {
    return contacts.find(c => c.id === id)
  }, [contacts])

  const setSorting = useCallback((field: SortField, direction: SortDirection) => {
    setSortField(field)
    setSortDirection(direction)
  }, [])

  const refreshContacts = useCallback(async () => {
    await fetchContacts()
  }, [fetchContacts])

  const value: ContactsContextType = {
    contacts,
    loading,
    sortField,
    sortDirection,
    createContact,
    updateContact,
    deleteContact,
    getContact,
    setSorting,
    refreshContacts,
  }

  return (
    <ContactsContext.Provider value={value}>
      {children}
    </ContactsContext.Provider>
  )
}
