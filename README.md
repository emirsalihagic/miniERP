# miniERP - Monorepo

A modern, full-stack ERP system built with **NestJS + Angular** in a monorepo architecture.

## 📁 Project Structure

```
miniERP/
├── apps/
│   ├── api/                    # NestJS Backend (REST API)
│   │   ├── src/
│   │   ├── prisma/
│   │   └── package.json
│   └── ui/                     # Angular Frontend (Ant Design)
│       ├── src/
│       └── package.json
├── libs/
│   └── shared/
│       ├── types/              # Shared TypeScript types
│       └── utils/              # Shared utilities
├── tools/
│   └── scripts/               # Build & deployment scripts
├── docker-compose.yml         # PostgreSQL + Redis
├── package.json               # Root package.json
└── README.md
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install all app dependencies
cd apps/api && npm install --legacy-peer-deps
cd ../ui && npm install --legacy-peer-deps
cd ../..
```

### 2. Start Services

```bash
# Start PostgreSQL & Redis
docker-compose up -d
```

### 3. Setup Database

```bash
# Run migrations
cd apps/api
npm run migrate

# Seed data
npm run seed

cd ../..
```

### 4. Start Development Servers

**Terminal 1 - API:**
```bash
npm run api:dev
# or: cd apps/api && npm run start:dev
```

**Terminal 2 - UI:**
```bash
npm run ui:dev
# or: cd apps/ui && ng serve
```

### 5. Access Applications

- **API**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api-docs
- **Frontend UI**: http://localhost:4200

---

## 📦 Tech Stack

### Backend (apps/api)
- **Framework**: NestJS 11
- **Database**: PostgreSQL 16
- **ORM**: Prisma 6
- **Auth**: Passport JWT
- **Validation**: class-validator
- **Documentation**: Swagger/OpenAPI

### Frontend (apps/ui)
- **Framework**: Angular 18
- **UI Library**: Ant Design (ng-zorro-antd)
- **State Management**: RxJS / Signals
- **HTTP Client**: HttpClient
- **Routing**: Angular Router

### Shared (libs/shared)
- **Types**: TypeScript interfaces/enums
- **Utils**: Common utilities

---

## 🛠️ Development Commands

### Root Level
```bash
npm run dev              # Start both API + UI
npm run api:dev          # Start API only
npm run ui:dev           # Start UI only
npm run docker:up        # Start PostgreSQL + Redis
npm run docker:down      # Stop services
npm run install:all      # Install all dependencies
```

### API (apps/api)
```bash
cd apps/api
npm run start:dev        # Development server
npm run build            # Build for production
npm run migrate          # Run database migrations
npm run seed             # Seed database
npm run prisma:studio    # Visual database browser
npm run test             # Run tests
```

### UI (apps/ui)
```bash
cd apps/ui
ng serve                 # Development server
ng build                 # Build for production
ng test                  # Run tests
ng generate component    # Generate component
```

---

## 🔐 Default Credentials

After seeding the database:

```
Email: admin@minierp.com
Password: password123
```

---

## 📊 Features

### ✅ Implemented
- **Authentication**: JWT with refresh tokens
- **Authorization**: Role-based access control (EMPLOYEE, CLIENT_USER, SUPPLIER_USER)
- **User Management**: CRUD operations with role assignments
- **Client Management**: Client companies and relationships
- **Supplier Management**: Supplier companies and products
- **Product Catalog**: Products with SKU, categories, soft-delete
- **Pricing Engine**: Hierarchical pricing (client > supplier > base)
- **Invoice System**: Complete invoice lifecycle (DRAFT → ISSUED → PAID)
- **Audit Trail**: Track critical changes
- **Health Checks**: Database connectivity monitoring

### 🚧 Coming Soon
- Angular UI components for all features
- API client auto-generation from OpenAPI
- Real-time updates (WebSocket)
- PDF generation for invoices
- Advanced reporting
- File uploads

---

## 🎯 Monorepo Benefits

1. **Shared Types**: Backend and frontend use the same TypeScript interfaces
2. **Atomic Changes**: Update API + UI in a single commit
3. **Code Reuse**: Share utilities, constants, validation logic
4. **Simplified Setup**: One clone, one command to run everything
5. **Type Safety**: End-to-end type checking

---

## 📝 Project Files

### Shared Types (`libs/shared/types/index.ts`)

All entities have shared TypeScript interfaces:
- `User`, `UserRole`
- `Client`, `Supplier`
- `Product`, `Pricing`
- `Invoice`, `InvoiceItem`, `InvoiceStatus`

**Example:**
```typescript
import { Invoice, InvoiceStatus } from '@miniERP/shared-types';

// Both API and UI use the same types!
```

### API Routes

All routes are versioned `/api/v1/`:

- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/register` - Register
- `GET /api/v1/invoices` - List invoices
- `POST /api/v1/invoices` - Create invoice
- `POST /api/v1/invoices/:id/items` - Add invoice items
- `POST /api/v1/invoices/:id/issue` - Issue invoice

Full documentation: http://localhost:3000/api-docs

---

## 🔧 Configuration

### Environment Variables

**API (.env in apps/api):**
```env
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/erp_db"
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
REDIS_HOST=localhost
REDIS_PORT=6379
```

**UI (environment.ts in apps/ui):**
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000'
};
```

---

## 🐳 Docker

Start all services:
```bash
docker-compose up -d
```

Services running:
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

---

## 🧪 Testing

### API Tests
```bash
cd apps/api
npm run test         # Unit tests
npm run test:e2e     # E2E tests
npm run test:cov     # Coverage
```

### UI Tests
```bash
cd apps/ui
ng test              # Unit tests
ng e2e               # E2E tests
```

---

## 📚 Next Steps

### For Frontend Development:

1. **Create Login Component**
   ```bash
   cd apps/ui
   ng generate component features/auth/login
   ```

2. **Add API Service**
   ```bash
   ng generate service core/api/api
   ```

3. **Install Ant Design Components**
   Already installed! Import modules in `app.config.ts`

4. **Create Dashboard**
   ```bash
   ng generate component features/dashboard
   ```

### For Backend Development:

1. **Add New Module**
   ```bash
   cd apps/api
   nest g resource feature-name
   ```

2. **Create Migration**
   ```bash
   npm run migrate
   ```

3. **Update Shared Types**
   Edit `libs/shared/types/index.ts`

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes in `apps/api` or `apps/ui`
3. Update shared types in `libs/shared/types` if needed
4. Test both API and UI
5. Commit: `git commit -m "feat: add feature"`
6. Push and create PR

---

## 📄 License

UNLICENSED - Private Project

---

## 💡 Tips

- Use **Prisma Studio** to visually browse the database: `npm run api:migrate && cd apps/api && npx prisma studio`
- Use **Swagger UI** to test APIs: http://localhost:3000/api-docs
- Shared types are in `libs/shared/types` - update once, use everywhere
- Both apps have hot-reload enabled for fast development

---

## 🆘 Troubleshooting

### Port already in use
```bash
# Kill process on port 3000
lsof -ti :3000 | xargs kill -9

# Kill process on port 4200
lsof -ti :4200 | xargs kill -9
```

### Database connection error
```bash
# Restart PostgreSQL
docker-compose restart postgres

# Check if running
docker ps
```

### Cannot find shared types
```bash
# Rebuild TypeScript paths
cd apps/ui
npx ng build
```

**Happy Coding! 🚀**
