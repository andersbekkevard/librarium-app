# Librarium Tech Stack

## UI & Frontend

- **Next.js**: 15.3.5
- **React**: 19.0.0
- **TypeScript**: ^5
- **Tailwind CSS**: ^4 (with custom color system, oklch color space, dark mode)
- **Radix UI Primitives**:
  - @radix-ui/react-accordion: ^1.2.11
  - @radix-ui/react-avatar: ^1.1.10
  - @radix-ui/react-dialog: ^1.1.14
  - @radix-ui/react-label: ^2.1.7
  - @radix-ui/react-navigation-menu: ^1.2.13
  - @radix-ui/react-separator: ^1.1.7
  - @radix-ui/react-slot: ^1.2.3
  - @radix-ui/react-tabs: ^1.1.12
- **shadcn/ui**: (Radix + Tailwind integration, see components.json)
- **Lucide React** (icons): ^0.525.0
- **Embla Carousel**: ^8.6.0
- **next-themes** (theme switching): ^0.4.6
- **tw-animate-css** (animations): ^1.3.5
- **class-variance-authority**: ^0.7.1
- **clsx**: ^2.1.1
- **tailwind-merge**: ^3.3.1
- **Custom centralized color system**: via Tailwind CSS variables and `src/lib/colors.ts`
- **Design**: Notion-inspired, minimal, clean

## Backend, Database & Cloud

- **Firebase JS SDK**: ^11.10.0
  - Authentication (Google OAuth)
  - Firestore (NoSQL database)
  - Storage
  - Analytics
- **Google Books API**: (external, for book metadata)
- **Hosting**: Vercel/AWS (see `docs/architecture.md`)
- **CDN**: Static assets (see `docs/architecture.md`)

## Development & Tooling

- **ESLint**: ^9 (config: next/core-web-vitals, next/typescript)
- **Jest**: ^30.0.4
- **@testing-library/react**: ^16.3.0
- **@testing-library/jest-dom**: ^6.6.3
- **@testing-library/user-event**: ^14.6.1
- **PostCSS**: ^4 (plugin: @tailwindcss/postcss)
- **Turbopack**: (Next.js dev bundler)
- **TypeScript types**: @types/node (^20), @types/react (^19), @types/react-dom (^19), @types/jest (^30.0.0)

## Other & Architecture

- **Accessibility**: Radix UI primitives, custom ARIA/keyboard handling
- **Modern React patterns**: hooks, context, server components (Next.js App Router)
- **Centralized color system**: via Tailwind CSS variables and `src/lib/colors.ts`
- **Minimal, Notion-inspired UI/UX**
- **Custom utilities**: see `src/lib/utils.ts`, `src/lib/book-utils.ts`, etc.

---

**For more details, see:**
- `docs/README.md` (project overview)
- `docs/architecture.md` (system architecture)
- `src/lib/colors.ts` (color system)
- `package.json` (full dependency list) 