# Technology Stack

## Frontend Framework
- **Next.js 15** with App Router and Turbopack for development
- **React 19** with TypeScript for type-safe component development
- **TypeScript 5** with strict mode enabled

## Styling & UI
- **Tailwind CSS 4** for utility-first styling
- **Radix UI** primitives via shadcn/ui for accessible components
- **Lucide React** for consistent iconography
- **next-themes** for dark/light mode support
- **Geist** fonts (sans and mono) for typography

## Backend & Database
- **Firebase Authentication** with Google OAuth provider
- **Firebase Firestore** for real-time NoSQL database
- **Google Books API** for book metadata and cover images

## Development Tools
- **ESLint** with Next.js and TypeScript configurations
- **Jest** with React Testing Library for unit/integration testing
- **PostCSS** with Tailwind CSS processing

## Key Libraries
- **date-fns** for date manipulation
- **recharts** for data visualization
- **embla-carousel-react** for carousel components
- **class-variance-authority** and **clsx** for conditional styling
- **tailwind-merge** for class merging

## Common Commands

### Development
```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Testing
```bash
npm test             # Run Jest tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

## Configuration Notes
- Path alias `@/*` maps to `src/*`
- Images allowed from Google Books domains
- Jest configured with Next.js integration and jsdom environment
- Coverage threshold set to 70% for branches, functions, lines, and statements
- TypeScript target: ES2017 with strict mode
- ESLint warns on unused vars and explicit any types