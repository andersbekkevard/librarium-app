# Architectural Rule Violations in Codebase

This document lists all known violations of the architectural rules as defined in [docs/structural-rules.md].

---

## 1. Component importing Service (FORBIDDEN)

### File: `src/components/dashboard/DashboardContent.tsx`
- **Line 3**: `import { ActivityItem, eventService } from "@/lib/services/EventService";`
- **Description**: This component directly imports and uses a service (`eventService`). Components must only interact with Providers, never Services directly.
