# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Instagram automation SaaS application (InstaCommand) built with Next.js 14 App Router, TypeScript, Prisma/PostgreSQL, and NextAuth.js. The app provides automated Instagram reply functionality with subscription-based access.

## Development Commands

### Environment Setup
```bash
# Development server
npm run dev

# Test environment
npm run dev:test

# Build for production
npm run build
```

### Database Management
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Deploy migrations
npx prisma migrate deploy

# Database studio
npx prisma studio

# Reset database
npx prisma migrate reset
```

### Testing
```bash
# Run E2E tests
npm run test:e2e

# Run specific test
npx playwright test login.spec.ts

# Run tests with UI
npx playwright test --ui
```

## Architecture Overview

### Database Schema (Prisma)
- **User**: Core user model with membership tiers (FREE, TRIAL, PAID)
- **IGAccount**: Instagram accounts with webhook subscriptions
- **Reply**: Automated response rules with keyword matching
- **Button**: Call-to-action buttons for replies
- **UserSubscription**: Stripe payment integration

### API Structure
- `/api/auth/*`: NextAuth authentication endpoints
- `/api/instagram/*`: Instagram API integration (OAuth, posts, search)
- `/api/replies/*`: Auto-reply management
- `/api/webhooks/*`: Instagram webhook handling
- `/api/subscription/*`: Stripe payment processing

### Component Architecture
- App Router pattern with `(pages)` grouping
- shadcn/ui components with Tailwind CSS
- Zustand stores for state management
- react-hook-form with zod validation
- Responsive design with mobile-first approach

### Key Features
- **Instagram Integration**: OAuth connection, webhook subscriptions, post analysis
- **Auto-Reply System**: Keyword-based automated responses with CTA buttons
- **Subscription Model**: Freemium with 14-day trial, Stripe integration
- **Search Functionality**: Instagram content search and analysis

## Development Guidelines

### Type Safety
- All API routes use TypeScript interfaces
- Zod schemas for form validation
- Prisma-generated types for database operations

### Authentication Flow
- NextAuth.js with database sessions
- Facebook OAuth provider for Instagram API access
- Membership-based feature access control

### Database Connections
- Use existing Prisma client singleton pattern
- Handle connection errors gracefully
- Respect membership limits in queries

### Testing Strategy
- E2E tests with Playwright for critical user flows
- Test environment isolation with separate database
- Visual regression testing for UI components

## Critical Technical Details

### Instagram API Integration
- **OAuth Scope**: Use minimal scopes for webhook functionality
  - Required: `instagram_basic`, `pages_messaging`, `pages_read_engagement`
  - Avoid: `instagram_business_content_publish` (requires Meta App Review)
- **Webhook Subscriptions**: Automatically registered after OAuth callback
  - Fields: `comments`, `messages`, `live_comments`
  - Callback URL: `/api/webhooks/instagram`
- **Access Token Management**: Long-lived tokens with 60-day expiry
- **Rate Limiting**: Respect Instagram API rate limits (200 calls/hour per user)

### Database Connection Management
- **Singleton Pattern**: Use `src/lib/prisma.ts` for connection pooling
- **Connection Limits**: Supabase has 60 concurrent connections limit
- **Error Handling**: Use `safeLogError` function for DB connection errors
- **Hot Reload**: Development environment uses global variable for persistence

### Security Considerations
- **Environment Variables**: All sensitive data in `.env.local`
- **Webhook Verification**: Validate Instagram webhook signatures
- **CSRF Protection**: NextAuth.js handles CSRF tokens
- **Data Sanitization**: Validate all user inputs with Zod schemas

### Performance Optimization
- **Image Optimization**: Next.js Image component for Instagram media
- **Caching**: Redis for session storage and API response caching
- **Database Indexing**: Proper indexes on frequently queried columns
- **Bundle Splitting**: Dynamic imports for heavy components

## Common Issues & Solutions

### Database Connection Errors
```typescript
// Use singleton pattern from src/lib/prisma.ts
import { prisma } from '@/lib/prisma'

// Handle connection errors gracefully
try {
  const result = await prisma.user.findMany()
} catch (error) {
  await safeLogError(error, 'Database operation failed')
}
```

### Instagram API Errors
- **400 Session Invalid**: Check OAuth scopes and app review status
- **Rate Limiting**: Implement exponential backoff
- **Webhook Validation**: Verify signature using app secret

### Subscription Management
- **Trial Period**: 14-day free trial for new users
- **Billing Cycle**: Monthly recurring via Stripe
- **Feature Limits**: Enforce based on membership tier
- **Cancellation**: Handle gracefully with data retention

## Environment Variables

### Required Variables
```bash
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# Instagram/Facebook
FACEBOOK_CLIENT_ID="your-app-id"
FACEBOOK_CLIENT_SECRET="your-app-secret"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Deployment Checklist

### Pre-deployment
- [ ] Run `npm run build` successfully
- [ ] All tests pass (`npm run test:e2e`)
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Stripe webhooks configured

### Post-deployment
- [ ] Instagram webhook URL updated
- [ ] SSL certificate valid
- [ ] Database connection pool configured
- [ ] Monitoring and logging enabled
- [ ] Performance metrics baseline established

## Troubleshooting

### Common Error Messages
- **"PrismaClientInitializationError"**: Database connection issue
- **"Session Invalid"**: Instagram OAuth scope problem
- **"Webhook verification failed"**: Signature validation error
- **"Rate limit exceeded"**: Instagram API throttling

### Debug Tools
- Use `logDebug` and `logDebugTable` functions for detailed logging
- Prisma Studio for database inspection
- Next.js DevTools for performance analysis
- Instagram Graph API Explorer for API testing

## Code Style Guidelines

### File Organization
```
src/
├── app/                 # Next.js App Router
├── components/          # Reusable UI components
├── lib/                 # Utility functions and configurations
├── hooks/              # Custom React hooks
├── stores/             # Zustand state management
├── types/              # TypeScript type definitions
└── utils/              # Helper functions
```

### Naming Conventions
- **Components**: PascalCase (`UserProfile.tsx`)
- **Hooks**: camelCase with `use` prefix (`useInstagramAuth.ts`)
- **Utilities**: camelCase (`formatDate.ts`)
- **API Routes**: kebab-case (`instagram-callback.ts`)
- **Database Models**: PascalCase (`IGAccount`)

### Import Order
1. React and Next.js imports
2. Third-party libraries
3. Internal components and utilities
4. Type imports (with `type` keyword)
5. Relative imports

## Contributing Guidelines

### Pull Request Process
1. Create feature branch from `main`
2. Implement changes with tests
3. Update documentation if needed
4. Ensure all checks pass
5. Request code review

### Code Review Checklist
- [ ] Type safety maintained
- [ ] Error handling implemented
- [ ] Performance considerations addressed
- [ ] Security best practices followed
- [ ] Tests added for new functionality