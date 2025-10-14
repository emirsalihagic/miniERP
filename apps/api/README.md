# miniERP - Modular ERP System

A modern, modular ERP system built with NestJS, PostgreSQL, Prisma, and Redis.

## Features

- **Authentication & Authorization**: JWT-based auth with refresh tokens, RBAC with role guards
- **User Management**: Support for Employees, Client Users, and Supplier Users
- **Client & Supplier Management**: Complete CRUD operations
- **Product Catalog**: Product management with supplier relationships
- **Dynamic Pricing**: Hierarchical pricing with client/supplier overrides
- **Invoice System**: Draft→Issued→Paid workflow with immutable totals
- **Audit Trail**: Track critical changes across the system
- **Resource Locking**: Redis-based edit locks (coming soon)
- **Real-time Updates**: WebSocket support (coming soon)
- **OpenAPI Documentation**: Auto-generated Swagger docs

## Tech Stack

- **Backend**: NestJS (Node.js + TypeScript)
- **Database**: PostgreSQL 16
- **ORM**: Prisma 6
- **Cache/Queue**: Redis 7
- **Auth**: Passport JWT
- **Validation**: class-validator
- **API Docs**: Swagger/OpenAPI
- **Testing**: Jest

## Prerequisites

- Node.js 20+
- Docker & Docker Compose
- npm or yarn

## Quick Start

### 1. Clone and Install

```bash
cd /Users/emirsalihagic/git/miniERP
npm install
```

### 2. Start Services (Database & Redis)

```bash
make docker-up
# or
docker-compose up -d
```

### 3. Run Migrations

```bash
make migrate
# or
npm run migrate
```

### 4. Seed Database

```bash
make seed
# or
npm run seed
```

This creates:
- Admin user: `admin@minierp.com` / `password123`
- 2 Suppliers
- 3 Products with base pricing
- 2 Clients
- 1 Client-specific pricing override

### 5. Start Development Server

```bash
make dev
# or
npm run start:dev
```

The API will be available at:
- **API**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/health

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/erp_db?schema=public"
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
REDIS_HOST=localhost
REDIS_PORT=6379
```

## Project Structure

```
src/
├── common/           # Shared utilities (guards, decorators, DTOs)
├── config/           # Configuration files
├── database/         # Prisma service
├── modules/
│   ├── auth/        # Authentication & JWT
│   ├── users/       # User management
│   ├── clients/     # Client management
│   ├── suppliers/   # Supplier management
│   ├── products/    # Product catalog
│   ├── pricing/     # Pricing resolution engine
│   ├── invoices/    # Invoice management
│   └── health/      # Health checks
├── app.module.ts
└── main.ts
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout

### Invoices
- `POST /api/v1/invoices` - Create draft invoice
- `GET /api/v1/invoices` - List invoices
- `GET /api/v1/invoices/:id` - Get invoice details
- `POST /api/v1/invoices/:id/items` - Add item to invoice
- `POST /api/v1/invoices/:id/issue` - Issue invoice

## Example Workflow

### 1. Register & Login

```bash
# Register
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "employee@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "role": "EMPLOYEE"
  }'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@minierp.com",
    "password": "password123"
  }'

# Save the accessToken
export TOKEN="<your_access_token>"
```

### 2. Create Invoice

```bash
# Create draft invoice
curl -X POST http://localhost:3000/api/v1/invoices \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "<client_id>",
    "dueDate": "2025-12-31"
  }'

# Add items (pricing is auto-resolved)
curl -X POST http://localhost:3000/api/v1/invoices/<invoice_id>/items \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "<product_id>",
    "quantity": 10
  }'

# Issue invoice (makes totals immutable)
curl -X POST http://localhost:3000/api/v1/invoices/<invoice_id>/issue \
  -H "Authorization: Bearer $TOKEN"
```

## Available Commands

```bash
make help           # Show all available commands
make install        # Install dependencies
make dev            # Run development server
make build          # Build for production
make test           # Run tests
make lint           # Run linter
make migrate        # Run database migrations
make seed           # Seed database
make prisma-studio  # Open Prisma Studio
make docker-up      # Start Docker services
make docker-down    # Stop Docker services
```

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Prisma Studio

Explore your database with Prisma Studio:

```bash
make prisma-studio
# or
npm run prisma:studio
```

Open http://localhost:5555

## Pricing Resolution Logic

The pricing system uses a hierarchical resolution order:

1. **Client-specific override** (highest priority)
2. **Supplier-specific override**
3. **Base product price** (fallback)

All pricing respects `effectiveFrom` and `effectiveTo` date windows.

## Production Deployment

```bash
# Build
npm run build

# Run migrations
npm run migrate:deploy

# Start production server
npm run start:prod
```

Or use Docker:

```bash
docker build -t minierp .
docker run -p 3000:3000 --env-file .env minierp
```

## License

UNLICENSED - Private Project

## Support

For questions or issues, contact the development team.
