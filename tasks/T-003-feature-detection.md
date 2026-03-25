Status: pending

Goal
Implement `getAiSupport` and `safeAvailabilityCheck` in src/core/support.ts.

Context
Feature detection for Chrome's Summarizer API. Must handle the case where the API doesn't exist in window, and catch any errors from Summarizer.availability().

Dependencies: T-002-types

Subtasks
- [ ] Create src/core/support.ts
- [ ] Implement safeAvailabilityCheck: returns 'unsupported' if Summarizer not in window, else calls Summarizer.availability() with error handling
- [ ] Implement getAiSupport returning { summarizer: { supported, availability } }
- [ ] Implement isSummarizerSupported(): boolean (bonus)

Done Criteria
- src/core/support.ts exports getAiSupport and isSummarizerSupported
- safeAvailabilityCheck never throws
- Returns correct shape matching spec

Verification
- `tsc --noEmit` passes

Next Step
Create src/core/support.ts.

Blockers
none
