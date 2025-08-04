# JEE Pulse - Smart Study Tracker

## Overview

JEE Pulse is a Progressive Web App (PWA) designed for JEE exam preparation. It provides students with a comprehensive platform to track daily goals, study sessions, sleep patterns, school attendance, and syllabus progress. The application features a colorful, modern interface with offline-first capabilities and detailed analytics to help students optimize their study habits.

The application is built as a full-stack solution with a React frontend and Express backend, using local storage for client-side data persistence and PostgreSQL with Drizzle ORM for server-side data management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **UI Framework**: Tailwind CSS with shadcn/ui components for consistent design
- **State Management**: TanStack Query (React Query) for server state and local React state for UI
- **PWA Features**: Service Worker for offline functionality, Web App Manifest for installability
- **Data Storage**: Local storage with custom StorageManager class for offline-first data persistence

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Storage Layer**: Abstracted storage interface with both in-memory and database implementations
- **API Design**: RESTful endpoints with JSON responses
- **Development Setup**: Vite integration for development with middleware mode

### Data Storage Solutions
- **Client-Side**: Local Storage API for offline-first functionality with structured data management
- **Server-Side**: PostgreSQL database with Neon serverless hosting
- **Schema Design**: Normalized tables for users, daily logs, syllabus progress, and user settings
- **Data Types**: JSON columns for complex data structures like goals, study sessions, and lecture tracking

### Authentication and Authorization
- **Current State**: Basic user schema prepared but authentication not yet implemented
- **Planned**: Session-based authentication with PostgreSQL session store (connect-pg-simple)
- **User Management**: Username/password based system with hashed passwords

### Component Architecture
- **Design System**: shadcn/ui components with Radix UI primitives
- **Theme Support**: Dark/light mode with CSS custom properties
- **Responsive Design**: Mobile-first approach with desktop sidebar navigation
- **Form Handling**: React Hook Form with Zod validation schemas

## External Dependencies

### UI and Design
- **Radix UI**: Comprehensive set of accessible, unstyled UI primitives
- **Lucide Icons**: Consistent iconography throughout the application
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Class Variance Authority**: Type-safe variant management for component styling

### Data Management
- **TanStack Query**: Server state synchronization and caching
- **Drizzle ORM**: Type-safe database operations and schema management
- **Drizzle-Zod**: Schema validation integration between database and frontend
- **Zod**: Runtime type validation and schema definition

### Database and Hosting
- **Neon Database**: Serverless PostgreSQL hosting platform
- **Connect PG Simple**: PostgreSQL session store for Express sessions

### Development Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Type safety across the entire stack
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind CSS and Autoprefixer

### PWA Features
- **Service Worker**: Custom implementation for offline functionality and caching
- **Web App Manifest**: Configuration for installable web app experience

### Additional Libraries
- **React Hook Form**: Performant form handling with minimal re-renders
- **Date-fns**: Modern date utility library for time calculations
- **Wouter**: Lightweight routing library for React
- **Embla Carousel**: Touch-friendly carousel component