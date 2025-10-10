# miniERP Monorepo - Complete Setup Guide

## 🎯 What You Have Now

Your miniERP is now a **full-stack monorepo** with:

✅ **Backend** (apps/api) - NestJS + PostgreSQL + Prisma  
✅ **Frontend** (apps/ui) - Angular 18 + Ant Design  
✅ **Shared Types** (libs/shared/types) - TypeScript interfaces used by both  
✅ **Docker** - PostgreSQL + Redis  
✅ **Complete Documentation**

---

## 🚀 Getting Started (First Time Setup)

### Step 1: Install Dependencies

```bash
cd /Users/emirsalihagic/git/miniERP

# Install root dependencies
npm install

# Install API dependencies
cd apps/api
npm install --legacy-peer-deps

# Install UI dependencies
cd ../ui
npm install --legacy-peer-deps

cd ../..
```

### Step 2: Start Database Services

```bash
# From root directory
docker-compose up -d

# Wait ~5 seconds for PostgreSQL to be ready
```

### Step 3: Setup Database

```bash
cd apps/api

# Run migrations
npm run migrate

# Seed sample data
npm run seed

cd ../..
```

### Step 4: Start Development Servers

**Option A: Run Both Together**
```bash
# From root directory
npm run dev
```

**Option B: Run Separately**

Terminal 1 (API):
```bash
npm run api:dev
# API runs on: http://localhost:3000
```

Terminal 2 (UI):
```bash
npm run ui:dev
# UI runs on: http://localhost:4200
```

---

## 🌐 Access Your Apps

After starting:

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend UI** | http://localhost:4200 | Angular app |
| **Backend API** | http://localhost:3000 | REST API |
| **Swagger Docs** | http://localhost:3000/api-docs | Interactive API docs |
| **Health Check** | http://localhost:3000/v1/health | API health status |
| **Prisma Studio** | `cd apps/api && npx prisma studio` | Visual database browser |

---

## 📁 Monorepo Structure Explained

```
miniERP/
├── apps/                          # Applications
│   ├── api/                       # Backend (NestJS)
│   │   ├── src/
│   │   │   ├── modules/          # Feature modules
│   │   │   │   ├── auth/         # Authentication
│   │   │   │   ├── invoices/     # Invoice management
│   │   │   │   ├── products/     # Product catalog
│   │   │   │   └── ...
│   │   │   ├── common/           # Shared backend code
│   │   │   ├── database/         # Prisma service
│   │   │   └── main.ts           # Entry point
│   │   ├── prisma/
│   │   │   ├── schema.prisma     # Database schema
│   │   │   ├── migrations/       # SQL migrations
│   │   │   └── seed.ts           # Sample data
│   │   ├── .env                  # Backend config
│   │   └── package.json          # Backend dependencies
│   │
│   └── ui/                        # Frontend (Angular)
│       ├── src/
│       │   ├── app/
│       │   │   ├── features/     # Feature modules (TODO)
│       │   │   ├── core/         # Core services (TODO)
│       │   │   ├── shared/       # Shared components (TODO)
│       │   │   └── app.component.ts
│       │   ├── styles.less       # Global styles
│       │   └── index.html
│       ├── angular.json          # Angular config
│       └── package.json          # Frontend dependencies
│
├── libs/                          # Shared Libraries
│   └── shared/
│       ├── types/                # TypeScript interfaces
│       │   └── index.ts          # User, Invoice, Product types
│       └── utils/                # Shared utilities (TODO)
│
├── tools/                         # Scripts & Tooling
│   └── scripts/                  # Build/deploy scripts (TODO)
│
├── docker-compose.yml            # PostgreSQL + Redis
├── package.json                  # Root scripts
└── README.md                     # Main documentation
```

---

## 🔑 Key Concepts

### 1. Shared Types

Both backend and frontend use the **same TypeScript interfaces**:

**Backend (NestJS):**
```typescript
// apps/api/src/modules/invoices/invoices.service.ts
import { Invoice, InvoiceStatus } from '../../../libs/shared/types';

async findAll(): Promise<Invoice[]> {
  return this.prisma.invoice.findMany();
}
```

**Frontend (Angular):**
```typescript
// apps/ui/src/app/services/invoice.service.ts
import { Invoice, InvoiceStatus } from '../../../../libs/shared/types';

getInvoices(): Observable<Invoice[]> {
  return this.http.get<Invoice[]>('/api/v1/invoices');
}
```

**Benefits:**
- ✅ No type drift between BE/FE
- ✅ Autocomplete everywhere
- ✅ Refactor once, updates everywhere

### 2. Monorepo Workflow

**Scenario: Add "notes" field to Invoice**

