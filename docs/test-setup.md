# Test Setup

## Unit Tests Written

Unit tests for the availability logic are in `src/lib/availability.test.ts`.

**Tests cover:**
- Empty config returns 0 slots ✓
- Legacy weekly rules present but no dates => 0 slots (verifies fallback removed) ✓
- Opened date creates slots in ET timezone ✓
- Blocked date returns no slots ✓
- Minimum lead time respected ✓
- Slots filtered when overlapping with bookings ✓

## Test Runner Setup

**Issue:** Vitest installation has peer dependency conflicts with the current Node/TypeScript versions.

**Manual setup required:**
1. Resolve peer dependency conflicts between vitest, @types/node, and Next.js
2. Install vitest and vite with compatible versions
3. Run `npm test` to execute tests

**Files:**
- `vitest.config.ts` - Vitest configuration
- `src/lib/availability.test.ts` - Unit tests for availability logic
- `package.json` - Test scripts added

**Alternative:** Use Jest instead of Vitest if peer dependency issues persist.

## Running Tests Manually

Once vitest is installed:
```bash
npm test          # Run all tests once
npm run test:watch  # Run in watch mode
```

The tests mock Prisma and test the core availability logic in isolation.
