# Midday - AI-Powered Business Assistant

## Project Overview

Humblebrag is an all-in-one platform designed for individual contributors, consultants, and knowledge workers to manage their careers efficiently. It integrates work capturing, narratives, growth, document processing, and AI-powered insights into a single cohesive system.

## Core Features

- **Work Capturing**: Capture decisions, next steps, and follow-ups where work happens
- **Narratives**:  
- **Magic Inbox**: AI-powered automatic matching of
- **Vault**: Secure document storage with AI classification and search
- **Financial Overview**: Real-time financial dashboards with transaction categorization
- **AI Assistant**: Personalized insights, spending analysis, and document search
- **Bank Connections**: Multi-region support (EU via GoCardLess, US via Plaid/Teller, Canada via Plaid)
- **Accounting Integrations**: Sync transactions to Xero, QuickBooks, Fortnox
- **Weekly Insights**: AI-generated business performance summaries with recommendations

## Technology Stack

### Core Technologies
- **Runtime**: Bun 1.2.22
- **Language**: TypeScript 5.9.3
- **Monorepo**: Turborepo 2.7.0
- **Frontend**: React, Next.js, TailwindCSS, Shadcn UI
- **Desktop**: Tauri (macOS transparent titlebar support)
- **Backend**: Hono, tRPC
- **Database**: PostgreSQL (via Drizzle ORM)
- **Code Quality**: Biome (formatting, linting)

### Infrastructure & Services
- **Database & Auth**: Supabase (postgres, storage, realtime, auth)
- **Hosting**: Vercel (Website, Dashboard), Fly.io (API, Worker)
- **Background Jobs**: BullMQ (Redis-based worker queues)
- **Scheduled Jobs**: Trigger.dev
- **Email**: Resend (transactional & marketing)
- **Bank APIs**: GoCardLess (EU), Plaid (US/Canada), Teller (US)
- **Analytics**: OpenPanel
- **Payments**: Polar
- **Search**: Typesense
- **AI**: OpenAI, Google Gemini

## Project Structure

### Monorepo Organization

```
midday/
├── apps/                    # Applications
│   ├── api/                # tRPC API server (Fly.io)
│   ├── dashboard/          # Main web app (Next.js on Vercel)
│   ├── desktop/            # Tauri desktop app
│   ├── engine/             # Bank institution data & logos
│   ├── website/            # Marketing site (Next.js on Vercel)
│   └── worker/             # BullMQ worker processing (Fly.io)
├── packages/               # Shared packages
│   ├── accounting/         # Accounting provider integrations (Xero, QuickBooks, Fortnox)
│   ├── app-store/          # Third-party app integrations & OAuth
│   ├── cache/              # Redis caching utilities
│   ├── categories/         # Financial category system with international tax rates
│   ├── customers/          # Customer management
│   ├── db/                 # Drizzle schema, migrations, clients
│   ├── desktop-client/     # Desktop app API client
│   ├── documents/          # Document processing utilities
│   ├── email/              # Email templates & rendering
│   ├── encryption/         # Data encryption utilities
│   ├── engine-client/      # Bank institution API client
│   ├── events/             # Event definitions & schemas
│   ├── import/             # CSV/data import utilities
│   ├── inbox/              # Email inbox integrations (Gmail, Outlook)
│   ├── insights/           # AI-powered business insights generation
│   ├── invoice/            # Invoice generation & management
│   ├── job-client/         # Worker job queue client
│   ├── jobs/               # Trigger.dev scheduled jobs
│   ├── location/           # Location services
│   ├── logger/             # Logging utilities
│   ├── notifications/      # Notification system
│   ├── plans/              # Subscription plans & billing
│   ├── supabase/           # Supabase client & utilities
│   ├── tsconfig/           # Shared TypeScript configs
│   ├── ui/                 # Shared UI components (Shadcn)
│   ├── utils/              # Common utilities
│   └── workbench/          # Development workbench tools
├── docs/                   # Technical documentation
└── types/                  # Shared type definitions
```

## Key Architecture Patterns

### 1. Apps Layer

