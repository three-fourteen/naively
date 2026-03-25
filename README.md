# naively

A minimal TypeScript wrapper around [Chrome Built-in AI APIs](https://developer.chrome.com/docs/ai/built-in-apis), starting with the Summarizer API.

## Status

Chrome Built-in AI APIs are actively shipping. As of **Chrome 138** (stable):

| API | Status |
|-----|--------|
| [Summarizer](https://developer.chrome.com/docs/ai/summarizer-api) | ✅ Stable |
| [Translator](https://developer.chrome.com/docs/ai/translator-api) | ✅ Stable |
| [Language Detector](https://developer.chrome.com/docs/ai/language-detection) | ✅ Stable |
| Writer / Rewriter | 🧪 Developer Trial |
| Prompt API (web) | 🔬 Origin Trial |

> These APIs run a local Gemini Nano model on the user's device — no API key or network request required after the initial model download.

## Requirements

- **Browser:** Chrome 138+ (desktop only — not supported on Android or iOS)
- **OS:** Windows 10+, macOS 13+, Linux, or ChromeOS (Chromebook Plus)
- **Storage:** ~22 GB free disk space (for the model)
- **Hardware:** GPU with 4 GB+ VRAM, or CPU with 16 GB RAM and 4+ cores

## Installation

```bash
pnpm add naively
# or
npm install naively
```

## Usage

### Check support

```ts
import { getAiSupport, isSummarizerSupported } from 'naively'

// Quick boolean check
if (isSummarizerSupported()) {
  console.log('Summarizer API available')
}

// Full support details including model availability
const support = await getAiSupport()
console.log(support)
// {
//   summarizer: {
//     supported: true,
//     availability: 'readily' | 'downloadable' | 'unavailable' | 'unsupported'
//   }
// }
```

**Availability values:**

| Value | Meaning |
|-------|---------|
| `readily` | Model is downloaded and ready |
| `downloadable` | Supported, but model needs to download first |
| `unavailable` | Hardware/OS doesn't meet requirements |
| `unsupported` | API not present in this browser |

### Summarize text

```ts
import { summarize } from 'naively'

const result = await summarize(articleText)

if (result.ok) {
  console.log(result.data)
} else {
  console.error(result.error?.message)
}
```

### With options

```ts
const result = await summarize(articleText, {
  type: 'key-points',   // 'tl;dr' | 'key-points' | 'teaser' | 'headline'
  length: 'medium',     // 'short' | 'medium' | 'long'
  format: 'plain-text', // 'plain-text' | 'markdown'
})
```

## API Reference

### `summarize(text, options?): Promise<SummarizeResult>`

Returns a `SummarizeResult` — always, without throwing.

```ts
interface SummarizeResult {
  ok: boolean
  data?: string
  error?: {
    code: string    // e.g. 'SUMMARIZE_FAILED'
    message: string
  }
}
```

Edge cases handled internally:

- Empty text
- API not present in browser
- Model unavailable
- Errors during model creation or summarization
- Model resource cleanup (`destroy()`) always runs

### `getAiSupport(): Promise<{ summarizer: { supported: boolean, availability: string } }>`

Returns support and availability details for each built-in AI API.

### `isSummarizerSupported(): boolean`

Synchronous check — returns `true` if `Summarizer` exists in `window`.

## Development

```bash
pnpm install
pnpm build      # outputs to dist/
pnpm typecheck  # tsc --noEmit
```

## Further Reading

- [Chrome Built-in AI overview](https://developer.chrome.com/docs/ai/built-in-apis)
- [Summarizer API docs](https://developer.chrome.com/docs/ai/summarizer-api)
- [People + AI Guidebook](https://pair.withgoogle.com/guidebook/) — UX guidance for AI features
- [`@types/dom-chromium-ai`](https://www.npmjs.com/package/@types/dom-chromium-ai) — official TypeScript types for Chrome AI APIs
