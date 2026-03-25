Status: pending

Goal
Create all TypeScript types for the chrome-ai library.

Context
Defines the shared type surface used across the entire library. Must be strict, no `any`.

Dependencies: T-001-setup-project

Subtasks
- [ ] Create src/types.ts with SummaryType, SummaryLength, SummaryFormat
- [ ] Add SummarizeOptions interface
- [ ] Add SummarizeResult interface

Done Criteria
- src/types.ts exists and exports all 5 types/interfaces
- No use of `any`
- Types match spec exactly

Verification
- `tsc --noEmit` passes

Next Step
Create src/types.ts.

Blockers
none
