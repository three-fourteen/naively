# naively

A minimal TypeScript wrapper around [Chrome Built-in AI APIs](https://developer.chrome.com/docs/ai/built-in-apis).

## Status

Chrome Built-in AI APIs are actively shipping. As of **Chrome 138+** (stable):

| API | Status | Supported |
|-----|--------|-----------|
| [Summarizer](https://developer.chrome.com/docs/ai/summarizer-api) | ✅ Stable (Chrome 138+) | ✅ |
| [Translator](https://developer.chrome.com/docs/ai/translator-api) | ✅ Stable (Chrome 138+) | ✅ |
| [Language Detector](https://developer.chrome.com/docs/ai/language-detection) | ✅ Stable (Chrome 138+) | ✅ |
| [Writer](https://developer.chrome.com/docs/ai/writer-api) / [Rewriter](https://developer.chrome.com/docs/ai/rewriter-api) | 🔬 Origin Trial | Soon |
| [Proofreader](https://developer.chrome.com/docs/ai/proofreader-api) | 🔬 Origin Trial (Chrome 141–145) | Soon |
| [Prompt API](https://developer.chrome.com/docs/ai/prompt-api) | ✅ Stable, but extensions-only for now — multimodal input is EPP-only | Soon |

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

**Summarizer / Language Detector availability values:**

| Value | Meaning |
|-------|---------|
| `available` | Model is downloaded and ready (older Chrome builds report this as `readily`; `naively` accepts both) |
| `downloadable` | Supported, but model needs to download first |
| `downloading` | Model download is already in progress |
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

#### Assign expected languages

Chrome downloads language packs on demand, so declaring the languages you expect up front lets it prepare the right ones before summarizing. All values are [BCP 47](https://www.rfc-editor.org/rfc/rfc5646) language codes — see [Assign expected languages](https://developer.chrome.com/docs/ai/summarizer-api#assign_expected_languages) in the Chrome docs.

```ts
const result = await summarize(articleText, {
  expectedInputLanguages: ['en', 'es'],  // languages the input text may be in
  expectedContextLanguages: ['en'],      // languages sharedContext/context may be in
  outputLanguage: 'es',                  // language the summary should be written in
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
| `sharedContext` | `string` | — |
| `expectedInputLanguages` | `string[]` (BCP 47) | — |
| `expectedContextLanguages` | `string[]` (BCP 47) | — |
| `outputLanguage` | `string` (BCP 47) | — |

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

## Design Notes

- **No session reuse.** Every call to `summarize()`, `summarizeStreaming()`, `translate()`, and `detectLanguage()` creates a fresh model instance and calls `destroy()` on it once the call finishes. This keeps the API stateless and leak-free, but it means each call pays the model's `create()` cost again — there's currently no way to hold a session open across multiple calls. If you need to process many texts back-to-back with the same options, batch them yourself and be aware of the repeated setup cost; a session-reuse API may be added if a concrete use case needs it.

## Development

```bash
pnpm install
pnpm build      # outputs to dist/
pnpm typecheck  # tsc --noEmit
pnpm test       # runs the vitest suite (jsdom-mocked browser AI APIs)
```

### Releasing

Publishing to npm is semi-automated: pushing a `v*.*.*` tag triggers [`.github/workflows/publish.yml`](.github/workflows/publish.yml), which runs typecheck/test/build and then stages the release with `npm stage publish`. To cut a release:

```bash
npm version patch   # or minor / major — updates package.json and creates a git tag
git push --follow-tags
```

The workflow fails fast if the pushed tag doesn't match the version in `package.json`. It authenticates via npm's [Trusted Publishing](https://docs.npmjs.com/trusted-publishers/) (OIDC) — no `NPM_TOKEN` secret needed. One-time setup on npmjs.com, under the package's **Settings → Trusted Publisher**:

- Provider: GitHub Actions
- Organization / repository: `three-fourteen/naively`
- Workflow filename: `publish.yml`
- Environment: (leave blank)
- "Allow npm publish": left **unchecked** — the trusted publisher can only stage a release, not ship it directly

After a staged run, approve and promote the release from the package's page on npmjs.com. This keeps a human in the loop for every publish rather than shipping the instant a tag is pushed; flip "Allow npm publish" on and swap `npm stage publish` for `npm publish` in the workflow if you want to go fully hands-off later.

The package must already exist on npm before you can add a trusted publisher for it.

## Further Reading

- [Chrome Built-in AI overview](https://developer.chrome.com/docs/ai/built-in-apis)
- [Summarizer API docs](https://developer.chrome.com/docs/ai/summarizer-api)
- [Translator API docs](https://developer.chrome.com/docs/ai/translator-api)
- [Language Detector API docs](https://developer.chrome.com/docs/ai/language-detection)
- [People + AI Guidebook](https://pair.withgoogle.com/guidebook/) — UX guidance for AI features
- [`@types/dom-chromium-ai`](https://www.npmjs.com/package/@types/dom-chromium-ai) — official TypeScript types for Chrome AI APIs
