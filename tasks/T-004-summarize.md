Status: pending

Goal
Implement the `summarize` function in src/summarizer/summarize.ts.

Context
Core functionality. Must validate input, check availability, create a Summarizer instance, run it, and clean up. All errors must be caught and returned as SummarizeResult with ok: false.

Dependencies: T-003-feature-detection

Subtasks
- [ ] Create src/summarizer/summarize.ts
- [ ] Validate text is non-empty — return error result if empty
- [ ] Check Summarizer exists in window — return error result if not
- [ ] Call safeAvailabilityCheck — return error result if 'unavailable'
- [ ] Create summarizer with options (defaults: type=key-points, length=medium, format=plain-text)
- [ ] Call summarizer.summarize(text) and return { ok: true, data: result }
- [ ] Catch all errors and return { ok: false, error: { code: 'SUMMARIZE_FAILED', message: err.message } }
- [ ] In finally block, call summarizer.destroy() if it exists

Done Criteria
- All edge cases handled (empty text, no API, unavailable, create error, summarize error)
- Cleanup always runs
- Return type is always SummarizeResult

Verification
- `tsc --noEmit` passes

Next Step
Create src/summarizer/summarize.ts.

Blockers
none
