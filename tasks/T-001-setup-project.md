Status: pending

Goal
Initialize the TypeScript project structure for the `chrome-ai` library.

Context
This is the foundation task. Sets up package.json, tsconfig.json, and the directory structure needed for all subsequent tasks.

Dependencies: none

Subtasks
- [ ] Create package.json with ESM output, no external dependencies
- [ ] Create tsconfig.json with strict mode and ESM target
- [ ] Create directory structure: src/core/, src/summarizer/
- [ ] Create empty src/index.ts entry point

Done Criteria
- package.json exists with `"type": "module"` and build script
- tsconfig.json targets ESNext with strict mode
- src/core/ and src/summarizer/ directories exist
- src/index.ts exists

Verification
- Run `tsc --noEmit` with no errors on an empty project

Next Step
Execute subtasks in order.

Blockers
none
