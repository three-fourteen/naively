import { afterEach, describe, expect, it, vi } from 'vitest'
import { detectLanguage } from './detect'

afterEach(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (window as any).LanguageDetector
})

describe('detectLanguage', () => {
  it('rejects empty/whitespace-only text without touching the API', async () => {
    const result = await detectLanguage(' ')

    expect(result).toEqual({
      ok: false,
      error: { code: 'DETECT_FAILED', message: 'Text must not be empty.' },
    })
  })

  it('errors when the LanguageDetector API is not present', async () => {
    const result = await detectLanguage('Bonjour')

    expect(result.ok).toBe(false)
    expect(result.error?.message).toMatch(/not supported/i)
  })

  it('errors when availability() throws', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).LanguageDetector = {
      availability: async () => {
        throw new Error('boom')
      },
    }

    const result = await detectLanguage('Bonjour')

    expect(result.ok).toBe(false)
    expect(result.error?.message).toMatch(/failed to check/i)
  })

  it('errors when availability is "unavailable"', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).LanguageDetector = { availability: async () => 'unavailable' }

    const result = await detectLanguage('Bonjour')

    expect(result.ok).toBe(false)
    expect(result.error?.message).toMatch(/unavailable/i)
  })

  it('errors when create() throws', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).LanguageDetector = {
      availability: async () => 'readily',
      create: async () => {
        throw new Error('model create failed')
      },
    }

    const result = await detectLanguage('Bonjour')

    expect(result).toEqual({
      ok: false,
      error: { code: 'DETECT_FAILED', message: 'model create failed' },
    })
  })

  it('returns ranked candidates and destroys the instance on success', async () => {
    const destroy = vi.fn()
    const candidates = [
      { detectedLanguage: 'fr', confidence: 0.998 },
      { detectedLanguage: 'en', confidence: 0.001 },
    ]
    const detect = vi.fn(async (_text: string) => candidates)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).LanguageDetector = {
      availability: async () => 'readily',
      create: async () => ({ detect, destroy }),
    }

    const result = await detectLanguage('Bonjour le monde')

    expect(result).toEqual({ ok: true, data: candidates })
    expect(detect).toHaveBeenCalledWith('Bonjour le monde')
    expect(destroy).toHaveBeenCalledOnce()
  })

  it('destroys the instance even when detect() throws', async () => {
    const destroy = vi.fn()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).LanguageDetector = {
      availability: async () => 'readily',
      create: async () => ({
        detect: async () => {
          throw new Error('inference failed')
        },
        destroy,
      }),
    }

    const result = await detectLanguage('Bonjour')

    expect(result).toEqual({
      ok: false,
      error: { code: 'DETECT_FAILED', message: 'inference failed' },
    })
    expect(destroy).toHaveBeenCalledOnce()
  })
})
