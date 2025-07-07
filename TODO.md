- [ ] Land on coloring for BookDetailsPage (states, genres etc), and extract to globals.css
- [ ] Tie state change to page number?
- [ ] Align search bar properly, and integrate it with actual functionality
- [X] Remove progress percentage hard coded in book?
- [X] Start fetching genres when adding books, and add to books data model
- [ ] Start logging user events in database. Link with Recent activity in dashboard
- [ ] Implement statistics page
- [ ] Add commenting on books
- [ ] Create profile pages, settings etc etc
- [ ] Improve search (fzf, etc)
- [ ] Add shelf/collection functionality
- [ ] Clean the codebase, extract components where possible
- [ ] Force rating on "finish"




TBM:
- [X] Ensure that you don’t duplicate logic across modules.
Currently, there are two parallel ways to access auth state – via the context (useAuthContext) and via a custom hook (useAuth).
The AuthProvider uses Firebase’s onAuthStateChanged and stores the user in context, and your useAuth hook also sets up its own onAuthStateChanged listener.
This can lead to multiple subscriptions and inconsistent state.
It’s better to converge on one approach – ideally use the context everywhere so all components share the same user state.
For example, in MyLibraryPage you import useAuth and get the user that way, whereas in AddBooksPage you correctly use useAuthContext.
Unifying these (e.g. have useAuth() internally call useAuthContext() or remove the custom hook) will reduce tech debt and ensure consistent auth handling.

- [X] One pattern that could be improved is separation of presentational vs container logic. The architecture doc mentions separating presentational and container components,
but currently some components mix UI and data fetching logic. For instance, MyLibraryPage both subscribes to Firestore and renders the list.
This is acceptable for now, but as complexity grows, consider moving data-fetching into a custom hook or context provider.
For example, a hook useUserBooks(userId) could encapsulate the Firestore subscription and provide loading/error state and book list, which the component then consumes.
This would make the component more focused on presentation (rendering lists, filters, etc.) and easier to test, while the hook deals with side-effects.

- [X] One critique: the Dashboard page is functioning as a single-page application within Next – it uses a state (activeSection) to conditionally render sub-sections like “My Library”, “Add Books”,
and even a “Book Detail” view. While this works, it bypasses Next.js’s routing capabilities.
Ideally, each major section could be its own route for clarity and deep-linking.
For example, instead of activeSection === "library" inside the dashboard component,
you could have src/app/(app)/library/page.tsx that shows the library (and navigate to it via Next’s Link or router).
This way, URLs reflect the view (e.g. /library or /dashboard vs all under /dashboard).
It also avoids keeping an oversized component. Currently,
the Dashboard component is quite large and manages many concerns (dashboard stats, book list, adding books, book detail modal) in one file

- [ ] **Centralize books state management to prevent duplicate Firestore subscriptions
  - Dashboard and MyLibraryPage currently subscribe to the same books data separately
  - Consider lifting state up by passing books as props from Dashboard to MyLibraryPage
  - Or implement a books context similar to auth context for global state management
  - This would eliminate redundant Firestore listeners and ensure data consistency across components**

- [ ] Extract one centralized sorting method for books