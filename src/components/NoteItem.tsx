"use client"

import { formatDate } from "../utils"
import type { Note } from "../types"
import { useState, useEffect } from "react"

interface NoteItemProps {
  note: Note
  onEdit: (note: Note) => void
  onDelete: (id: number, title: string) => void
  onArchive: (note: Note) => void
  isArchived: boolean
  isBeingEdited?: boolean
}

// Función para generar un color de fondo basado en el ID de la nota
const getNoteColor = (id: number): string => {
  const colors = [
    "from-amber-50 to-amber-100 border-amber-200 dark:from-slate-800 dark:to-amber-950 dark:border-amber-900",
    "from-emerald-50 to-emerald-100 border-emerald-200 dark:from-slate-800 dark:to-emerald-950 dark:border-emerald-900",
    "from-sky-50 to-sky-100 border-sky-200 dark:from-slate-800 dark:to-sky-950 dark:border-sky-900",
    "from-violet-50 to-violet-100 border-violet-200 dark:from-slate-800 dark:to-violet-950 dark:border-violet-900",
    "from-rose-50 to-rose-100 border-rose-200 dark:from-slate-800 dark:to-rose-950 dark:border-rose-900",
  ]
  return colors[id % colors.length]
}

const NoteItem = ({ note, onEdit, onDelete, onArchive, isArchived, isBeingEdited = false }: NoteItemProps) => {
  const [isNew, setIsNew] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isHighlighted, setIsHighlighted] = useState(false)

  // Efecto para notas nuevas
  useEffect(() => {
    setIsNew(true)
    const timer = setTimeout(() => setIsNew(false), 500)
    return () => clearTimeout(timer)
  }, [])

  // Efecto para resaltar cuando se está editando
  useEffect(() => {
    if (isBeingEdited) {
      setIsHighlighted(true)
      const timer = setTimeout(() => setIsHighlighted(false), 1000)
      return () => clearTimeout(timer)
    }
  }, [isBeingEdited])

  // Manejar posibles errores de fecha
  const displayDate = () => {
    try {
      return formatDate(note.creationDate)
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Invalid date"
    }
  }

  const colorClass = getNoteColor(note.id)

  // Función para manejar la eliminación con animación
  const handleDelete = () => {
    setIsDeleting(true)
    // Esperar a que termine la animación antes de eliminar realmente
    setTimeout(() => {
      onDelete(note.id, note.title)
    }, 200)
  }

  return (
    <div
      className={`note-item bg-gradient-to-br ${colorClass} p-5 rounded-lg shadow-md border transition-all duration-300 hover:shadow-lg ${
        isNew ? "animate-slide-in" : ""
      } ${isDeleting ? "animate-fade-out" : ""} ${isHighlighted ? "animate-highlight" : ""}`}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-semibold text-slate-800 dark:text-white">{note.title}</h3>
        <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">{displayDate()}</div>
      </div>

      <div className="mb-4 whitespace-pre-wrap text-slate-700 dark:text-slate-300">{note.content}</div>

      {note.tags && note.tags.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {note.tags.map((tag) => (
            <span
              key={tag}
              className="bg-white/60 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 text-xs px-2.5 py-1 rounded-full font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex space-x-2 mt-4">
        <button
          onClick={() => onEdit(note)}
          className="bg-teal-600 hover:bg-teal-700 text-white px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors duration-200"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="bg-red-500 hover:bg-red-600 text-white px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors duration-200"
        >
          Delete
        </button>
        <button
          onClick={() => onArchive(note)}
          className={`${
            isArchived ? "bg-emerald-600 hover:bg-emerald-700" : "bg-amber-500 hover:bg-amber-600"
          } text-white px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors duration-200`}
        >
          {isArchived ? "Unarchive" : "Archive"}
        </button>
      </div>
    </div>
  )
}

export default NoteItem
