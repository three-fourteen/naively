export type SummaryType = 'tl;dr' | 'key-points' | 'teaser' | 'headline'
export type SummaryLength = 'short' | 'medium' | 'long'
export type SummaryFormat = 'plain-text' | 'markdown'

export interface SummarizeOptions {
  type?: SummaryType
  length?: SummaryLength
  format?: SummaryFormat
}

export interface SummarizeResult {
  ok: boolean
  data?: string
  error?: {
    code: string
    message: string
  }
}

export interface TranslateOptions {
  sourceLanguage: string
  targetLanguage: string
}

export interface TranslateResult {
  ok: boolean
  data?: string
  error?: {
    code: string
    message: string
  }
}

export interface DetectedLanguage {
  detectedLanguage: string
  confidence: number
}

export interface DetectLanguageResult {
  ok: boolean
  data?: DetectedLanguage[]
  error?: {
    code: string
    message: string
  }
}
