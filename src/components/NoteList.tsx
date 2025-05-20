import type { Note } from "../types"
import NoteItem from "./NoteItem"

interface NoteListProps {
  notes: Note[]
  onEdit: (note: Note) => void
  onDelete: (id: number, title: string) => void
  onArchive: (note: Note) => void
  isArchiveView: boolean
}

const NoteList = ({ notes, onEdit, onDelete, onArchive, isArchiveView }: NoteListProps) => {
  if (notes.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 p-8 rounded-lg text-center shadow-sm border border-slate-200 dark:border-slate-700">
        <p className="text-slate-500 dark:text-slate-400">
          {isArchiveView ? "No archived notes found." : "No active notes found. Create a new note to get started!"}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {notes.map((note) => (
        <NoteItem
          key={note.id}
          note={note}
          onEdit={onEdit}
          onDelete={onDelete}
          onArchive={onArchive}
          isArchived={isArchiveView}
        />
      ))}
    </div>
  )
}

export default NoteList
