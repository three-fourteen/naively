// Chrome's Summarizer API lives on the global window object.
// We avoid importing types from @types/chrome to keep the lib dep-free.

type AvailabilityResult = 'readily' | 'downloadable' | 'unavailable' | 'unsupported'

/**
 * Safely checks Summarizer.availability() without throwing.
 * Returns 'unsupported' if the API doesn't exist, 'unavailable' on error.
 */
async function safeAvailabilityCheck(): Promise<AvailabilityResult> {
  if (!('Summarizer' in window)) {
    return 'unsupported'
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const availability = await (window as any).Summarizer.availability()
    return availability as AvailabilityResult
  } catch {
    return 'unavailable'
  }
}

/**
 * Returns support details for Chrome Built-in AI APIs.
 */
export async function getAiSupport() {
  return {
    summarizer: {
      supported: 'Summarizer' in window,
      availability: await safeAvailabilityCheck(),
    },
  }
}

/**
 * Quick boolean check for Summarizer API presence.
 */
export function isSummarizerSupported(): boolean {
  return 'Summarizer' in window
}