#### API (`apps/api/`)
- **Framework**: Hono + tRPC + OpenAPI
- **Purpose**: Unified REST and tRPC API server
- **Features**:
  - CORS configuration for cross-origin requests
  - Redis caching for API key lookups (30 min TTL)
  - Secure headers with Sentry instrumentation
  - OpenAPI documentation at `/openapi`
  - Health check at `/health`
- **Structure**:
  - `trpc/` - tRPC routers and procedures
  - `rest/` - OpenAPI REST endpoints
  - `ai/` - AI chat and assistant endpoints
  - `mcp/` - Model Context Protocol integrations
  - `services/` - Business logic services

#### Dashboard (`apps/dashboard/`)
- **Framework**: Next.js with Turbopack
- **Purpose**: Main user-facing web application
- **Features**: Real-time collaboration, AI chat interface, financial dashboards
- **Port**: 3001 (development)

#### Worker (`apps/worker/`)
- **Framework**: BullMQ workers + Hono (workbench UI)
- **Purpose**: Background job processing with distributed workers
- **Job Processing**:
  - Multiple queues: default, inbox, accounting, bank-sync
  - Processor registry pattern for job routing
  - Event handlers for completed/failed jobs
  - Sentry error tracking and alerting
- **Key Processors**:
  - `inbox/`: Document processing, embedding, matching
  - `bank-sync/`: Transaction syncing, account updates
  - `accounting/`: Export transactions, sync attachments
  - `insights/`: Generate weekly summaries

#### Engine (`apps/engine/`)
- **Purpose**: Bank institution data, logos, and metadata
- **Features**: Teller institution import, CDN sync

#### Desktop (`apps/desktop/`)
- **Framework**: Tauri + Vite
- **Environments**: Development (localhost:3001), Staging (beta.midday.ai), Production (app.midday.ai)
- **Platform**: Native macOS with transparent titlebar
- **Min Window**: 1450x900

#### Website (`apps/website/`)
- **Framework**: Next.js
- **Purpose**: Marketing and landing pages

### 2. Data Layer

#### Database (`packages/db/`)
- **ORM**: Drizzle with PostgreSQL
- **Key Tables**:
  - `teams` - Multi-tenant organizations
  - `transactions` - Bank transactions with embeddings
  - `bank_accounts` - Connected bank accounts
  - `bank_connections` - OAuth connection state
  - `inbox` - Incoming receipts/invoices
  - `inbox_accounts` - Gmail/Outlook connections
  - `documents` - Vault document storage
  - `invoices` - Customer invoices
  - `invoice_recurring` - Recurring invoice templates
  - `customers` - Client management
  - `tracker_entries` - Time tracking entries
  - `accounting_sync_records` - Sync state tracking
  - `apps` - Installed integrations
  - `*_embeddings` - Vector embeddings for AI matching
- **Enums**: Status tracking, providers, types (40+ domain enums)
- **Clients**:
  - `client.ts` - Primary database client
  - `worker-client.ts` - Worker-optimized client
  - `replicas.ts` - Read replica support

### 3. Integration Layer

#### Accounting (`packages/accounting/`)
- **Purpose**: Two-way sync with accounting platforms
- **Providers**: Xero (implemented), QuickBooks (planned), Fortnox (planned)
- **Architecture**:
  - Provider abstraction with common interface
  - Worker pipeline for sync jobs
  - Batch transaction processing
  - Attachment upload with retry
  - Sync state tracking with `accounting_sync_records`
- **Features**:
  - OAuth token management with auto-refresh
  - Selective transaction sync based on date ranges
  - Attachment deduplication
  - Error recovery and status tracking

#### Inbox (`packages/inbox/`)
- **Purpose**: Email provider integration for document import
- **Providers**: Gmail (Google OAuth2), Outlook (Microsoft Graph)
- **Features**:
  - PDF attachment extraction
  - Proactive token refresh before expiration
  - Retry logic with token refresh on auth errors
  - Structured error types (InboxAuthError, InboxSyncError)
- **Flow**: Connect → OAuth → Sync PDFs → Process → Match

