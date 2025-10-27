export interface TranscriptionData {
  text: string
  language: string
  confidence: number
  duration: number
  segments: Array<{
    start: number
    end: number
    text: string
    confidence: number
  }>
}

export interface SummaryData {
  summary: string
  keyPoints: string[]
  language: string
  wordCount: number
}

export interface MindMapData {
  nodes: Array<{
    id: string
    label: string
    level: number
    parent?: string | null
    children?: string[]
  }>
  links: Array<{
    source: string
    target: string
    strength: number
  }>
  language: string
}

export interface UploadResponse {
  success: boolean
  message: string
  fileId?: string
}

export interface ProcessingStatus {
  step: string
  progress: number
  message: string
}
