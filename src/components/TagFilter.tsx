"use client"

import { useState, useEffect } from "react"

interface TagFilterProps {
  allTags: string[]
  selectedTags: string[]
  onTagSelect: (tag: string) => void
}

const TagFilter = ({ allTags, selectedTags, onTagSelect }: TagFilterProps) => {
  const [isFiltering, setIsFiltering] = useState(false)

  // Efecto para animar cuando cambian las etiquetas seleccionadas
  useEffect(() => {
    if (selectedTags.length > 0) {
      setIsFiltering(true)
      const timer = setTimeout(() => setIsFiltering(false), 300)
      return () => clearTimeout(timer)
    }
  }, [selectedTags])

  if (allTags.length === 0) {
    return null
  }

  return (
    <div className="mb-6 bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
      <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Filter by tags:</h3>
      <div className="flex flex-wrap gap-2">
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => onTagSelect(tag)}
            className={`px-3 py-1.5 rounded-full text-sm transition-all duration-300 ${
              selectedTags.includes(tag)
                ? "bg-teal-500 text-white animate-pulse-once"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
            }`}
          >
            {tag}
          </button>
        ))}
        {selectedTags.length > 0 && (
          <button
            onClick={() => selectedTags.forEach((tag) => onTagSelect(tag))}
            className="px-3 py-1.5 rounded-full text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 transition-all duration-200"
          >
            Clear All
          </button>
        )}
      </div>
    </div>
  )
}

export default TagFilter
