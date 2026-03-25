import type { TranslateOptions, TranslateResult } from '../types'

// Chrome's Translator API is not yet in standard type definitions.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ChromeTranslator = any

function errorResult(message: string): TranslateResult {
  return {
    ok: false,
    error: { code: 'TRANSLATE_FAILED', message },
  }
}

/**
 * Translates text using Chrome's built-in Translator API.
 *
 * Both sourceLanguage and targetLanguage must be BCP 47 language codes (e.g. 'en', 'fr', 'es').
 * Handles all edge cases internally — always returns a typed TranslateResult.
 */
export async function translate(
  text: string,
  options: TranslateOptions,
): Promise<TranslateResult> {
  if (!text.trim()) {
    return errorResult('Text must not be empty.')
  }

  if (!('Translator' in window)) {
    return errorResult('Translator API is not supported in this environment.')
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const TranslatorAPI = (window as any).Translator

  // Availability is language-pair specific for the Translator API
  let availability: string
  try {
    availability = await TranslatorAPI.availability({
      sourceLanguage: options.sourceLanguage,
      targetLanguage: options.targetLanguage,
    })
  } catch {
    return errorResult('Failed to check Translator availability.')
  }

  if (availability === 'unavailable') {
    return errorResult(
      `Translation from '${options.sourceLanguage}' to '${options.targetLanguage}' is unavailable.`,
    )
  }

  let translator: ChromeTranslator | undefined

  try {
    translator = await TranslatorAPI.create({
      sourceLanguage: options.sourceLanguage,
      targetLanguage: options.targetLanguage,
    })

    const result: string = await translator.translate(text)
    return { ok: true, data: result }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return errorResult(message)
  } finally {
    // Free model resources after use
    if (translator && typeof translator.destroy === 'function') {
      translator.destroy()
    }
  }
}
