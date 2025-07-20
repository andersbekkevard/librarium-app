# Librarium Tech Stack

## Core Framework & Runtime

- **Next.js**: 15.3.5 (App Router, Server Components, Image Optimization)
- **React**: 19.0.0 (Latest with Concurrent Features)
- **TypeScript**: ^5 (Strict mode, comprehensive type safety)
- **Node.js**: Compatible with latest LTS

## UI & Frontend Libraries

### CSS & Styling
- **Tailwind CSS**: ^4 (with custom color system, oklch color space, dark mode support)
- **Custom Color System**: Centralized via `src/lib/design/colors.ts` with CSS variables
- **class-variance-authority**: ^0.7.1 (Component variant system)
- **clsx**: ^2.1.1 (Conditional classes)
- **tailwind-merge**: ^3.3.1 (Class deduplication)
- **tw-animate-css**: ^1.3.5 (Animation utilities)

### UI Component Library
- **Radix UI Primitives**: Accessible, unstyled components
  - @radix-ui/react-accordion: ^1.2.11
  - @radix-ui/react-avatar: ^1.1.10
  - @radix-ui/react-dialog: ^1.1.14
  - @radix-ui/react-label: ^2.1.7
  - @radix-ui/react-navigation-menu: ^1.2.13
  - @radix-ui/react-separator: ^1.1.7
  - @radix-ui/react-slot: ^1.2.3
  - @radix-ui/react-tabs: ^1.1.12
- **shadcn/ui**: Production-ready components (Radix + Tailwind integration)

### Advanced UI Components
- **Charts & Visualization**: Custom chart components with data visualization
- **Pagination System**: Advanced pagination with localStorage persistence
- **Error Boundaries**: Comprehensive error handling and display
- **Star Rating System**: Interactive rating components
- **Genre Badges**: Color-coded genre visualization
- **Mobile Responsive**: Touch-friendly interface with adaptive layouts

### Icons & Media
- **Lucide React**: ^0.525.0 (Modern icon system)
- **Embla Carousel**: ^8.6.0 (Touch-friendly carousels)
- **Next.js Image**: Optimized image loading and processing

### Theming & Interaction
- **next-themes**: ^0.4.6 (Dark/light mode with system preference)
- **Design Philosophy**: Notion-inspired, minimal, clean aesthetic

## Backend, Database & Cloud

### Firebase Services
- **Firebase JS SDK**: ^11.10.0 (Latest with enhanced performance)
  - **Authentication**: Google OAuth 2.0 with automatic profile creation
  - **Firestore**: Real-time NoSQL database with offline support
  - **Security Rules**: User-centric data access control
  - **Real-time Listeners**: Live data synchronization across clients
  - **Storage**: Ready for file uploads (book covers, user content)
  - **Analytics**: User engagement and reading pattern tracking

### External APIs & Services
- **Google Books API**: Book metadata, search, and cover image fetching
- **Vercel Platform**: Hosting with Edge Functions and automatic deployments
- **CDN**: Optimized static asset delivery and image processing

### Architecture Patterns
- **Service Layer**: Business logic isolation with repository pattern
- **Real-time Sync**: Optimistic updates with server reconciliation
- **User-Centric Data**: Security-optimized document organization
- **Event-Driven**: Comprehensive activity logging and state management

## Development & Testing

### Code Quality & Linting
- **ESLint**: ^9 (next/core-web-vitals, next/typescript configurations)
- **TypeScript**: Strict mode with comprehensive type checking
- **Prettier**: Code formatting (integrated with ESLint)

### Testing Framework
- **Jest**: ^30.0.4 (Latest with enhanced performance)
- **@testing-library/react**: ^16.3.0 (Component testing)
- **@testing-library/jest-dom**: ^6.6.3 (DOM assertions)
- **@testing-library/user-event**: ^14.6.1 (User interaction testing)
- **Coverage Requirements**: 70% threshold for branches, functions, lines, statements

### Build Tools & Performance
- **Turbopack**: Next.js development bundler for fast builds
- **PostCSS**: ^4 with @tailwindcss/postcss plugin
- **Bundle Analyzer**: Performance monitoring and optimization
- **Hot Reload**: Fast development with optimized rebuild times

### TypeScript Ecosystem
- **@types/node**: ^20 (Node.js type definitions)
- **@types/react**: ^19 (React 19 type definitions)  
- **@types/react-dom**: ^19 (React DOM type definitions)
- **@types/jest**: ^30.0.0 (Jest testing type definitions)

## Architecture & Patterns

### Modern React Patterns
- **Functional Components**: React 19 with hooks throughout
- **Context Providers**: Specialized providers (Auth, User, Books, Events)
- **Server Components**: Next.js App Router with server-side rendering
- **Custom Hooks**: `usePagination`, `useIsMobile`, `useScrollAnimation`

### Accessibility & UX
- **WCAG Compliance**: Radix UI primitives with ARIA support
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Semantic HTML and proper labeling
- **Touch Interfaces**: Mobile-optimized interactions

### State Management
- **React Context**: Global state with specialized providers
- **Real-time Sync**: Firestore listeners with optimistic updates
- **Local Storage**: Pagination preferences and user settings
- **Error Boundaries**: Resilient UI with graceful error handling

### Utility Libraries
- **Custom Utilities**: `src/lib/utils.ts`, `src/lib/book-utils.ts`
- **Color System**: `src/lib/design/colors.ts` with CSS variables
- **Type Guards**: Runtime validation with TypeScript
- **Business Logic**: Centralized in service layer

## Development Workflow

### Commands
```bash
npm run dev      # Development server with Turbopack
npm run build    # Production build
npm run lint     # Code linting
npm run test     # Test suite
npm run test:watch    # Watch mode testing
npm run test:coverage # Coverage reporting
```

### Quality Assurance
- **Pre-commit Hooks**: Linting and type checking
- **Continuous Testing**: Automated test runs with coverage
- **Type Safety**: Strict TypeScript throughout
- **Performance Monitoring**: Bundle analysis and optimization

---

**For more details, see:**
- `docs/architecture.md` (system architecture and patterns)
- `docs/models.md` (data models and validation)
- `docs/structural-rules.md` (architectural guidelines)
- `CLAUDE.md` (development guidelines and project overview) 