import type {
  SummarizeOptions,
  SummarizeCallOptions,
  SummarizeResult,
  SummarizeStreamingResult,
} from '../types'

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

function streamingErrorResult(message: string): SummarizeStreamingResult {
  return {
    ok: false,
    error: { code: 'SUMMARIZE_FAILED', message },
  }
}

function buildCreateOptions(options?: SummarizeOptions) {
  return {
    type: options?.type ?? 'key-points',
    length: options?.length ?? 'medium',
    format: options?.format ?? 'plain-text',
    ...(options?.sharedContext !== undefined && { sharedContext: options.sharedContext }),
    ...(options?.expectedInputLanguages !== undefined && {
      expectedInputLanguages: options.expectedInputLanguages,
    }),
    ...(options?.expectedContextLanguages !== undefined && {
      expectedContextLanguages: options.expectedContextLanguages,
    }),
    ...(options?.outputLanguage !== undefined && { outputLanguage: options.outputLanguage }),
  }
}

async function getSummarizerInstance(
  options?: SummarizeOptions,
): Promise<{ summarizer: ChromeSummarizer } | { error: SummarizeResult }> {
  if (!('Summarizer' in window)) {
    return { error: errorResult('Summarizer API is not supported in this environment.') }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SummarizerAPI = (window as any).Summarizer

  let availability: string
  try {
    availability = await SummarizerAPI.availability()
  } catch {
    return { error: errorResult('Failed to check Summarizer availability.') }
  }

  if (availability === 'unavailable') {
    return { error: errorResult('Summarizer API is unavailable.') }
  }

  try {
    const summarizer = await SummarizerAPI.create(buildCreateOptions(options))
    return { summarizer }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { error: errorResult(message) }
  }
}

export async function summarize(
  text: string,
  options?: SummarizeOptions,
  callOptions?: SummarizeCallOptions,
): Promise<SummarizeResult> {
  if (!text.trim()) {
    return errorResult('Text must not be empty.')
  }

  const result = await getSummarizerInstance(options)
  if ('error' in result) return result.error

  const { summarizer } = result
  try {
    const callArgs = callOptions?.context !== undefined ? { context: callOptions.context } : undefined
    const data: string = await summarizer.summarize(text, callArgs)
    return { ok: true, data }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return errorResult(message)
  } finally {
    if (typeof summarizer.destroy === 'function') {
      summarizer.destroy()
    }
  }
}

export async function summarizeStreaming(
  text: string,
  options?: SummarizeOptions,
  callOptions?: SummarizeCallOptions,
): Promise<SummarizeStreamingResult> {
  if (!text.trim()) {
    return streamingErrorResult('Text must not be empty.')
  }

  const result = await getSummarizerInstance(options)
  // Non-null assertion relies on errorResult() always populating `error` — if that
  // helper's shape ever changes, this needs to be revisited.
  if ('error' in result) return streamingErrorResult(result.error.error!.message)

  const { summarizer } = result
  try {
    const callArgs = callOptions?.context !== undefined ? { context: callOptions.context } : undefined
    const stream: ReadableStream<string> = summarizer.summarizeStreaming(text, callArgs)
    // Wrap the stream so we can destroy the summarizer when it finishes
    const { readable, writable } = new TransformStream<string, string>()
    stream.pipeTo(writable).finally(() => {
      if (typeof summarizer.destroy === 'function') {
        summarizer.destroy()
      }
    })
    return { ok: true, stream: readable }
  } catch (err) {
    if (typeof summarizer.destroy === 'function') {
      summarizer.destroy()
    }
    const message = err instanceof Error ? err.message : String(err)
    return streamingErrorResult(message)
  }
}
