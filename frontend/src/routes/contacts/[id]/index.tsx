import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { format, parse } from 'date-fns'
import { toast } from 'sonner'
import { useContacts } from '@/hooks/useContacts'
import type { Tables, TablesUpdate } from '@/lib/database.types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DatePicker } from '@/components/ui/date-picker'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Pencil, Save, X, Trash2, Archive, ArchiveRestore } from 'lucide-react'

type Contact = Tables<'contact'>

export default function ContactDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getContact, updateContact, deleteContact, archiveContact, unarchiveContact } = useContacts()

  const contact = getContact(Number(id))

  const [editMode, setEditMode] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [archiveConfirmOpen, setArchiveConfirmOpen] = useState(false)
  const [formData, setFormData] = useState<Contact | null>(contact || null)

  const isArchived = contact?.archived ?? false

  if (!contact || !formData) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Contact Not Found</h2>
              <p className="text-muted-foreground mb-4">The contact you're looking for doesn't exist.</p>
              <Link to="/contacts">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Contacts
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set'
    // Parse as date-only string and format
    const date = parse(dateString.split('T')[0], 'yyyy-MM-dd', new Date())
    return format(date, 'MMMM d, yyyy')
  }
  
  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error('Name is required')
      return
    }
    
    // Exit edit mode immediately for instant feedback
    setEditMode(false)
    
    const data: TablesUpdate<'contact'> = {
      name: formData.name.trim(),
      email: formData.email?.trim() || null,
      phone: formData.phone?.trim() || null,
      birthday: formData.birthday || null
    }
    
    // Show toast with promise
    toast.promise(
      updateContact(formData.id, data),
      {
        loading: 'Saving changes...',
        success: 'Contact updated successfully',
        error: (err) => {
          // Revert to edit mode on error
          setEditMode(true)
          return `Failed to save: ${err.message || 'Unknown error'}`
        },
      }
    )
  }
  
  const handleCancel = () => {
    setFormData(contact)
    setEditMode(false)
  }
  
  const handleDelete = () => {
    setDeleteConfirmOpen(false)

    toast.promise(
      deleteContact(contact.id).then(() => navigate('/contacts')),
      {
        loading: 'Deleting contact...',
        success: 'Contact deleted successfully',
        error: (err) => `Failed to delete: ${err.message || 'Unknown error'}`,
      }
    )
  }

  const handleArchive = () => {
    setArchiveConfirmOpen(false)

    toast.promise(
      archiveContact(contact.id),
      {
        loading: 'Archiving contact...',
        success: 'Contact archived successfully',
        error: (err) => `Failed to archive: ${err.message || 'Unknown error'}`,
      }
    )
  }

  const handleUnarchive = () => {
    toast.promise(
      unarchiveContact(contact.id),
      {
        loading: 'Restoring contact...',
        success: 'Contact restored successfully',
        error: (err) => `Failed to restore: ${err.message || 'Unknown error'}`,
      }
    )
  }
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Navigation Header */}
      <div>
        <Link to="/contacts">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Contacts
          </Button>
        </Link>
      </div>
      
      {/* Contact Details Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="text-2xl">{contact.name}</CardTitle>
              {isArchived && <Badge variant="secondary">Archived</Badge>}
            </div>
            <div className="flex items-center gap-2">
              {contact.archived ? (
                <Button variant="outline" size="sm" onClick={handleUnarchive}>
                  <ArchiveRestore className="mr-2 h-4 w-4" />
                  Unarchive
                </Button>
              ) : (
                <>
                  {!editMode ? (
                    <Button variant="outline" size="sm" onClick={() => setEditMode(true)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" size="sm" onClick={handleCancel}>
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleSave}>
                        <Save className="mr-2 h-4 w-4" />
                        Save
                      </Button>
                    </>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setArchiveConfirmOpen(true)}
                  >
                    <Archive className="mr-2 h-4 w-4" />
                    Archive
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteConfirmOpen(true)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {editMode ? (
              // Edit Mode
              <>
                <div className="grid gap-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <DatePicker
                  date={formData.birthday?.split('T')[0] || null}
                  onDateChange={(date) => setFormData({ ...formData, birthday: date })}
                  placeholder="Select birthday"
                  label="Birthday"
                  id="birthday"
                />
              </>
            ) : (
              // View Mode
              <>
                <div className="grid gap-1">
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="text-lg">{contact.email || 'Not provided'}</p>
                </div>
                <div className="grid gap-1">
                  <Label className="text-muted-foreground">Phone</Label>
                  <p className="text-lg">{contact.phone || 'Not provided'}</p>
                </div>
                <div className="grid gap-1">
                  <Label className="text-muted-foreground">Birthday</Label>
                  <p className="text-lg">{formatDate(contact.birthday)}</p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Tabs for future features */}
      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="notes" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="interactions">Interactions</TabsTrigger>
            </TabsList>
            <TabsContent value="notes" className="space-y-4">
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg font-medium mb-2">Notes Coming Soon</p>
                <p className="text-sm">
                  Add a notes field to your database to start tracking notes about your contacts.
                </p>
              </div>
            </TabsContent>
            <TabsContent value="interactions" className="space-y-4">
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg font-medium mb-2">Interactions Coming Soon</p>
                <p className="text-sm">
                  Create an interactions table in your database to start tracking your communication history.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {contact.name}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Archive Confirmation Dialog */}
      <AlertDialog open={archiveConfirmOpen} onOpenChange={setArchiveConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive contact?</AlertDialogTitle>
            <AlertDialogDescription>
              {contact.name} will be moved to the archive. You can restore them later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchive}>
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
