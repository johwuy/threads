import { useState } from 'react'
import { format, parse } from 'date-fns'
import { toast } from 'sonner'
import { useNotes } from '@/hooks/useNotes'
import type { Tables } from '@/lib/database.types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { DatePicker } from '@/components/ui/date-picker'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Plus, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'

type Note = Tables<'note'>

interface NotesTabProps {
  contactId: string
  contactName: string
}

export function NotesTab({ contactId, contactName }: NotesTabProps) {
  const { notes, loading, createNote, updateNote, deleteNote } = useNotes(contactId)

  const [noteDialogOpen, setNoteDialogOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [noteFormData, setNoteFormData] = useState({ date: '', content: '' })
  const [noteDeleteConfirmOpen, setNoteDeleteConfirmOpen] = useState(false)
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null)

  const formatDate = (dateString: string) => {
    const date = parse(dateString, 'yyyy-MM-dd', new Date())
    return format(date, 'MMMM d, yyyy')
  }

  const openAddDialog = () => {
    setEditingNote(null)
    setNoteFormData({ date: format(new Date(), 'yyyy-MM-dd'), content: '' })
    setNoteDialogOpen(true)
  }

  const openEditDialog = (note: Note) => {
    setEditingNote(note)
    setNoteFormData({ date: note.date, content: note.content })
    setNoteDialogOpen(true)
  }

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!noteFormData.content.trim()) return toast.error('Note content is required')
    if (!noteFormData.date) return toast.error('Date is required')

    const promise = editingNote
      ? updateNote(editingNote.id, noteFormData)
      : createNote(noteFormData)
    setNoteDialogOpen(false)
    toast.promise(promise, {
      loading: editingNote ? 'Updating note...' : 'Creating note...',
      success: editingNote ? 'Note updated' : 'Note created',
      error: (err) => `Failed to save: ${err.message}`,
    })
  }

  const handleDelete = () => {
    if (!noteToDelete) return
    setNoteDeleteConfirmOpen(false)
    toast.promise(deleteNote(noteToDelete.id), {
      loading: 'Deleting note...',
      success: 'Note deleted',
      error: (err) => `Failed to delete: ${err.message}`,
    })
    setNoteToDelete(null)
  }

  return (
    <>
      {!loading && (
        <div className="flex justify-end">
          <Button size="sm" onClick={openAddDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Add Note
          </Button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>Loading notes...</p>
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg font-medium mb-2">No notes yet</p>
          <p className="text-sm">Add a note about {contactName} to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <Card key={note.id}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground mb-1">{formatDate(note.date)}</p>
                    <p className="whitespace-pre-wrap">{note.content}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(note)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => { setNoteToDelete(note); setNoteDeleteConfirmOpen(true) }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Note Dialog */}
      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingNote ? 'Edit Note' : 'Add Note'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <DatePicker
              date={noteFormData.date || null}
              onDateChange={(date) => setNoteFormData({ ...noteFormData, date: date || '' })}
              placeholder="Select date"
              label="Date"
              id="note-date"
            />
            <div className="grid gap-2">
              <Label htmlFor="note-content">Content</Label>
              <textarea
                id="note-content"
                value={noteFormData.content}
                onChange={(e) => setNoteFormData({ ...noteFormData, content: e.target.value })}
                rows={4}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                placeholder="Write your note here..."
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setNoteDialogOpen(false)}>Cancel</Button>
              <Button type="submit">{editingNote ? 'Save Changes' : 'Add Note'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Note Confirmation */}
      <AlertDialog open={noteDeleteConfirmOpen} onOpenChange={setNoteDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete note?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this note. This action cannot be undone.
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
    </>
  )
}
