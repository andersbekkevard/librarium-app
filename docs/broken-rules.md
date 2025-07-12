# Architectural Rule Violations in Codebase

This document lists all known violations of the architectural rules as defined in [docs/structural-rules.md].

---

## 1. Component importing Service (FORBIDDEN)

### File: `src/components/dashboard/DashboardContent.tsx`
- **Line 3**: `import { ActivityItem, eventService } from "@/lib/services/EventService";`
- **Description**: This component directly imports and uses a service (`eventService`). Components must only interact with Providers, never Services directly.

---

## 2. Component importing Service (FORBIDDEN)

### File: `src/components/app/library/BookListItem.tsx`
- **Line 10**: `import { bookService } from "@/lib/services/BookService";`
- **Description**: This component directly imports and uses a service (`bookService`) for calculating progress. Even if only a utility method is used, components must not import from the service layer. Utility functions should be moved to a shared utility module if needed by components.

---

## 3. Page importing Service (FORBIDDEN)

### File: `src/app/(app)/dashboard/page.tsx`
- **Line 7**: `import { userService } from "@/lib/services";`
- **Description**: This Next.js page directly imports and uses a service (`userService`). Pages are part of the presentation layer and must only interact with Providers, never Services directly.

---

## Summary
- All service usage in components or pages must be refactored to go through Providers.
- Utility functions needed by components should be moved to a shared utility module, not imported from the service layer.
- See [docs/structural-rules.md] for correct architectural patterns. 