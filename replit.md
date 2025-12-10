# Digital Pass - HR Recruitment Management System

## Overview

Digital Pass is an HR recruitment management system built for Baynunah Watergeneration Technologies SP LLC, a sustainable water technology company based in Abu Dhabi, UAE. The system manages the complete recruitment lifecycle through "passes" - trackable recruitment workflows that guide positions from draft through hiring. It features role-based interfaces for HR administrators, hiring managers, and candidates, with AI-powered assistance for job descriptions, candidate scoring, and interview preparation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, bundled via Vite
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens following Microsoft Fluent Design patterns
- **Design System**: Enterprise-grade aesthetic with emphasis on information density and professional credibility

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ES modules
- **API Pattern**: REST endpoints prefixed with `/api`
- **Build Process**: Custom build script using esbuild for server bundling and Vite for client

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` - shared between client and server
- **Migrations**: Managed via drizzle-kit with output to `./migrations`
- **Validation**: Zod schemas generated from Drizzle schemas using drizzle-zod

### Key Domain Models
- **Passes**: Recruitment workflows with stages (draft → JD approval → sourcing → interviewing → offer)
- **Candidates**: Applicant profiles linked to passes
- **Managers**: Hiring managers and interviewers
- **Interviews**: Scheduled interview sessions
- **Activity Log**: Audit trail for system actions

### Project Structure
```
client/           # React frontend application
  src/
    components/   # Reusable UI components
    pages/        # Route-level page components
    hooks/        # Custom React hooks
    lib/          # Utilities and query client
server/           # Express backend
  index.ts        # Server entry point
  routes.ts       # API route definitions
  storage.ts      # Data access layer interface
  db.ts           # Database connection
shared/           # Shared code between client/server
  schema.ts       # Drizzle database schema
```

## External Dependencies

### Database
- **PostgreSQL**: Primary database via `DATABASE_URL` environment variable
- **Session Storage**: connect-pg-simple for Express session persistence

### AI Integration
- **Anthropic Claude**: AI assistant for recruitment tasks (job descriptions, candidate scoring, interview questions)
- Integration located in `attached_assets` with tool definitions for pass creation, candidate management

### UI Dependencies
- **Radix UI**: Full suite of accessible component primitives
- **Lucide React**: Icon library
- **date-fns**: Date manipulation
- **cmdk**: Command palette component
- **embla-carousel-react**: Carousel functionality
- **recharts**: Charting library for reports/analytics

### Development Tools
- **Vite**: Development server with HMR
- **Replit plugins**: Runtime error overlay, cartographer, dev banner (development only)