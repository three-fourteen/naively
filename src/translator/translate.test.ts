import { afterEach, describe, expect, it, vi } from 'vitest'
import { translate } from './translate'

afterEach(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (window as any).Translator
})

describe('translate', () => {
  it('rejects empty/whitespace-only text without touching the API', async () => {
    const result = await translate('  ', { sourceLanguage: 'en', targetLanguage: 'fr' })

    expect(result).toEqual({
      ok: false,
      error: { code: 'TRANSLATE_FAILED', message: 'Text must not be empty.' },
    })
  })

  it('errors when the Translator API is not present', async () => {
    const result = await translate('Hello', { sourceLanguage: 'en', targetLanguage: 'fr' })

    expect(result.ok).toBe(false)
    expect(result.error?.message).toMatch(/not supported/i)
  })

  it('errors when availability() throws', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).Translator = {
      availability: async () => {
        throw new Error('boom')
      },
    }

    const result = await translate('Hello', { sourceLanguage: 'en', targetLanguage: 'fr' })

    expect(result.ok).toBe(false)
    expect(result.error?.message).toMatch(/failed to check/i)
  })

  it('errors with the language pair when availability is "unavailable"', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).Translator = { availability: async () => 'unavailable' }

    const result = await translate('Hello', { sourceLanguage: 'en', targetLanguage: 'fr' })

    expect(result.ok).toBe(false)
    expect(result.error?.message).toBe("Translation from 'en' to 'fr' is unavailable.")
  })

  it('errors when create() throws', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).Translator = {
      availability: async () => 'readily',
      create: async () => {
        throw new Error('model create failed')
      },
    }

    const result = await translate('Hello', { sourceLanguage: 'en', targetLanguage: 'fr' })

    expect(result).toEqual({
      ok: false,
      error: { code: 'TRANSLATE_FAILED', message: 'model create failed' },
    })
  })

  it('returns the translation and destroys the instance on success', async () => {
    const destroy = vi.fn()
    const translateFn = vi.fn(async (_text: string) => 'Bonjour')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).Translator = {
      availability: async () => 'readily',
      create: async () => ({ translate: translateFn, destroy }),
    }

    const result = await translate('Hello', { sourceLanguage: 'en', targetLanguage: 'fr' })

    expect(result).toEqual({ ok: true, data: 'Bonjour' })
    expect(translateFn).toHaveBeenCalledWith('Hello')
    expect(destroy).toHaveBeenCalledOnce()
  })

  it('destroys the instance even when translate() throws', async () => {
    const destroy = vi.fn()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).Translator = {
      availability: async () => 'readily',
      create: async () => ({
        translate: async () => {
          throw new Error('inference failed')
        },
        destroy,
      }),
    }

    const result = await translate('Hello', { sourceLanguage: 'en', targetLanguage: 'fr' })

    expect(result).toEqual({
      ok: false,
      error: { code: 'TRANSLATE_FAILED', message: 'inference failed' },
    })
    expect(destroy).toHaveBeenCalledOnce()
  })
})
