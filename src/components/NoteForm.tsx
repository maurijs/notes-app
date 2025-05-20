"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { Note } from "../types"

interface NoteFormProps {
  onSubmit: (note: Note | Omit<Note, "id" | "creationDate">) => Promise<void>
  initialNote: Note | null
  onCancel: () => void
  isEditing: boolean
}

const NoteForm = ({ onSubmit, initialNote, onCancel, isEditing }: NoteFormProps) => {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState("")
  const [errors, setErrors] = useState<{ title?: string; content?: string }>({})

  useEffect(() => {
    if (initialNote) {
      setTitle(initialNote.title)
      setContent(initialNote.content)
      setTags(initialNote.tags ? initialNote.tags.join(", ") : "")
    } else {
      resetForm()
    }
  }, [initialNote])

  const resetForm = () => {
    setTitle("")
    setContent("")
    setTags("")
    setErrors({})
  }

  const validate = () => {
    const newErrors: { title?: string; content?: string } = {}

    if (!title.trim()) {
      newErrors.title = "Title is required"
    } else if (title.length > 100) {
      newErrors.title = "Title must be less than 100 characters"
    }

    if (!content.trim()) {
      newErrors.content = "Content is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    const tagList = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag !== "")

    if (isEditing && initialNote) {
      onSubmit({
        ...initialNote,
        title,
        content,
        tags: tagList,
      })
    } else {
      onSubmit({
        title,
        content,
        isArchived: false,
        tags: tagList,
      })
      resetForm()
    }
  }

  return (
    <div className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-slate-800 dark:to-slate-700 p-6 rounded-lg shadow-md border border-teal-200 dark:border-slate-600">
      <h2 className="text-2xl font-semibold mb-6 text-teal-800 dark:text-teal-300">
        {isEditing ? "Edit Note" : "Create New Note"}
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-5">
          <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`w-full px-4 py-3 border rounded-md bg-white dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 ${
              errors.title
                ? "border-red-500 focus:ring-red-500"
                : "border-slate-300 dark:border-slate-600 dark:text-white"
            }`}
            placeholder="Note title"
            maxLength={100}
          />
          {errors.title && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.title}</p>}
        </div>

        <div className="mb-5">
          <label htmlFor="content" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={`w-full px-4 py-3 border rounded-md bg-white dark:bg-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 ${
              errors.content
                ? "border-red-500 focus:ring-red-500"
                : "border-slate-300 dark:border-slate-600 dark:text-white"
            }`}
            placeholder="Note content"
            rows={6}
          />
          {errors.content && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.content}</p>}
        </div>

        <div className="mb-6">
          <label htmlFor="tags" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Tags (comma separated)
          </label>
          <input
            type="text"
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
            placeholder="work, personal, important"
          />
        </div>

        <div className="flex justify-end space-x-3">
          {isEditing && (
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-md transition-colors duration-200 font-medium dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-md shadow-sm transition-colors duration-200 font-medium"
          >
            {isEditing ? "Update Note" : "Create Note"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default NoteForm
