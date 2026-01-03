# GBP Conversion Optimizer

## Overview

A Google Business Profile (GBP) optimization tool that analyzes local business listings and provides actionable recommendations to improve conversion rates. The application searches for businesses via the Google Places API, calculates a "Completeness & Conversion Readiness" score (0-100), and generates AI-powered recommendations for profile improvements.

Key features:
- Business search by name and location
- Automated scoring across four dimensions: Profile, Content, Reputation, and Engagement
- AI-generated optimization recommendations with impact/effort ratings
- Caching of place data and scores for performance

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack Query for server state and caching
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens (CSS variables for theming)
- **Build Tool**: Vite with React plugin
- **Fonts**: DM Sans (body) and Plus Jakarta Sans (display headings)

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **API Design**: RESTful endpoints under `/api/*`
- **AI Integration**: OpenAI API via Replit AI Integrations for generating recommendations
- **External APIs**: Google Places API (New) for business search and details

### Data Storage
- **Database**: PostgreSQL via Drizzle ORM
- **Schema Location**: `shared/schema.ts` (shared between client and server)
- **Key Tables**:
  - `place_caches`: Cached business information from Places API
  - `place_scores`: Calculated optimization scores per business
  - `place_recommendations`: AI-generated recommendations
  - `conversations`/`messages`: Chat functionality support

### Key Design Patterns
- **Shared Types**: Schema definitions in `shared/` directory are imported by both client and server
- **Path Aliases**: `@/` maps to client source, `@shared/` maps to shared code
- **Caching Strategy**: Place data and scores cached with 1-hour TTL to minimize API calls
- **Scoring Algorithm**: Rule-based scoring (0-25 per dimension) based on profile completeness metrics

## External Dependencies

### APIs and Services
- **Google Places API (New)**: Business search and detailed place information
  - Requires `PLACES_API_KEY` environment variable
  - Uses text search and place details endpoints

- **OpenAI API (via Replit AI Integrations)**: AI-powered recommendation generation
  - Configured via `AI_INTEGRATIONS_OPENAI_BASE_URL` and `AI_INTEGRATIONS_OPENAI_API_KEY`
  - Uses GPT models for generating actionable business improvement recommendations

### Database
- **PostgreSQL**: Primary data store
  - Connection via `DATABASE_URL` environment variable
  - Managed with Drizzle ORM and drizzle-kit for migrations

### Key NPM Packages
- `drizzle-orm` / `drizzle-zod`: Database ORM with Zod schema integration
- `@tanstack/react-query`: Server state management
- `recharts`: Dashboard analytics visualization
- `framer-motion`: Page transitions and animations
- `date-fns`: Date formatting utilities
- `openai`: OpenAI API client
- `p-limit` / `p-retry`: Batch processing utilities for rate-limited APIs