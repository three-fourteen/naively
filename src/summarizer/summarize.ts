import type { SummarizeOptions, SummarizeResult } from '../types'

// Chrome's Summarizer API is not yet in standard type definitions.
// We cast to `any` only at the API boundary to keep the rest of the code typed.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ChromeSummarizer = any

function errorResult(message: string): SummarizeResult {
  return {
    ok: false,
    error: { code: 'SUMMARIZE_FAILED', message },
  }
}

/**
 * Summarizes the given text using Chrome's built-in Summarizer API.
 *
 * Handles all edge cases internally — always returns a typed SummarizeResult.
 */
export async function summarize(
  text: string,
  options?: SummarizeOptions,
): Promise<SummarizeResult> {
  if (!text.trim()) {
    return errorResult('Text must not be empty.')
  }

  if (!('Summarizer' in window)) {
    return errorResult('Summarizer API is not supported in this environment.')
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SummarizerAPI = (window as any).Summarizer

  let availability: string
  try {
    availability = await SummarizerAPI.availability()
  } catch {
    return errorResult('Failed to check Summarizer availability.')
  }

  if (availability === 'unavailable') {
    return errorResult('Summarizer API is unavailable.')
  }

  let summarizer: ChromeSummarizer | undefined

  try {
    summarizer = await SummarizerAPI.create({
      type: options?.type ?? 'key-points',
      length: options?.length ?? 'medium',
      format: options?.format ?? 'plain-text',
    })

    const result: string = await summarizer.summarize(text)
    return { ok: true, data: result }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return errorResult(message)
  } finally {
    // Chrome requires explicit cleanup to free model resources
    if (summarizer && typeof summarizer.destroy === 'function') {
      summarizer.destroy()
    }
  }
}