#### App Store (`packages/app-store/`)
- **Purpose**: Third-party integrations registry
- **Integrations**:
  - Email: Gmail, Outlook
  - Accounting: Xero, QuickBooks, Fortnox
  - Communication: Slack, WhatsApp
  - Payments: Stripe, Polar
  - Storage: Google Drive, Dropbox
  - Automation: n8n, Make, Zapier
  - AI: MCP integrations for Cursor, Claude, ChatGPT, Copilot, Perplexity, Raycast
  - Time tracking: Raycast
  - Payroll: Deel
  - Invoicing: E-Invoice
  - Desktop: Midday Desktop
- **Structure**: Each app has config, OAuth handlers, logo assets

### 4. AI & Insights

#### Inbox Matching (`docs/inbox-matching.md`)
- **Purpose**: Automatically match receipts/invoices to transactions
- **Technology**:
  - 768-dimensional embeddings for semantic similarity
  - Multi-tier financial matching (amount, currency, date)
  - Adaptive confidence calibration from user feedback
  - Semantic merchant pattern learning (90%+ accuracy)
- **Matching Logic**:
  - ≥0.95 confidence: Auto-match
  - ≥0.70 confidence: Suggest to user
  - <0.70: No match
- **Features**:
  - Bidirectional matching (new transactions ↔ existing inbox items)
  - Dismissed match prevention (never re-suggest rejected pairs)
  - Cross-currency support with penalties
  - Post-match learning from unmatch actions
  - Duplicate prevention via SQL filtering
- **Jobs**: `embed-transaction`, `embed-inbox`, `match-transactions-bidirectional`, `batch-process-matching`

#### Document Processing (`docs/document-processing.md`)
- **Purpose**: AI-powered document classification and metadata extraction
- **Features**:
  - Vision + text model classification
  - Extract titles, summaries, dates, tags
  - Graceful degradation (always usable even if AI fails)
  - Stale detection (>10 min processing = stuck)
  - One-click retry for failed documents
  - HEIC/HEIF to JPEG conversion
  - Tag embeddings for semantic search
  - Job deduplication with deterministic IDs
  - Real-time status tracking
- **Jobs**: `process-document`, `classify-document`, `classify-image`, `embed-document-tags`

#### Weekly Insights (`packages/insights/`, `docs/weekly-insights.md`)
- **Purpose**: AI-generated business performance summaries
- **Technology**: GPT-4.1-mini with optimized prompts
- **Features**:
  - Smart metric selection (top 4 most relevant)
  - Trend detection (streaks, YoY comparisons)
  - Runway projections with specific exhaustion dates
  - Quarter pace vs same quarter last year
  - Payment anomaly detection (late-paying customers)
  - Actionable recommendations (overdue invoices, expense anomalies)
  - Data consistency validation
- **Periods**: Weekly, monthly, quarterly, yearly
- **Architecture**:
  - `InsightsService` - Main orchestrator
  - `MetricsCalculator` - Financial metrics with period comparisons
  - `MetricsAnalyzer` - Metric selection and anomaly detection
  - `ContentGenerator` - AI content generation with split prompts
  - `Slots System` - Pre-computed data for AI consumption

#### Categories (`packages/categories/`)
- **Purpose**: Financial category system with tax rates
- **Features**:
  - Hierarchical categories (parent-child)
  - International tax rate support (31+ countries)
  - VAT/GST/sales tax rates
  - Built-in display names
  - Backward compatible slugs

### 5. Worker & Job System

#### Background Processing
- **Queue System**: BullMQ with Redis
- **Queues**: default, inbox, accounting, bank-sync
- **Pattern**: Processor registry for job routing
- **Error Handling**: Sentry integration with retry logic
- **Event Handlers**: onCompleted, onFailed hooks

#### Scheduled Jobs (`packages/jobs/`)
- **Platform**: Trigger.dev
- **Purpose**: Cron-style scheduled tasks (e.g., weekly insights generation)

### 6. Authentication & Security

#### Auth Flow
- **Provider**: Supabase Auth
- **Methods**: OAuth providers, magic links, email/password
- **Multi-tenancy**: Team-based with role permissions (owner, member)

#### Encryption (`packages/encryption/`)
- **Purpose**: Encrypt sensitive data (OAuth tokens, bank credentials)
- **Key**: FILE_KEY_SECRET environment variable

#### API Security
- **API Keys**: Cached in Redis (30 min TTL)
- **CORS**: Configured allowed origins
- **Route Protection**: API_ROUTE_SECRET for internal endpoints
- **Secure Headers**: Helmet-style security headers

