## UI
- [ ] Land on coloring for BookDetailsPage (states, genres etc), and extract to globals.css


## Nice-to-have feature
- [ ] Align search bar properly, and integrate it with actual functionality
- [ ] Improve search (fzf, etc)


## Bigger feature
- [ ] Implement statistics page
- [ ] Add commenting on books
- [ ] Create profile pages, settings etc etc
- [ ] Add shelf/collection functionality

## Design/Architectural changes
- [ ] Tie state change to page number?
- [ ] Clean the codebase, extract components where possible
- [ ] Force rating on "finish"
- [ ] Start logging user events in database. Link with Recent activity in dashboard


## LLM
- [ ] Integrate





**From tests**

- [ ] Get full test coverage
  
────────────────────────────────────────
1. Bug(s) in the **test environment / Jest setup**
────────────────────────────────────────
• ❌  src/lib/__tests__/firebase-utils.test.ts  
  Error: “Cannot find module './firebase' …”  
  →  The test mocks `./firebase`, but because Jest hasn’t been told how to
     resolve TS alias paths (or transpile ESM to CJS) the resolver can’t
     find the file. Add a `moduleNameMapper` (or point the mock at
     `'../firebase'`) and the suite will run.

• ❌  BookCard “should not trigger action for other keys”  
  `@testing-library/user-event` fires a synthetic `click` after certain
   keyboard interactions on elements with `role="button"`. In JSDOM that
   extra click is dispatched even for `{escape}`, so the callback is invoked
   once. The component is fine; the JSDOM + user-event behaviour is the
   culprit.

────────────────────────────────────────
2. **Faulty / over-strict test assertions**
────────────────────────────────────────
• ❌  Google Books API test-suite  
  – Expects `q=test%20book`, but `URLSearchParams` encodes spaces as
    “+”.  
  – Expects custom error text (“Network error …”) although the service
    re-throws the original `Error("Network error")`.  
  – Treats the (internal) class as a public export.  
  All three mismatches are in the tests, not the implementation.

• ❌  filterAndSortBooks “search query” cases  
  The tests assume searching for “Alpha” should only return *Alpha Book*,
  but “alpha” is also contained in the word “alphabet” that appears in the
  other mock descriptions, so the real filter quite correctly returns
  three items.

• ❌  cn utility “duplicate classes”  
  `clsx` intentionally keeps duplicate class names (only Tailwind
  conflicts are merged by `twMerge`). The test demanding perfect de-dupe is
  over-strict.

• ❌  AuthProvider test block  
  Several expectations don’t match the component’s actual console output or
  life-cycle (e.g. waiting for `updateDoc` before user/profile are ready).
  The provider behaves correctly; the tests need to await the right
  promises or loosen their expectations.

────────────────────────────────────────
3. **Real defects in the application code**
────────────────────────────────────────
• ❌  src/lib/google-books-api.ts  
  The class `GoogleBooksApiService` is **not exported**, yet other modules
  (and the tests) need to construct it. Exporting the class (or refactoring
  tests to use the singleton only) is required.

• ❌  convertManualEntryToBook (book-utils.ts)  
  – Parses page count with `parseInt`, so invalid input becomes `NaN`
    → store `0` instead.  
  – Uses `Date.now()` for IDs; two rapid calls can return the same value.  
    Include a random suffix or `crypto.randomUUID()`.

• ❌  validateRating (models.ts)  
  Relies on JS coercion so `'3'`, `null`, `NaN` all pass.  
  Guard with `typeof rating === 'number' && Number.isFinite(rating)`.

• ❌  canTransitionTo (models.ts)  
  `READING_STATE_TRANSITIONS[currentState]` crashes when `currentState`
  is invalid. Add a guard (`if !READING_STATE_TRANSITIONS[currentState] return false`).

These are the areas you need to fix (or loosen) to get the test suite back
to all-green.

