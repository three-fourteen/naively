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
