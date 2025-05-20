"use client"

import { useState, useEffect } from "react"
import NoteList from "./components/NoteList"
import NoteForm from "./components/NoteForm"
import TagFilter from "./components/TagFilter"
import Header from "./components/Header"
import DeleteConfirmationModal from "./components/DeleteConfirmationModal"
import type { Note } from "./types"
import { fetchNotes, fetchArchivedNotes, createNote, updateNote, deleteNote } from "./api"
import { authService } from "./services/authService"
import "./App.css"

function App() {
  const [notes, setNotes] = useState<Note[]>([])
  const [showArchived, setShowArchived] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isViewTransitioning, setIsViewTransitioning] = useState(false)

  // Estado para el modal de confirmación de eliminación
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [noteToDelete, setNoteToDelete] = useState<{ id: number; title: string } | null>(null)

  // Verificar autenticación al cargar
  useEffect(() => {
    setIsAuthenticated(authService.isAuthenticated())
  }, [])

  // Cargar notas cuando cambia showArchived o el estado de autenticación
  useEffect(() => {
    if (isAuthenticated) {
      loadNotes()
    } else {
      setNotes([])
      setIsLoading(false)
    }
  }, [showArchived, isAuthenticated])

  const loadNotes = async () => {
    if (!isAuthenticated) return

    setIsLoading(true)
    try {
      // Usar la función correcta según el estado de showArchived
      const fetchedNotes = showArchived ? await fetchArchivedNotes() : await fetchNotes()
      setNotes(fetchedNotes)
      setError(null)
    } catch (err: any) {
      if (err.message.includes("Authentication required")) {
        setIsAuthenticated(false)
        setError("Your session has expired. Please login again.")
      } else {
        setError("Failed to load notes. Please try again later.")
      }
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateNote = async (note: Omit<Note, "id" | "creationDate">): Promise<void> => {
    if (!isAuthenticated) {
      setError("You must be logged in to create notes.")
      return
    }

    try {
      const newNote = await createNote(note)
      // Solo actualizar la lista si estamos viendo notas activas
      if (!showArchived) {
        setNotes([...notes, newNote])
      }
    } catch (err: any) {
      if (err.message.includes("Authentication required")) {
        setIsAuthenticated(false)
        setError("Your session has expired. Please login again.")
      } else {
        setError("Failed to create note. Please try again.")
      }
      console.error(err)
    }
  }

  const handleUpdateNote = async (updatedNote: Note | Omit<Note, "id" | "creationDate">): Promise<void> => {
    if (!isAuthenticated) {
      setError("You must be logged in to update notes.")
      return
    }

    try {
      // Verificar si es una nota completa (con id) o una nueva nota
      if ("id" in updatedNote) {
        // Es una nota existente, omitir la fecha al actualizar
        //const { creationDate, ...noteData } = updatedNote
        await updateNote(updatedNote as Note)

        // Si la nota cambia su estado de archivado, recargar las notas
        if (notes.find((note) => note.id === updatedNote.id)?.isArchived !== updatedNote.isArchived) {
          loadNotes()
        } else {
          // Si no cambia el estado de archivado, actualizar la lista actual
          setNotes(notes.map((note) => (note.id === updatedNote.id ? (updatedNote as Note) : note)))
        }
      } else {
        // Es una nota nueva, manejarla como creación
        await handleCreateNote(updatedNote)
      }

      setEditingNote(null)
    } catch (err: any) {
      if (err.message.includes("Authentication required")) {
        setIsAuthenticated(false)
        setError("Your session has expired. Please login again.")
      } else {
        setError("Failed to update note. Please try again.")
      }
      console.error(err)
    }
  }

  // Función para cambiar entre vistas con transición
  const handleViewChange = (archived: boolean) => {
    if (showArchived === archived) return

    setIsViewTransitioning(true)
    setTimeout(() => {
      setShowArchived(archived)
      setIsViewTransitioning(false)
    }, 200)
  }

  // Función para abrir el modal de confirmación
  const confirmDeleteNote = (id: number, title: string) => {
    if (!isAuthenticated) {
      setError("You must be logged in to delete notes.")
      return
    }

    setNoteToDelete({ id, title })
    setDeleteModalOpen(true)
  }

  // Función para ejecutar la eliminación después de confirmar
  const handleDeleteNote = async () => {
    if (!noteToDelete) return

    try {
      await deleteNote(noteToDelete.id)
      setNotes(notes.filter((note) => note.id !== noteToDelete.id))
      setDeleteModalOpen(false)
      setNoteToDelete(null)
    } catch (err: any) {
      if (err.message.includes("Authentication required")) {
        setIsAuthenticated(false)
        setError("Your session has expired. Please login again.")
      } else {
        setError("Failed to delete note. Please try again.")
      }
      console.error(err)
    }
  }

  const handleArchiveNote = async (note: Note) => {
    if (!isAuthenticated) {
      setError("You must be logged in to archive notes.")
      return
    }

    const updatedNote = { ...note, isArchived: !note.isArchived }
    await handleUpdateNote(updatedNote)
  }

  const handleEditNote = (note: Note) => {
    if (!isAuthenticated) {
      setError("You must be logged in to edit notes.")
      return
    }

    setEditingNote(note)
  }

  const handleCancelEdit = () => {
    setEditingNote(null)
  }

  const handleTagSelect = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const allTags = Array.from(new Set(notes.flatMap((note) => note.tags || [])))

  const filteredNotes = notes.filter((note) => {
    // Filter by selected tags
    const matchesTags = selectedTags.length === 0 || selectedTags.some((tag) => note.tags?.includes(tag))
    return matchesTags
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Header />

      <div className="container mx-auto p-6 max-w-6xl">
        {!isAuthenticated ? (
          <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-serif font-bold mb-4 text-slate-800 dark:text-white text-center">
              Bienvenido a Notes Manager
            </h2>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-slate-700 dark:to-slate-600 p-6 rounded-lg shadow-sm border border-teal-200 dark:border-slate-500">
                <div className="flex items-center mb-4">
                  <div className="bg-teal-500 p-3 rounded-full text-white mr-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-teal-800 dark:text-white">Crea y Edita Notas</h3>
                </div>
                <p className="text-slate-700 dark:text-slate-200 mb-3">
                  Organiza tus ideas con notas personalizadas. Añade títulos descriptivos y contenido detallado para
                  mantener toda tu información en un solo lugar.
                </p>
                <p className="text-slate-700 dark:text-slate-200">
                  Edita tus notas en cualquier momento para mantenerlas actualizadas con la información más reciente.
                </p>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-slate-700 dark:to-slate-600 p-6 rounded-lg shadow-sm border border-amber-200 dark:border-slate-500">
                <div className="flex items-center mb-4">
                  <div className="bg-amber-500 p-3 rounded-full text-white mr-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                      <line x1="7" y1="7" x2="7.01" y2="7"></line>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-amber-800 dark:text-white">Organiza con Etiquetas</h3>
                </div>
                <p className="text-slate-700 dark:text-slate-200 mb-3">
                  Clasifica tus notas con etiquetas personalizadas para encontrar rápidamente lo que buscas. Filtra por
                  etiquetas para ver solo las notas relevantes.
                </p>
                <p className="text-slate-700 dark:text-slate-200">
                  Crea un sistema de organización que se adapte a tus necesidades específicas.
                </p>
              </div>

              <div className="bg-gradient-to-br from-violet-50 to-violet-100 dark:from-slate-700 dark:to-slate-600 p-6 rounded-lg shadow-sm border border-violet-200 dark:border-slate-500">
                <div className="flex items-center mb-4">
                  <div className="bg-violet-500 p-3 rounded-full text-white mr-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                      <path d="M7 15h0"></path>
                      <path d="M12 15h0"></path>
                      <path d="M17 15h0"></path>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-violet-800 dark:text-white">Archiva lo Importante</h3>
                </div>
                <p className="text-slate-700 dark:text-slate-200 mb-3">
                  Mantén tu espacio de trabajo limpio archivando las notas que no necesitas actualmente pero que quieres
                  conservar para referencia futura.
                </p>
                <p className="text-slate-700 dark:text-slate-200">
                  Accede fácilmente a tus notas archivadas cuando las necesites nuevamente.
                </p>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-slate-700 dark:to-slate-600 p-6 rounded-lg shadow-sm border border-emerald-200 dark:border-slate-500">
                <div className="flex items-center mb-4">
                  <div className="bg-emerald-500 p-3 rounded-full text-white mr-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-emerald-800 dark:text-white">Seguridad Garantizada</h3>
                </div>
                <p className="text-slate-700 dark:text-slate-200 mb-3">
                  Tus notas están protegidas con un sistema de autenticación seguro. Solo tú puedes acceder a tu
                  información personal.
                </p>
                <p className="text-slate-700 dark:text-slate-200">
                  Inicia sesión desde cualquier dispositivo para acceder a tus notas donde quiera que estés.
                </p>
              </div>
            </div>

            <div className="mt-10 bg-gradient-to-r from-teal-500 to-emerald-500 p-8 rounded-lg text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div className="max-w-2xl">
                  <h3 className="text-2xl font-bold mb-4">¿Listo para organizar tus ideas?</h3>
                  <p className="mb-6 text-white/90">
                    Inicia sesión o regístrate para comenzar a crear y organizar tus notas. Mantén tus ideas, tareas y
                    recordatorios en un solo lugar, accesible desde cualquier dispositivo.
                  </p>
                  <p className="text-white/90 text-sm">
                    Notes Manager te ayuda a mantener tu vida digital organizada y productiva.
                  </p>
                </div>
                <div className="hidden md:block">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="120"
                    height="120"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-white/30"
                  >
                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
                    <path d="M8 7h6"></path>
                    <path d="M8 11h8"></path>
                    <path d="M8 15h6"></path>
                  </svg>
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-700 p-5 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-rose-500"
                  >
                    <path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z"></path>
                    <path d="M7 21h10"></path>
                    <path d="M12 3v6"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-slate-800 dark:text-white">Interfaz Intuitiva</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm">
                  Diseño limpio y fácil de usar que te permite concentrarte en tus notas sin distracciones.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-700 p-5 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-sky-100 dark:bg-sky-900/30 rounded-full flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-sky-500"
                  >
                    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
                    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path>
                    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-slate-800 dark:text-white">Acceso Multiplataforma</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm">
                  Accede a tus notas desde cualquier dispositivo con conexión a internet.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-700 p-5 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-amber-500"
                  >
                    <path d="M12 2v8"></path>
                    <path d="m4.93 10.93 1.41 1.41"></path>
                    <path d="M2 18h2"></path>
                    <path d="M20 18h2"></path>
                    <path d="m19.07 10.93-1.41 1.41"></path>
                    <path d="M22 22H2"></path>
                    <path d="M16 6 8 14"></path>
                    <path d="M16 14 8 6"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-slate-800 dark:text-white">Personalización Total</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm">
                  Organiza tus notas según tus preferencias con un sistema flexible de etiquetas y categorías.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between mb-8">
              <button
                className={`px-5 py-2.5 rounded-md transition-all duration-200 font-medium ${
                  showArchived
                    ? "bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                    : "bg-teal-500 text-white hover:bg-teal-600 shadow-sm dark:bg-teal-600 dark:hover:bg-teal-700"
                }`}
                onClick={() => handleViewChange(false)}
              >
                Active Notes
              </button>
              <button
                className={`px-5 py-2.5 rounded-md transition-all duration-200 font-medium ${
                  showArchived
                    ? "bg-teal-500 text-white hover:bg-teal-600 shadow-sm dark:bg-teal-600 dark:hover:bg-teal-700"
                    : "bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                }`}
                onClick={() => handleViewChange(true)}
              >
                Archived Notes
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6 shadow-sm">
                <p className="font-medium">Error</p>
                <p>{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="mb-6">
                  <TagFilter allTags={allTags} selectedTags={selectedTags} onTagSelect={handleTagSelect} />
                </div>

                <div className={`transition-opacity duration-200 ${isViewTransitioning ? "opacity-0" : "opacity-100"}`}>
                  {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
                    </div>
                  ) : (
                    <div>
                      <h2 className="text-xl font-serif font-bold mb-4 text-slate-800 dark:text-white">
                        {showArchived ? "Archived Notes" : "Active Notes"}
                      </h2>
                      <NoteList
                        notes={filteredNotes}
                        onEdit={handleEditNote}
                        onDelete={confirmDeleteNote}
                        onArchive={handleArchiveNote}
                        isArchiveView={showArchived}
                        editingNoteId={editingNote?.id}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:sticky lg:top-6 h-fit">
                <NoteForm
                  onSubmit={editingNote ? handleUpdateNote : handleCreateNote}
                  initialNote={editingNote}
                  onCancel={handleCancelEdit}
                  isEditing={!!editingNote}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal de confirmación para eliminar notas */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setNoteToDelete(null)
        }}
        onConfirm={handleDeleteNote}
        noteTitle={noteToDelete?.title || ""}
      />
    </div>
  )
}

export default App
