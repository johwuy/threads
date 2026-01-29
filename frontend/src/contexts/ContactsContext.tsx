import { createContext, useCallback, useEffect, useState, useMemo, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import type { Tables, TablesInsert, TablesUpdate } from '@/lib/database.types'

type Contact = Tables<'contact'>
type SortField = 'birthday' | 'name'
type SortDirection = 'asc' | 'desc'

// Calculate days until next birthday from today
function getDaysUntilBirthday(birthdayStr: string | null): number {
  if (!birthdayStr) return Infinity // Contacts without birthdays go to the end

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const birthday = new Date(birthdayStr.split('T')[0])
  const thisYearBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate())

  // If birthday has passed this year, use next year's birthday
  if (thisYearBirthday < today) {
    thisYearBirthday.setFullYear(today.getFullYear() + 1)
  }

  const diffTime = thisYearBirthday.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export interface ContactsContextType {
  // State
  contacts: Contact[]
  loading: boolean
  sortField: SortField
  sortDirection: SortDirection
  showArchived: boolean

  // CRUD Operations
  createContact: (data: TablesInsert<'contact'>) => Promise<void>
  updateContact: (id: number, data: TablesUpdate<'contact'>) => Promise<void>
  deleteContact: (id: number) => Promise<void>
  getContact: (id: number) => Contact | undefined
  archiveContact: (id: number) => Promise<void>
  unarchiveContact: (id: number) => Promise<void>

  // Utilities
  setSorting: (field: SortField, direction: SortDirection) => void
  setShowArchived: (show: boolean) => void
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
  const [showArchived, setShowArchived] = useState(false)

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true)
      let query = supabase.from('contact').select('*')

      // When showArchived is false, only show active contacts
      // When showArchived is true, show all contacts
      if (!showArchived) {
        query = query.eq('archived', false)
      }

      const { data, error } = await query

      if (error) throw error
      setContacts(data || [])
    } catch (error) {
      console.error('Error fetching contacts:', error)
    } finally {
      setLoading(false)
    }
  }, [showArchived])

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

  const archiveContact = useCallback(async (id: number) => {
    try {
      const { error } = await supabase
        .from('contact')
        .update({ archived: true })
        .eq('id', id)
      if (error) throw error
      await fetchContacts()
    } catch (error) {
      console.error('Error archiving contact:', error)
      throw error
    }
  }, [fetchContacts])

  const unarchiveContact = useCallback(async (id: number) => {
    try {
      const { error } = await supabase
        .from('contact')
        .update({ archived: false })
        .eq('id', id)
      if (error) throw error
      await fetchContacts()
    } catch (error) {
      console.error('Error unarchiving contact:', error)
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

  // Sort contacts client-side
  const sortedContacts = useMemo(() => {
    const sorted = [...contacts]

    if (sortField === 'birthday') {
      // Sort by days until next birthday
      sorted.sort((a, b) => {
        const daysA = getDaysUntilBirthday(a.birthday)
        const daysB = getDaysUntilBirthday(b.birthday)
        return sortDirection === 'asc' ? daysA - daysB : daysB - daysA
      })
    } else {
      // Sort by name
      sorted.sort((a, b) => {
        const nameA = a.name.toLowerCase()
        const nameB = b.name.toLowerCase()
        const comparison = nameA.localeCompare(nameB)
        return sortDirection === 'asc' ? comparison : -comparison
      })
    }

    return sorted
  }, [contacts, sortField, sortDirection])

  const value: ContactsContextType = {
    contacts: sortedContacts,
    loading,
    sortField,
    sortDirection,
    showArchived,
    createContact,
    updateContact,
    deleteContact,
    getContact,
    archiveContact,
    unarchiveContact,
    setSorting,
    setShowArchived,
    refreshContacts,
  }

  return (
    <ContactsContext.Provider value={value}>
      {children}
    </ContactsContext.Provider>
  )
}
