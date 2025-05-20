import type { Note } from "./types"
import { authService } from "./services/authService"

export const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api/Note`;

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    // Si el error es de autenticación, limpiar el token
    if (response.status === 401) {
      authService.removeToken()
      throw new Error("Authentication required. Please login again.")
    }

    const errorData = await response.json().catch(() => null)
    const errorMessage = errorData?.message || `API error: ${response.status}`
    throw new Error(errorMessage)
  }
  return response.json()
}

// Función auxiliar para procesar las fechas en las notas recibidas
const processNoteDates = (note: any): Note => {
  return {
    ...note,
    // Convertir la cadena de fecha a objeto Date
    creationDate: note.creationDate ? new Date(note.creationDate) : new Date(),
  }
}

// Procesar un array de notas
const processNotesList = (notes: any[]): Note[] => {
  return notes.map((note) => processNoteDates(note))
}

// Fetch all notes
export const fetchNotes = async (): Promise<Note[]> => {
  const response = await fetch(`${API_BASE_URL}`, {
    headers: {
      ...authService.getAuthHeaders(),
    },
  })
  const data = await handleResponse(response)
  return processNotesList(data)
}

// Fetch archived notes
export const fetchArchivedNotes = async (): Promise<Note[]> => {
  const response = await fetch(`${API_BASE_URL}/archived`, {
    headers: {
      ...authService.getAuthHeaders(),
    },
  })
  const data = await handleResponse(response)
  return processNotesList(data)
}

// Fetch a single note by ID
export const fetchNoteById = async (id: number): Promise<Note> => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    headers: {
      ...authService.getAuthHeaders(),
    },
  })
  const data = await handleResponse(response)
  return processNoteDates(data)
}

// Create a new note
export const createNote = async (note: Omit<Note, "id" | "creationDate">): Promise<Note> => {
  const response = await fetch(`${API_BASE_URL}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authService.getAuthHeaders(),
    },
    body: JSON.stringify(note),
  })
  const data = await handleResponse(response)
  return processNoteDates(data)
}

// Update an existing note
export const updateNote = async (note: Note): Promise<Note> => {
  // Crear una copia de la nota sin la fecha
  const { creationDate, ...noteWithoutDate } = note

  const response = await fetch(`${API_BASE_URL}/${note.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authService.getAuthHeaders(),
    },
    body: JSON.stringify(noteWithoutDate),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error("Update failed:", errorText)
    throw new Error(`Failed to update note: ${response.status}`)
  }

  // Si es 204 No Content, devolvemos la nota original
  return response.status === 204 ? note : processNoteDates(await handleResponse(response))
}

// Archive/unarchive a note - Método específico para archivar
export const toggleArchiveNote = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/${id}/archive`, {
    method: "PATCH",
    headers: {
      ...authService.getAuthHeaders(),
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to toggle archive status: ${response.status}`)
  }
}

// Delete a note
export const deleteNote = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "DELETE",
    headers: {
      ...authService.getAuthHeaders(),
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to delete note: ${response.status}`)
  }
}