## Development Workflow

### Setup
```bash
# Install dependencies
bun install

# Run all apps in parallel
bun run dev

# Run specific app
bun run dev:dashboard
bun run dev:api
bun run dev:worker
bun run dev:engine
bun run dev:desktop
```

### Code Quality
```bash
# Format code (Biome)
bun run format

# Lint (Biome + manypkg)
bun run lint

# Type check
bun run typecheck

# Run tests
bun run test
```

### Build
```bash
# Build all packages
bun run build

# Build specific package
bun run build:dashboard
```

### Database Migrations
- **Location**: `packages/db/migrations/`
- **Tool**: Drizzle Kit
- **Config**: `packages/db/drizzle.config.ts`

## Environment Variables

### Core Services
```bash
# Database
DATABASE_URL=postgresql://...
DATABASE_READ_URL=postgresql://...  # Optional read replica

# Supabase
SUPABASE_URL=https://...supabase.co
SUPABASE_SERVICE_KEY=...
SUPABASE_API_KEY=...

# Redis (Worker queues)
REDIS_URL=redis://localhost:6379              # Development
# REDIS_URL=rediss://...upstash.io:6379       # Production (Upstash via Fly.io)
UPSTASH_REDIS_REST_URL=...                    # REST API
UPSTASH_REDIS_REST_TOKEN=...

# AI
OPENAI_API_KEY=sk-...

# Security
FILE_KEY_SECRET=...                           # Encryption key
API_ROUTE_SECRET=...                          # Internal API protection

# Email
RESEND_API_KEY=...
RESEND_AUDIENCE_ID=...

# Bank Providers
GOCARDLESS_SECRET_ID=...
GOCARDLESS_SECRET_KEY=...
PLAID_CLIENT_ID=...
PLAID_SECRET=...
TELLER_CERTIFICATE=...
TELLER_CERTIFICATE_PRIVATE_KEY=...

# Accounting
# (OAuth secrets managed per integration)

# Payments
POLAR_WEBHOOK_SECRET=...
POLAR_ACCESS_TOKEN=...
POLAR_ENVIRONMENT=sandbox|production

# Observability
BASELIME_SERVICE=...
BASELIME_API_KEY=...
OPENPANEL_SECRET_KEY=...

# Communication
SLACK_CLIENT_ID=...
SLACK_CLIENT_SECRET=...
SLACK_SIGNING_SECRET=...
WHATSAPP_PHONE_NUMBER_ID=...
WHATSAPP_BUSINESS_ACCOUNT_ID=...

# CI/CD
GITHUB_TOKEN=...
```

## Key Conventions

### Code Style
- **Formatter**: Biome (space indentation)
- **Linter**: Biome with recommended rules
- **Import Organization**: Automatic via Biome
- **No Semicolons**: Biome default
- **TypeScript**: Strict mode enabled

