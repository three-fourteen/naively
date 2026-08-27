import { afterEach, describe, expect, it } from 'vitest'
import {
  getAiSupport,
  isLanguageDetectorSupported,
  isSummarizerSupported,
  isTranslatorSupported,
} from './support'

afterEach(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (window as any).Summarizer
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (window as any).Translator
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (window as any).LanguageDetector
})

describe('isSummarizerSupported / isTranslatorSupported / isLanguageDetectorSupported', () => {
  it('return false when the API is absent from window', () => {
    expect(isSummarizerSupported()).toBe(false)
    expect(isTranslatorSupported()).toBe(false)
    expect(isLanguageDetectorSupported()).toBe(false)
  })

  it('return true once the API is present on window', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).Summarizer = {}
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).Translator = {}
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).LanguageDetector = {}

    expect(isSummarizerSupported()).toBe(true)
    expect(isTranslatorSupported()).toBe(true)
    expect(isLanguageDetectorSupported()).toBe(true)
  })
})

describe('getAiSupport', () => {
  it('reports unsupported for every API when none are present', async () => {
    const support = await getAiSupport()

    expect(support).toEqual({
      summarizer: { supported: false, availability: 'unsupported' },
      translator: { supported: false },
      languageDetector: { supported: false, availability: 'unsupported' },
    })
  })

  it('reports availability from the underlying API when present', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).Summarizer = { availability: async () => 'readily' }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).Translator = {}
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).LanguageDetector = { availability: async () => 'downloadable' }

    const support = await getAiSupport()

    expect(support).toEqual({
      summarizer: { supported: true, availability: 'readily' },
      translator: { supported: true },
      languageDetector: { supported: true, availability: 'downloadable' },
    })
  })

  it('reports "unavailable" when an availability() check throws', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).Summarizer = {
      availability: async () => {
        throw new Error('boom')
      },
    }

    const support = await getAiSupport()

    expect(support.summarizer).toEqual({ supported: true, availability: 'unavailable' })
  })
})
