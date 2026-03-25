// Chrome Built-in AI APIs live on the global window object.
// We avoid importing types from @types/chrome to keep the lib dep-free.

type AvailabilityResult = 'readily' | 'available' | 'downloadable' | 'unavailable' | 'unsupported'

/**
 * Safely checks Summarizer.availability() without throwing.
 * Returns 'unsupported' if the API doesn't exist, 'unavailable' on error.
 */
async function safeSummarizerAvailability(): Promise<AvailabilityResult> {
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
 * Safely checks LanguageDetector.availability() without throwing.
 */
async function safeLanguageDetectorAvailability(): Promise<AvailabilityResult> {
  if (!('LanguageDetector' in window)) {
    return 'unsupported'
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const availability = await (window as any).LanguageDetector.availability()
    return availability as AvailabilityResult
  } catch {
    return 'unavailable'
  }
}

/**
 * Returns support details for Chrome Built-in AI APIs.
 * Note: Translator availability is language-pair specific — use translate() directly
 * to check availability for a given source/target language combination.
 */
export async function getAiSupport() {
  return {
    summarizer: {
      supported: 'Summarizer' in window,
      availability: await safeSummarizerAvailability(),
    },
    translator: {
      supported: 'Translator' in window,
    },
    languageDetector: {
      supported: 'LanguageDetector' in window,
      availability: await safeLanguageDetectorAvailability(),
    },
  }
}

/**
 * Quick boolean check for Summarizer API presence.
 */
export function isSummarizerSupported(): boolean {
  return 'Summarizer' in window
}

/**
 * Quick boolean check for Translator API presence.
 */
export function isTranslatorSupported(): boolean {
  return 'Translator' in window
}

/**
 * Quick boolean check for LanguageDetector API presence.
 */
export function isLanguageDetectorSupported(): boolean {
  return 'LanguageDetector' in window
}
