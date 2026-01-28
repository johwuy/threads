import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format, parse } from 'date-fns'
import { toast } from 'sonner'
import { useContacts } from '@/hooks/useContacts'
import type { Tables } from '@/lib/database.types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DatePicker } from '@/components/ui/date-picker'
import { ArrowUpDown, ArrowUp, ArrowDown, Plus, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'

type Contact = Tables<'contact'>
type SortField = 'birthday' | 'name'
type SortDirection = 'asc' | 'desc'

// Sort icon component defined outside to avoid recreation on every render
function SortIcon({ field, sortField, sortDirection }: { 
  field: SortField
  sortField: SortField
  sortDirection: SortDirection
}) {
  if (sortField !== field) {
    return <ArrowUpDown className="ml-2 h-4 w-4" />
  }
  return sortDirection === 'asc' ? (
    <ArrowUp className="ml-2 h-4 w-4" />
  ) : (
    <ArrowDown className="ml-2 h-4 w-4" />
  )
}

export default function Contacts() {
  const navigate = useNavigate()
  const { contacts, loading, sortField, sortDirection, createContact, updateContact, deleteContact, setSorting } = useContacts()
  
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    birthday: null as string | null
  })

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSorting(field, sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSorting(field, 'asc')
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    // Parse as date-only string and format
    const date = parse(dateString.split('T')[0], 'yyyy-MM-dd', new Date())
    return format(date, 'MMM d, yyyy')
  }

  const openAddDialog = () => {
    setEditingContact(null)
    setFormData({ name: '', email: '', phone: '', birthday: null })
    setDialogOpen(true)
  }

  const openEditDialog = (contact: Contact, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingContact(contact)
    setFormData({
      name: contact.name,
      email: contact.email || '',
      phone: contact.phone || '',
      birthday: contact.birthday?.split('T')[0] || null
    })
    setDialogOpen(true)
  }

  const openDeleteDialog = (contact: Contact, e: React.MouseEvent) => {
    e.stopPropagation()
    setContactToDelete(contact)
    setDeleteConfirmOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast.error('Name is required')
      return
    }

    const data = {
      name: formData.name.trim(),
      email: formData.email.trim() || null,
      phone: formData.phone.trim() || null,
      birthday: formData.birthday || null
    }

    const isEditing = editingContact !== null
    const promise = isEditing 
      ? updateContact(editingContact.id, data)
      : createContact(data)

    // Close dialog immediately for instant feedback
    setDialogOpen(false)
    setFormData({ name: '', email: '', phone: '', birthday: null })

    toast.promise(
      promise,
      {
        loading: isEditing ? 'Updating contact...' : 'Creating contact...',
        success: isEditing ? 'Contact updated successfully' : 'Contact created successfully',
        error: (err) => `Failed to save: ${err.message || 'Unknown error'}`,
      }
    )
  }

  const handleDelete = () => {
    if (!contactToDelete) return
    
    const contactName = contactToDelete.name
    setDeleteConfirmOpen(false)
    setContactToDelete(null)
    
    toast.promise(
      deleteContact(contactToDelete.id),
      {
        loading: 'Deleting contact...',
        success: `${contactName} deleted successfully`,
        error: (err) => `Failed to delete: ${err.message || 'Unknown error'}`,
      }
    )
  }

  const handleRowClick = (contactId: number) => {
    navigate(`/contacts/${contactId}`)
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Contacts</CardTitle>
            </div>
            <Button onClick={openAddDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add Contact
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading contacts...</div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No contacts found. Add your first contact to get started!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('name')}
                      className="flex items-center hover:bg-transparent p-0 h-auto font-medium"
                    >
                      Name
                      <SortIcon field="name" sortField={sortField} sortDirection={sortDirection} />
                    </Button>
                  </TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('birthday')}
                      className="flex items-center hover:bg-transparent p-0 h-auto font-medium"
                    >
                      Birthday
                      <SortIcon field="birthday" sortField={sortField} sortDirection={sortDirection} />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((contact) => (
                  <TableRow 
                    key={contact.id}
                    className="cursor-pointer"
                    onClick={() => handleRowClick(contact.id)}
                  >
                    <TableCell className="font-medium">{contact.name}</TableCell>
                    <TableCell>{contact.email || '-'}</TableCell>
                    <TableCell>{contact.phone || '-'}</TableCell>
                    <TableCell>{formatDate(contact.birthday)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => openEditDialog(contact, e)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => openDeleteDialog(contact, e)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingContact ? 'Edit Contact' : 'Add Contact'}</DialogTitle>
            <DialogDescription>
              {editingContact ? 'Update contact information' : 'Add a new contact to your list'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="555-0100"
                />
              </div>
              <DatePicker
                date={formData.birthday}
                onDateChange={(date) => setFormData({ ...formData, birthday: date })}
                placeholder="Select birthday"
                label="Birthday"
                id="birthday"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingContact ? 'Save Changes' : 'Add Contact'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {contactToDelete?.name}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
