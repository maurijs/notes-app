"use client"

import type React from "react"
import { useEffect, useState } from "react"

interface DeleteConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  noteTitle: string
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ isOpen, onClose, onConfirm, noteTitle }) => {
  const [isExiting, setIsExiting] = useState(false)

  // Resetear el estado de salida cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setIsExiting(false)
    }
  }, [isOpen])

  // Manejar el cierre con animación
  const handleClose = () => {
    setIsExiting(true)
    setTimeout(onClose, 200)
  }

  // Manejar la confirmación con animación
  const handleConfirm = () => {
    setIsExiting(true)
    setTimeout(onConfirm, 200)
  }

  if (!isOpen) return null

  return (
    <div
      className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 transition-opacity duration-200 ${
        isExiting ? "opacity-0" : "opacity-100"
      }`}
    >
      <div
        className={`bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4 border border-slate-200 dark:border-slate-700 transition-all duration-200 ${
          isExiting ? "opacity-0 transform translate-y-4" : "animate-fade-in"
        }`}
      >
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 text-red-500 mb-4">
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
            >
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">¿Eliminar esta nota?</h3>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            Estás a punto de eliminar la nota{" "}
            <span className="font-medium text-slate-800 dark:text-slate-200">"{noteTitle}"</span>. Esta acción no se
            puede deshacer.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row-reverse gap-3 mt-6">
          <button
            onClick={handleConfirm}
            className="w-full sm:w-auto px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors duration-200 font-medium flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            </svg>
            Eliminar nota
          </button>
          <button
            onClick={handleClose}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 rounded-md transition-colors duration-200 font-medium"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteConfirmationModal
