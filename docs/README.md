# Librarium

A web application for managing personal book collections and tracking reading progress.

### Landing page

![Landing Page](docs/images/landing-page.png "Landing Page")

### Dashboard

![Dashboard](docs/images/dashboard.png "Dashboard")

## Overview

Librarium is a personal library management system that allows users to organize their book collections, track reading progress, and maintain reading statistics. The application supports both owned books and wishlist items, with features for progress tracking and book rating.

## Current State

The application is in active development with the following functionality implemented:

- **User Authentication**: Google OAuth integration for user sign-in
- **Book Management**: Add, edit, and organize books in personal library
- **Reading Progress**: Track reading state (not started, in progress, finished) with page-level progress tracking
- **Book Information**: Integration with Google Books API for automatic metadata retrieval
- **Library Organization**: Filter and sort books by various criteria (title, author, reading state, ownership)
- **Reading Statistics**: Basic statistics tracking for books read and library size
- **Responsive Design**: Mobile-friendly interface with grid and list view modes

## Technology Stack

### Frontend

- **Next.js 15**: React framework with App Router
- **React 19**: UI library with TypeScript support
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives (via shadcn/ui)
- **Lucide React**: Icon library

### Backend & Database

- **Firebase Authentication**: User management with Google OAuth
- **Firebase Firestore**: Real-time NoSQL database

- **Google Books API**: Book metadata and cover images

### Development Tools

- **ESLint**: Code linting with Next.js configuration
- **PostCSS**: CSS processing with Tailwind CSS
- **Turbopack**: Fast development bundler (Next.js 15)

## Architecture

The application follows a Firebase-native approach with:

- Direct Firebase SDK integration in React components
- Real-time data synchronization via Firestore listeners
- Type-safe data models with TypeScript interfaces
- Component-based React patterns with custom hooks
- Serverless cloud functions for external API integration

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Set up Firebase configuration:
   - Create a Firebase project
   - Enable Authentication with Google provider
   - Create a Firestore database
   - Add your Firebase configuration to environment variables

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) to view the application

## Planned Features

- Advanced search and filtering capabilities
- Book sharing and collaboration
- Reading analytics and goal tracking
- Quote and note collection
- Book recommendations
- Import/export functionality

## Project Structure

```
src/
├── app/                  # Next.js App Router pages
├── components/          # Reusable UI components
├── lib/                 # Utilities, hooks, and Firebase integration
└── styles/             # Global styles and theme configuration
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## License

**Copyright (c) 2025 Librarium. All rights reserved.**

This software and associated documentation files (the "Software") are proprietary and confidential. The Software is owned by Librarium and is protected by copyright laws and international copyright treaties.

**No part of this Software may be reproduced, distributed, or transmitted in any form or by any means, including photocopying, recording, or other electronic or mechanical methods, without the prior written permission of Librarium, except in the case of brief quotations embodied in critical reviews and certain other noncommercial uses permitted by copyright law.**

**For permission requests, write to the copyright holder at the address below:**
anders.bekkevard@gmail.com