```bash
# 1. Update shared type
# Edit: libs/shared/types/index.ts
export interface Invoice {
  // ... existing fields
  notes?: string;  // Add this
}

# 2. Update database schema
# Edit: apps/api/prisma/schema.prisma
model Invoice {
  // ... existing fields
  notes String?
}

# 3. Create migration
cd apps/api
npm run migrate

# 4. Update API (TypeScript knows about 'notes')
# Edit: apps/api/src/modules/invoices/dto/create-invoice.dto.ts
# Add validation for notes

# 5. Update UI (TypeScript knows about 'notes')
# Edit: apps/ui/src/app/features/invoices/invoice-form.component.html
# Add notes textarea

# 6. Commit everything together
git add .
git commit -m "feat: add notes field to invoices"
```

**One commit. Everything in sync.** ✅

---

## 🛠️ Development Workflow

### Daily Development

```bash
# 1. Start services (once per day)
docker-compose up -d

# 2. Start both apps
npm run dev

# 3. Code!
# - Edit files in apps/api or apps/ui
# - Both have hot-reload
# - Changes reflect automatically
```

### Adding a New Feature

**Example: Add "Warehouse" module**

```bash
# 1. Update shared types
# Edit libs/shared/types/index.ts
export interface Warehouse {
  id: string;
  name: string;
  address: string;
}

# 2. Add to database schema
# Edit apps/api/prisma/schema.prisma
model Warehouse {
  id      String  @id @default(uuid())
  name    String
  address String
}

# 3. Create migration
cd apps/api
npm run migrate

# 4. Create backend module
npx nest g resource warehouses

# 5. Create frontend module
cd ../../ui
ng generate module features/warehouses --routing
ng generate component features/warehouses/warehouse-list

# 6. Done!
```

---

## 📦 Package Management

### Adding Backend Dependencies

```bash
cd apps/api
npm install <package> --legacy-peer-deps
```

### Adding Frontend Dependencies

```bash
cd apps/ui
npm install <package> --legacy-peer-deps
```

### Adding Shared Library Dependencies

```bash
cd libs/shared/types
npm install <package>
```

---

## 🎨 Frontend Development Guide

### Setting Up Ant Design

**1. Import Ant Design modules in `app.config.ts`:**

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { en_US, provideNzI18n } from 'ng-zorro-antd/i18n';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideNzI18n(en_US),
    // ... other providers
  ]
};
```

**2. Create Login Component:**

```bash
cd apps/ui
ng generate component features/auth/login
```

**3. Add API Service:**

```bash
ng generate service core/api/api
```

**Example API Service:**
```typescript
// apps/ui/src/app/core/api/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Invoice, LoginRequest, LoginResponse } from '../../../libs/shared/types';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:3000/api/v1';

  constructor(private http: HttpClient) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials);
  }

  getInvoices(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(`${this.apiUrl}/invoices`);
  }
}
```

**4. Create Dashboard:**

```bash
ng generate component features/dashboard
```

---

## 🔍 Common Tasks

### View Database

```bash
cd apps/api
npx prisma studio
# Opens on http://localhost:5555
```

### Reset Database

```bash
cd apps/api
npm run migrate:reset
npm run seed
```

### Run Tests

```bash
# Backend tests
cd apps/api
npm run test

# Frontend tests
cd apps/ui
ng test
```

### Build for Production

```bash
# Build API
cd apps/api
npm run build

# Build UI
cd apps/ui
ng build
```

---

## 🐛 Troubleshooting

### "Cannot find module '@miniERP/shared-types'"

**Solution:**
```bash
# Rebuild TypeScript paths
cd apps/ui
ng build
```

### "Port 3000 already in use"

**Solution:**
```bash
lsof -ti :3000 | xargs kill -9
```

### "Database connection error"

**Solution:**
```bash
# Restart PostgreSQL
docker-compose restart postgres

# Check status
docker ps
```

### "Peer dependency conflicts"

**Solution:**
Always use `--legacy-peer-deps` flag:
```bash
npm install <package> --legacy-peer-deps
```

---

## 📚 Learning Resources

### Backend (NestJS)
- [NestJS Docs](https://docs.nestjs.com)
- [Prisma Docs](https://www.prisma.io/docs)
- Your API Docs: http://localhost:3000/api-docs

### Frontend (Angular)
- [Angular Docs](https://angular.io/docs)
- [Ant Design Angular](https://ng.ant.design/docs/introduce/en)

### Monorepo
- Current setup: Simplified monorepo
- Advanced: Nx (https://nx.dev) or Turborepo

---

## ✅ Next Steps

### Week 1: Setup UI Structure
```bash
cd apps/ui

# Create folder structure
ng generate module features/auth --routing
ng generate component features/auth/login
ng generate component features/auth/register

ng generate module features/dashboard --routing
ng generate component features/dashboard/overview

ng generate service core/api/api
ng generate service core/auth/auth
ng generate interceptor core/auth/token
```

### Week 2: Build Core Features
- Login/Register pages
- Dashboard with stats
- Invoice list page
- Invoice creation form

### Week 3: Advanced Features
- Real-time updates
- PDF generation
- Advanced filtering
- Reporting

---

## 🎉 You're All Set!

Your miniERP monorepo is ready for development. Start coding! 🚀

**Questions?** Check the main README.md or Swagger docs.

