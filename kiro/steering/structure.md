# Project Structure

## Root Directory Organization

```
├── src/                    # Source code
├── public/                 # Static assets
├── docs/                   # Documentation
├── specs/                  # Feature specifications
├── plans/                  # Planning documents
└── .kiro/                  # Kiro configuration
```

## Source Code Structure (`src/`)

### Application Layer (`src/app/`)
- **Route Groups**: `(app)/` for authenticated pages, `(landing)/` for public pages
- **App Router**: Next.js 15 App Router with nested layouts
- **Page Components**: Each route has a `page.tsx` file
- **Layouts**: Shared layouts at appropriate nesting levels

### Component Architecture (`src/components/`)
```
components/
├── app/                    # App-specific business components
│   ├── activity/          # Activity tracking components
│   ├── book-detail/       # Book detail page components
│   ├── books/             # Book management components
│   └── library/           # Library view components
├── dashboard/             # Dashboard-specific components
├── landing/               # Landing page sections
├── ui/                    # Reusable UI primitives (shadcn/ui)
└── icons/                 # Icon components
```

### Library Structure (`src/lib/`)
```
lib/
├── api/                   # External API integrations
├── books/                 # Book-specific utilities
├── constants/             # Application constants
├── design/                # Design system (colors, tokens)
├── errors/                # Error handling utilities
├── hooks/                 # Custom React hooks
├── models/                # TypeScript interfaces and models
├── providers/             # React Context providers
├── repositories/          # Data access layer
├── services/              # Business logic layer
├── test-utils/            # Testing utilities and mocks
└── utils/                 # General utility functions
```

## Architecture Patterns

### Layered Architecture
1. **Presentation Layer**: React components and pages
2. **Service Layer**: Business logic and orchestration
3. **Repository Layer**: Data access abstraction
4. **Models Layer**: Type definitions and validation

### File Naming Conventions
- **Components**: PascalCase (e.g., `BookCard.tsx`)
- **Pages**: lowercase `page.tsx` (Next.js App Router)
- **Utilities**: camelCase (e.g., `book-utils.ts`)
- **Types/Interfaces**: PascalCase in `models.ts` files
- **Tests**: `*.test.tsx` or `__tests__/` directories

### Import Patterns
- Use `@/` path alias for all internal imports
- Group imports: external libraries, then internal modules
- Prefer named exports over default exports for utilities
- Use barrel exports (`index.ts`) for clean imports

### Component Organization
- **Co-location**: Keep related components, tests, and utilities together
- **Feature Folders**: Group by feature/domain rather than technical type
- **Shared Components**: Place in `ui/` for reusable primitives
- **Business Components**: Place in feature-specific folders

### Testing Structure
- **Unit Tests**: Alongside source files or in `__tests__/` folders
- **Integration Tests**: In component-specific test folders
- **Test Utilities**: Centralized in `src/lib/test-utils/`
- **Mocks**: Firebase and API mocks in test utilities

### Data Flow Patterns
- **Context Providers**: For global state (auth, books, user)
- **Service Layer**: For business logic and API orchestration
- **Repository Pattern**: For data access abstraction
- **Event Logging**: For activity tracking and analytics

## Key Conventions

### TypeScript
- Strict mode enabled with comprehensive type coverage
- Interface definitions in `models/` directory
- Type guards for runtime validation
- Service and repository interfaces for dependency injection

### Styling
- Tailwind CSS utility classes
- Component variants using `class-variance-authority`
- Design tokens in `lib/design/` directory
- Responsive design with mobile-first approach

### Error Handling
- Centralized error handling utilities
- Service layer returns `ServiceResult<T>` types
- Repository layer returns `RepositoryResult<T>` types
- Error boundaries for component-level error handling