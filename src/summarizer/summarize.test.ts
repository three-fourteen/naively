import { afterEach, describe, expect, it, vi } from 'vitest'
import { summarize, summarizeStreaming } from './summarize'

afterEach(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (window as any).Summarizer
})

function installFakeSummarizer(overrides: Record<string, unknown> = {}) {
  const destroy = vi.fn()
  const summarizeFn = vi.fn(async (_text: string) => 'the summary')
  const create = vi.fn(async () => ({
    summarize: summarizeFn,
    destroy,
    ...overrides,
  }))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(window as any).Summarizer = {
    availability: async () => 'readily',
    create,
  }

  return { destroy, summarizeFn, create }
}

describe('summarize', () => {
  it('rejects empty/whitespace-only text without touching the API', async () => {
    const result = await summarize('   ')

    expect(result).toEqual({
      ok: false,
      error: { code: 'SUMMARIZE_FAILED', message: 'Text must not be empty.' },
    })
  })

  it('errors when the Summarizer API is not present', async () => {
    const result = await summarize('some article text')

    expect(result.ok).toBe(false)
    expect(result.error?.message).toMatch(/not supported/i)
  })

  it('errors when availability() throws', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).Summarizer = {
      availability: async () => {
        throw new Error('boom')
      },
    }

    const result = await summarize('some article text')

    expect(result.ok).toBe(false)
    expect(result.error?.message).toMatch(/failed to check/i)
  })

  it('errors when availability is "unavailable"', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).Summarizer = { availability: async () => 'unavailable' }

    const result = await summarize('some article text')

    expect(result.ok).toBe(false)
    expect(result.error?.message).toMatch(/unavailable/i)
  })

  it('errors when create() throws', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).Summarizer = {
      availability: async () => 'readily',
      create: async () => {
        throw new Error('model create failed')
      },
    }

    const result = await summarize('some article text')

    expect(result).toEqual({
      ok: false,
      error: { code: 'SUMMARIZE_FAILED', message: 'model create failed' },
    })
  })

  it('returns the summary and destroys the instance on success', async () => {
    const { destroy, summarizeFn } = installFakeSummarizer()

    const result = await summarize('some article text')

    expect(result).toEqual({ ok: true, data: 'the summary' })
    expect(summarizeFn).toHaveBeenCalledWith('some article text', undefined)
    expect(destroy).toHaveBeenCalledOnce()
  })

  it('forwards call-time context and destroys the instance even when summarize() throws', async () => {
    const destroy = vi.fn()
    const summarizeFn = vi.fn(async () => {
      throw new Error('inference failed')
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).Summarizer = {
      availability: async () => 'readily',
      create: async () => ({ summarize: summarizeFn, destroy }),
    }

    const result = await summarize('some article text', undefined, { context: 'extra context' })

    expect(result).toEqual({
      ok: false,
      error: { code: 'SUMMARIZE_FAILED', message: 'inference failed' },
    })
    expect(summarizeFn).toHaveBeenCalledWith('some article text', { context: 'extra context' })
    expect(destroy).toHaveBeenCalledOnce()
  })
})

describe('summarizeStreaming', () => {
  it('rejects empty text without touching the API', async () => {
    const result = await summarizeStreaming('')

    expect(result).toEqual({
      ok: false,
      error: { code: 'SUMMARIZE_FAILED', message: 'Text must not be empty.' },
    })
  })

  it('propagates the underlying availability error', async () => {
    const result = await summarizeStreaming('some text')

    expect(result.ok).toBe(false)
    expect(result.error?.message).toMatch(/not supported/i)
  })

  it('streams chunks and destroys the instance once the stream finishes', async () => {
    const destroy = vi.fn()
    const chunks = ['hel', 'lo']
    const fakeStream = new ReadableStream<string>({
      start(controller) {
        for (const chunk of chunks) controller.enqueue(chunk)
        controller.close()
      },
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).Summarizer = {
      availability: async () => 'readily',
      create: async () => ({
        summarizeStreaming: () => fakeStream,
        destroy,
      }),
    }

    const result = await summarizeStreaming('some text')
    expect(result.ok).toBe(true)

    const received: string[] = []
    for await (const chunk of result.stream as unknown as AsyncIterable<string>) {
      received.push(chunk)
    }

    expect(received).toEqual(chunks)
    await vi.waitFor(() => expect(destroy).toHaveBeenCalledOnce())
  })
})
