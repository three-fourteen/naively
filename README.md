# naively

A minimal TypeScript wrapper around [Chrome Built-in AI APIs](https://developer.chrome.com/docs/ai/built-in-apis).

## Status

Chrome Built-in AI APIs are actively shipping. As of **Chrome 138** (stable):

| API | Status | Supported |
|-----|--------|-----------|
| [Summarizer](https://developer.chrome.com/docs/ai/summarizer-api) | ✅ Stable | ✅ |
| [Translator](https://developer.chrome.com/docs/ai/translator-api) | ✅ Stable | ✅ |
| [Language Detector](https://developer.chrome.com/docs/ai/language-detection) | ✅ Stable | ✅ |
| Writer / Rewriter | 🧪 Developer Trial | Soon |
| Prompt API (web) | 🔬 Origin Trial | Soon |

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
import { getAiSupport, isSummarizerSupported, isTranslatorSupported, isLanguageDetectorSupported } from 'naively'

// Quick boolean checks
isSummarizerSupported()       // true | false
isTranslatorSupported()       // true | false
isLanguageDetectorSupported() // true | false

// Full support details
const support = await getAiSupport()
// {
//   summarizer:       { supported: true, availability: 'readily' | 'downloadable' | 'unavailable' | 'unsupported' }
//   translator:       { supported: true }
//   languageDetector: { supported: true, availability: 'readily' | 'downloadable' | 'unavailable' | 'unsupported' }
// }
```

> Translator availability is language-pair specific — `naively` checks it internally when you call `translate()`.

**Summarizer availability values:**

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

With options:

```ts
const result = await summarize(articleText, {
  type: 'key-points',   // 'tl;dr' | 'key-points' | 'teaser' | 'headline'
  length: 'medium',     // 'short' | 'medium' | 'long'
  format: 'plain-text', // 'plain-text' | 'markdown'
})
```

### Translate text

Language codes follow the [BCP 47](https://www.rfc-editor.org/rfc/rfc5646) format (e.g. `'en'`, `'fr'`, `'es'`, `'ja'`).

```ts
import { translate } from 'naively'

const result = await translate('Hello, world!', {
  sourceLanguage: 'en',
  targetLanguage: 'fr',
})

if (result.ok) {
  console.log(result.data) // 'Bonjour, le monde !'
} else {
  console.error(result.error?.message)
}
```

## API Reference

### `summarize(text, options?): Promise<SummarizeResult>`

| Option | Type | Default |
|--------|------|---------|
| `type` | `'tl;dr' \| 'key-points' \| 'teaser' \| 'headline'` | `'key-points'` |
| `length` | `'short' \| 'medium' \| 'long'` | `'medium'` |
| `format` | `'plain-text' \| 'markdown'` | `'plain-text'` |

### `detectLanguage(text): Promise<DetectLanguageResult>`

Returns a ranked list of language candidates with confidence scores (0.0–1.0):

```ts
const result = await detectLanguage('Bonjour le monde')

if (result.ok) {
  console.log(result.data)
  // [
  //   { detectedLanguage: 'fr', confidence: 0.998 },
  //   { detectedLanguage: 'en', confidence: 0.001 },
  // ]
}
```

> Accuracy is low for very short text or single words.

### `translate(text, options): Promise<TranslateResult>`

| Option | Type | Required |
|--------|------|----------|
| `sourceLanguage` | `string` (BCP 47) | ✅ |
| `targetLanguage` | `string` (BCP 47) | ✅ |

### `getAiSupport()`

Returns support and availability details for all built-in AI APIs.

### `isSummarizerSupported() / isTranslatorSupported(): boolean`

Synchronous presence checks.

---

Both `summarize()` and `translate()` always return a result without throwing:

```ts
interface SummarizeResult {
  ok: boolean
  data?: string
  error?: { code: string; message: string }
}

interface TranslateResult {
  ok: boolean
  data?: string
  error?: { code: string; message: string }
}
```

Edge cases handled internally: empty text, API not present, model unavailable, creation/runtime errors, and model cleanup (`destroy()`).

## Development

```bash
pnpm install
pnpm build      # outputs to dist/
pnpm typecheck  # tsc --noEmit
```

## Further Reading

- [Chrome Built-in AI overview](https://developer.chrome.com/docs/ai/built-in-apis)
- [Summarizer API docs](https://developer.chrome.com/docs/ai/summarizer-api)
- [Translator API docs](https://developer.chrome.com/docs/ai/translator-api)
- [Language Detector API docs](https://developer.chrome.com/docs/ai/language-detection)
- [People + AI Guidebook](https://pair.withgoogle.com/guidebook/) — UX guidance for AI features
- [`@types/dom-chromium-ai`](https://www.npmjs.com/package/@types/dom-chromium-ai) — official TypeScript types for Chrome AI APIs
