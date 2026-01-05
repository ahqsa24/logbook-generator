# Implementation Plan: Smart LocalStorage Management

## Overview
Implement a smart localStorage management system for the multi-step form that:
1. Persists data on refresh (same step)
2. Clears subsequent steps when going BACK
3. Overwrites old values with new input (no stacking)
4. Saves Step 1 data (aktivitasId, cookies) to localStorage

## Current Behavior Analysis
- Step 1 & 2 data is NOT saved to localStorage (only saved when step >= 3)
- Going back to step 1 or 2 clears ALL localStorage
- No granular control over which step data to clear

## Proposed Storage Structure
```typescript
// Separate keys for each step to allow granular control
const STORAGE_KEYS = {
  STEP1: 'ipb-logbook-step1',  // aktivitasId, cookies
  STEP2: 'ipb-logbook-step2',  // file info (not file data), lecturers
  STEP3: 'ipb-logbook-step3',  // entries metadata
  META: 'ipb-logbook-meta'     // current step, timestamps
};

// IndexedDB remains for large file data
```

## Behavior Matrix

| Action | Step 1 Storage | Step 2 Storage | Step 3 Storage |
|--------|----------------|----------------|----------------|
| Input at Step 1 | ✅ Save/Overwrite | - | - |
| Input at Step 2 | ✅ Keep | ✅ Save/Overwrite | - |
| Input at Step 3 | ✅ Keep | ✅ Keep | ✅ Save/Overwrite |
| Back to Step 2 from Step 3 | ✅ Keep | ✅ Keep | ❌ Clear |
| Back to Step 1 from Step 2 | ✅ Keep | ❌ Clear | ❌ Clear |
| Refresh on any Step | ✅ Keep All | ✅ Keep All | ✅ Keep All |
| Start Over | ❌ Clear All | ❌ Clear All | ❌ Clear All |

## Implementation Steps

### Phase 1: Create Storage Utility (lib/stepStorage.ts)

```typescript
// 1. Create new utility file for step-based storage
// - Separate keys for each step
// - clearFromStep(stepNumber) - clears storage from step N onwards
// - saveStepData(step, data) - saves specific step data
// - loadStepData(step) - loads specific step data
// - clearAllStepData() - clears everything
```

### Phase 2: Update StepsSection.tsx

1. **Modify state initialization:**
   - Load Step 1 data (aktivitasId, cookies) from localStorage on mount
   - Keep current IndexedDB logic for file data

2. **Modify save logic:**
   - Save Step 1 data immediately when form is submitted
   - Save Step 2 data when file is processed
   - Keep current Step 3+ save logic

3. **Modify back navigation:**
   - When going BACK, clear storage for subsequent steps only
   - `setStep(2)` from Step 3 → clear Step 3 storage
   - `setStep(1)` from Step 2 → clear Step 2 & 3 storage

4. **Keep refresh behavior:**
   - All steps restore from localStorage on mount

### Phase 3: Update Step1Authentication.tsx

1. **Load saved data on mount:**
   - Pre-fill aktivitasId and cookie inputs if saved data exists
   - Show "Resume session" indicator if data exists

2. **Save data on submit:**
   - Save aktivitasId and cookies to localStorage

## Files to Modify

1. **NEW: `lib/stepStorage.ts`** - Storage utility functions
2. **UPDATE: `components/StepsSection.tsx`** - Main state management
3. **UPDATE: `components/Step1Authentication.tsx`** - Load/display saved Step 1 data

## Security Considerations

- Cookies are stored in localStorage (already base64/parsed format)
- Consider adding expiry check for stored sessions
- Optional: Add encryption for sensitive data
- Clear storage on browser close? (sessionStorage alternative)

## Estimated Changes

- ~100 lines new code (stepStorage.ts)
- ~50 lines modified (StepsSection.tsx)
- ~30 lines modified (Step1Authentication.tsx)

## Testing Checklist

- [ ] Step 1: Input → Refresh → Data persists
- [ ] Step 2: Input → Refresh → Data persists
- [ ] Step 3: Input → Refresh → Data persists
- [ ] Step 3 → Back to Step 2: Step 3 data cleared
- [ ] Step 2 → Back to Step 1: Step 2+3 data cleared
- [ ] New Step 1 input overwrites old data
- [ ] Start Over clears all data
- [ ] File data in IndexedDB follows same rules
