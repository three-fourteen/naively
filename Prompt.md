Create a TypeScript library called "chrome-ai" that provides a clean wrapper around Chrome Built-in AI APIs, starting with the Summarizer API.

Goals:

- Provide a simple, consistent developer experience
- Handle feature detection and availability internally
- Return typed, predictable results
- Be minimal and extensible for future APIs (Translator, Detector, etc.)

---

## Requirements

### 1. Project setup

- TypeScript project
- Output ESM
- No external dependencies
- Clean modular structure

---

### 2. Types

Create types:

````ts
export type SummaryType = 'tl;dr' | 'key-points' | 'teaser' | 'headline'
export type SummaryLength = 'short' | 'medium' | 'long'
export type SummaryFormat = 'plain-text' | 'markdown'

export interface SummarizeOptions {
  type?: SummaryType
  length?: SummaryLength
  format?: SummaryFormat
}

export interface SummarizeResult {
  ok: boolean
  data?: string
  error?: {
    code: string
    message: string
  }
}



## 3. Feature Detection

**Feature detection method**

Implement `getAiSupport` to determine support for Chrome's Summarizer API.

```ts
export async function getAiSupport() {
  return {
    summarizer: {
      supported: 'Summarizer' in window,
      availability: await safeAvailabilityCheck(),
    },
  };
}
````

**`safeAvailabilityCheck` logic**

- If `Summarizer` is not in `window`, return `'unsupported'`
- Else, call `Summarizer.availability()`
- Catch and handle errors

---

## 4. Summarize Function

**Definition:**

```ts
export async function summarize(
  text: string,
  options?: SummarizeOptions,
): Promise<SummarizeResult>
```

**Behavior:**

- Validate that `text` is non-empty
- Check if `Summarizer` exists
- Check availability
  - If `'unavailable'`, return an error result
- Create summarizer instance:

  ```ts
  const summarizer = await Summarizer.create({
    type: options?.type ?? "key-points",
    length: options?.length ?? "medium",
    format: options?.format ?? "plain-text",
  })
  ```

- Run:

  ```ts
  const result = await summarizer.summarize(text)
  ```

- Return success:

  ```ts
  return { ok: true, data: result }
  ```

- Normalize and return errors:

  ```ts
  return {
    ok: false,
    error: {
      code: "SUMMARIZE_FAILED",
      message: err.message,
    },
  }
  ```

- Cleanup (`finally`): if `summarizer.destroy` exists, call it

---

## 5. Edge Cases

- Gracefully handle:
  - Empty `text`
  - API not supported
  - Availability = `'unavailable'`
  - Errors during creation
  - Errors during summarize

---

## 6. Export API

**In `index.ts`:**

```ts
export * from "./core/support"
export * from "./summarizer/summarize"
```

---

## 7. Code Quality Guidelines

- Use strict TypeScript
- Avoid `any`
- Use clear, consistent naming
- Break into small, focused functions
- Add comments for any Chrome API quirks

---

## 8. Bonus (Optional)

**Add:**

```ts
export function isSummarizerSupported(): boolean
```

---

**Important:**  
Keep the library minimal and clean. Do **not** over-engineer.  
Prioritize correctness and developer experience.
