# Overview

AUTHENTO is a digital certificate verification system designed to combat fake academic degrees and certificates. The platform uses OCR technology, database cross-verification, and comprehensive validation to detect fraudulent academic documents. It's built as a full-stack web application with a mobile-first frontend and a REST API backend, targeting students, employers, and educational institutions.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with a custom design system featuring CSS variables for theming
- **State Management**: TanStack Query for server state and caching
- **Routing**: Wouter for lightweight client-side routing
- **Mobile-First Design**: Responsive design optimized for mobile devices with a maximum width container

## Backend Architecture
- **Runtime**: Node.js with Express.js REST API
- **Language**: TypeScript with ESM modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: JWT-based authentication with bcrypt for password hashing
- **API Design**: RESTful endpoints with structured error handling and request/response logging
- **Development Setup**: Hot reloading with tsx and integrated Vite middleware for development

## Data Storage
- **Primary Database**: PostgreSQL configured for use with supabase
- **Schema Management**: Drizzle migrations stored in `/migrations` directory
- **Database Tables**:
  - `users`: User management with role-based access (student, employer, admin)
  - `certificates`: Trusted certificate records with institutional data
  - `verificationLogs`: Comprehensive logging of all verification attempts
  - `blacklist`: Fraudulent certificate and user records
- **Data Validation**: Zod schemas for runtime type checking and validation

## Authentication & Authorization
- **JWT Tokens**: Stateless authentication with 24-hour token expiration
- **Role-Based Access**: Three user roles (student, employer, admin) with different permissions
- **Session Management**: Client-side token storage with automatic logout on expiration
- **Security Middleware**: Protected routes with token verification middleware

## Core Features Architecture
- **OCR Processing**: Tesseract.js integration for certificate text extraction
- **Camera Integration**: Native browser camera API with image capture capabilities
- **Verification Engine**: Multi-step validation including database matching, institutional verification, format validation, and blacklist checking
- **Statistics Dashboard**: Real-time verification metrics and reporting
- **File Upload**: Support for both camera capture and file upload workflows

# External Dependencies

## Database Services
- **Supabase**: PostgreSQL hosting service for production database
- **Drizzle ORM**: Database toolkit and ORM with PostgreSQL adapter

## UI Framework & Components
- **Radix UI**: Comprehensive set of accessible UI primitives
- **Shadcn/ui**: Pre-built components based on Radix UI with Tailwind styling
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Lucide React**: Icon library for consistent iconography

## Authentication & Security
- **jsonwebtoken**: JWT token generation and verification
- **bcrypt**: Password hashing for secure authentication

## Image Processing & OCR
- **Tesseract.js**: Client-side OCR processing for certificate text extraction
- **Browser Camera API**: Native camera access for certificate image capture

## Development Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Static type checking and enhanced development experience
- **TanStack Query**: Server state management and caching
- **Wouter**: Minimalist client-side routing solution

## Deployment & Hosting
- **Replit**: Development environment with integrated deployment
- **ESBuild**: Fast JavaScript bundler for production builds
