"use client"

import { useState, useEffect } from "react"
import type { Note } from "../types"
import NoteItem from "./NoteItem"

interface NoteListProps {
  notes: Note[]
  onEdit: (note: Note) => void
  onDelete: (id: number, title: string) => void
  onArchive: (note: Note) => void
  isArchiveView: boolean
  editingNoteId?: number | null
}

const NoteList = ({ notes, onEdit, onDelete, onArchive, isArchiveView, editingNoteId }: NoteListProps) => {
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Efecto para animar la transición cuando cambia la vista o las notas
  useEffect(() => {
    setIsTransitioning(true)
    const timer = setTimeout(() => setIsTransitioning(false), 10)
    return () => clearTimeout(timer)
  }, [isArchiveView, notes.length])

  if (notes.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 p-8 rounded-lg text-center shadow-sm border border-slate-200 dark:border-slate-700 animate-cross-fade">
        <p className="text-slate-500 dark:text-slate-400">
          {isArchiveView ? "No archived notes found." : "No active notes found. Create a new note to get started!"}
        </p>
      </div>
    )
  }

  return (
    <div className={`space-y-6 notes-container ${isTransitioning ? "opacity-0" : "opacity-100 animate-cross-fade"}`}>
      {notes.map((note) => (
        <NoteItem
          key={note.id}
          note={note}
          onEdit={onEdit}
          onDelete={onDelete}
          onArchive={onArchive}
          isArchived={isArchiveView}
          isBeingEdited={editingNoteId === note.id}
        />
      ))}
    </div>
  )
}

export default NoteList
