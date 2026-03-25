Status: pending

Goal
Wire up src/index.ts to export the full public API.

Context
Final integration step. index.ts must re-export everything from core/support and summarizer/summarize.

Dependencies: T-004-summarize

Subtasks
- [ ] Add `export * from "./core/support"` to src/index.ts
- [ ] Add `export * from "./summarizer/summarize"` to src/index.ts
- [ ] Run full tsc build to confirm output compiles cleanly

Done Criteria
- src/index.ts exports all public symbols
- `tsc` build succeeds with dist/ output

Verification
- `tsc` produces dist/ with no errors
- dist/index.js exists

Next Step
Update src/index.ts and run build.

Blockers
none
