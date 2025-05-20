export interface Note {
  id: number
  title: string
  content: string
  isArchived: boolean
  tags: string[]
  creationDate: string | Date
}
