import type { DetectedLanguage, DetectLanguageResult } from '../types'

// Chrome's LanguageDetector API is not yet in standard type definitions.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ChromeLanguageDetector = any

function errorResult(message: string): DetectLanguageResult {
  return {
    ok: false,
    error: { code: 'DETECT_FAILED', message },
  }
}

/**
 * Detects the language(s) of the given text using Chrome's built-in Language Detector API.
 *
 * Returns a ranked list of language candidates with confidence scores (0.0–1.0).
 * Note: accuracy is low for very short text or single words.
 *
 * Handles all edge cases internally — always returns a typed DetectLanguageResult.
 */
export async function detectLanguage(text: string): Promise<DetectLanguageResult> {
  if (!text.trim()) {
    return errorResult('Text must not be empty.')
  }

  if (!('LanguageDetector' in window)) {
    return errorResult('LanguageDetector API is not supported in this environment.')
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const LanguageDetectorAPI = (window as any).LanguageDetector

  let availability: string
  try {
    availability = await LanguageDetectorAPI.availability()
  } catch {
    return errorResult('Failed to check LanguageDetector availability.')
  }

  if (availability === 'unavailable') {
    return errorResult('LanguageDetector API is unavailable.')
  }

  let detector: ChromeLanguageDetector | undefined

  try {
    detector = await LanguageDetectorAPI.create()

    const results: DetectedLanguage[] = await detector.detect(text)
    return { ok: true, data: results }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return errorResult(message)
  } finally {
    // Free model resources after use
    if (detector && typeof detector.destroy === 'function') {
      detector.destroy()
    }
  }
}