### Naming Conventions
- **Files**: kebab-case (e.g., `bank-sync-processor.ts`)
- **Components**: PascalCase (e.g., `TransactionList.tsx`)
- **Functions**: camelCase (e.g., `getTransactions()`)
- **Types/Interfaces**: PascalCase (e.g., `Transaction`, `BankAccount`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RETRIES`)
- **Database Tables**: snake_case (e.g., `bank_accounts`)

### Package Naming
- **Scope**: `@midday/` for all internal packages
- **Pattern**: `@midday/package-name`

### Workspace References
- Use `workspace:*` for internal dependencies in package.json

### TypeScript Config
- **Base**: `@midday/tsconfig/base.json`
- **Next.js**: `@midday/tsconfig/nextjs.json`
- **React Library**: `@midday/tsconfig/react-library.json`

### Testing
- Test files alongside source: `*.test.ts`, `*.spec.ts`
- Use Bun's built-in test runner

## Documentation

### Internal Docs (`docs/`)
- **inbox-matching.md**: AI matching algorithm deep-dive
- **document-processing.md**: Document classification pipeline
- **weekly-insights.md**: Business insights generation system
- **invoice-recurring.md**: Recurring invoice state machine
- **runway-burn-rate-analysis.md**: Financial projection calculations
- **credit-card-transaction-handling.md**: Credit card processing
- **bank-account-reconnect.md**: Re-authentication flows

### Architecture Docs
- **packages/accounting/ARCHITECTURE.md**: Accounting sync system deep-dive

### External Docs
- User-facing documentation: https://docs.midday.ai

## Common Patterns

### Error Handling
- Use structured error classes (e.g., `InboxAuthError`, `InboxSyncError`)
- Capture to Sentry with tags and extra context
- Graceful degradation where possible
- User-friendly error messages

### Database Queries
- Use Drizzle ORM with type-safe queries
- Prefer read replicas for heavy read operations (`replicas.ts`)
- Use connection pooling appropriately
- Index on foreign keys and common query columns

### Job Processing
1. Define job schema in `apps/worker/src/schemas/`
2. Create processor in `apps/worker/src/processors/`
3. Register in `apps/worker/src/processors/registry.ts`
4. Add queue config in `apps/worker/src/queues/`
5. Trigger jobs via `@midday/job-client`

### API Routes
- **tRPC**: For type-safe client-server communication (dashboard ↔ api)
- **REST/OpenAPI**: For third-party integrations and webhooks
- Use Zod schemas for validation
- API keys cached in Redis for performance

### AI Integration
- Use streaming where possible for better UX
- Implement retry logic with exponential backoff
- Log prompts and responses for debugging
- Set reasonable token limits and timeouts
- Validate AI outputs before persisting

### Token Management
- Encrypt OAuth tokens before storage (use `@midday/encryption`)
- Proactive token refresh before expiration
- Implement retry with refresh on auth failures
- Store expiry timestamps for validation

### Multi-tenancy
- Always filter queries by `team_id`
- Use Row Level Security (RLS) policies in Supabase
- Team membership enforced at auth layer
- Role-based permissions (owner, member)

## Deployment

### Infrastructure
- **Vercel**: Dashboard and Website (auto-deploy from main)
- **Fly.io**: API, Worker (Dockerized apps)
- **Supabase**: Managed Postgres, Auth, Storage
- **Upstash**: Redis (via Fly.io)

### CI/CD
- **Platform**: GitHub Actions
- **Checks**: Lint, typecheck, tests on PRs
- **Auto-deploy**: Merge to main triggers production deploy

### Monitoring
- **Errors**: Sentry (API, Worker, Dashboard)
- **Analytics**: OpenPanel
- **Logs**: Fly.io logs, Supabase logs
- **Metrics**: Baselime APM

## Important Notes

### Current User Context
This is an active codebase with:
- The user is currently viewing: `apps/worker/src/processors/inbox/process-attachment.ts`
- This suggests they may be working on inbox document processing or matching features

### Known Architecture Decisions
1. **Workspaces monorepo**: Shared packages enable code reuse across apps
2. **tRPC + REST hybrid**: Type-safe internal APIs + standard REST for external integrations
3. **BullMQ workers**: Distributed job processing with Redis for reliability
4. **Embeddings-based matching**: More accurate than rule-based matching
5. **Graceful degradation**: User experience prioritized over perfect AI results
6. **Provider abstraction**: Easy to add new accounting/bank/email providers

### Performance Considerations
- Redis caching for hot paths (API keys, frequently accessed data)
- Database read replicas for analytics queries
- Batch processing for embeddings and sync operations
- Lazy loading and code splitting in Next.js apps
- Optimistic UI updates for better perceived performance

### Security Considerations
- All sensitive data encrypted at rest
- OAuth tokens stored with encryption
- Multi-tenant isolation at DB level
- API rate limiting (via Redis)
- CORS restrictions on API endpoints
- Webhook signature verification

### Future Roadmap (from roadmap/features)
- Mobile app (Expo)
- Advanced forecasting and budgeting
- Multi-currency native support
- Team collaboration features
- API marketplace for integrations

## Getting Help

- **Issues**: https://github.com/midday-ai/midday/issues
- **Email**: engineer@midday.ai
- **Docs**: https://docs.midday.ai

## License Notes

- **Non-commercial**: AGPL-3.0
- **Commercial**: Contact engineer@midday.ai for licensing
- **Open Source**: Contributions welcome under AGPL-3.0 terms
