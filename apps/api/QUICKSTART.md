# miniERP - Quick Start Guide

## 🎯 What's Included

Your miniERP system is now set up with:

### ✅ Completed Features
- **Authentication**: JWT with refresh tokens, password hashing
- **Authorization**: RBAC with 3 roles (EMPLOYEE, CLIENT_USER, SUPPLIER_USER)
- **User Management**: Complete user CRUD with role-based access
- **Clients**: Client management with user associations
- **Suppliers**: Supplier management with user associations
- **Products**: Product catalog with supplier relationships
- **Pricing Engine**: Hierarchical pricing resolution
  - Client-specific overrides (highest priority)
  - Supplier-specific overrides
  - Base product pricing (fallback)
  - Date-based validity windows
- **Invoices**: Complete invoice lifecycle
  - Draft → Issued → Sent → Paid → Void
  - Automatic price resolution at item creation
  - Immutable totals after issuance
  - Audit trail for status changes
- **OpenAPI Documentation**: Auto-generated Swagger docs
- **Health Checks**: Database connectivity monitoring

### 📦 Tech Stack
- NestJS 11 + TypeScript
- PostgreSQL 16 (via Docker)
- Prisma 6 ORM
- Passport JWT
- Swagger/OpenAPI
- class-validator
- bcrypt

---

## 🚀 Getting Started (5 minutes)

### 1. Start Services
```bash
cd /Users/emirsalihagic/git/miniERP

# Start PostgreSQL & Redis
make docker-up
# Wait ~10 seconds for PostgreSQL to be ready
```

### 2. Initialize Database
```bash
# Run migrations
make migrate

# Seed with sample data
make seed
```

This creates:
- ✅ Admin user: `admin@minierp.com` / `password123`
- ✅ 2 Suppliers (ACME Corp, Global Supplies Ltd)
- ✅ 3 Products with base pricing
- ✅ 2 Clients (Tech Solutions Inc, Retail Giants LLC)
- ✅ 1 Client-specific pricing override

### 3. Start the Server
```bash
make dev
# Server starts on http://localhost:3000
```

### 4. Explore the API
- **Swagger UI**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/health

---

## 📝 Example Workflow

### 1. Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@minierp.com",
    "password": "password123"
  }'
```

Copy the `accessToken` from the response:
```bash
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 2. List Products
```bash
curl http://localhost:3000/api/v1/products \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Create an Invoice
```bash
# Get client ID from seed (check Swagger or database)
CLIENT_ID="<uuid-from-seed>"

# Create draft invoice
INVOICE=$(curl -X POST http://localhost:3000/api/v1/invoices \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"clientId\": \"$CLIENT_ID\",
    \"dueDate\": \"2025-12-31\"
  }")

INVOICE_ID=$(echo $INVOICE | jq -r '.id')
echo "Created invoice: $INVOICE_ID"
```

### 4. Add Items (Price Auto-Resolves!)
```bash
# Get product ID
PRODUCT_ID="<uuid-from-seed>"

# Add 10 units - pricing resolves automatically
curl -X POST http://localhost:3000/api/v1/invoices/$INVOICE_ID/items \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"productId\": \"$PRODUCT_ID\",
    \"quantity\": 10
  }"
```

The system will:
1. Look for client-specific pricing override
2. Fall back to supplier pricing
3. Fall back to base product price
4. Calculate line totals (subtotal, tax, discount)
5. Update invoice grand total

### 5. Issue Invoice
```bash
curl -X POST http://localhost:3000/api/v1/invoices/$INVOICE_ID/issue \
  -H "Authorization: Bearer $TOKEN"
```

**Totals are now immutable!** 🔒

---

## 🔍 Explore with Prisma Studio

```bash
make prisma-studio
# Opens on http://localhost:5555
```

Browse all your data visually.

---

## 🧪 Testing Pricing Resolution

### Create Client-Specific Override
```bash
curl -X POST http://localhost:3000/api/v1/pricing \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "<product_id>",
    "clientId": "<client_id>",
    "price": 75.00,
    "currency": "USD",
    "taxRate": 20,
    "discountPercent": 10
  }'
```

Now when you create an invoice for that client with that product, it will use the **$75 price** instead of the base price!

---

## 📚 Key Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/logout` - Logout

### Invoices
- `POST /api/v1/invoices` - Create draft
- `GET /api/v1/invoices` - List all
- `GET /api/v1/invoices/:id` - Get details
- `POST /api/v1/invoices/:id/items` - Add item
- `POST /api/v1/invoices/:id/issue` - Issue (lock totals)

### Products, Clients, Suppliers
All follow standard REST patterns:
- `GET /api/v1/{resource}` - List
- `GET /api/v1/{resource}/:id` - Get one
- `POST /api/v1/{resource}` - Create
- `PUT /api/v1/{resource}/:id` - Update

Full documentation in Swagger!

---

## 🛠️ Development Commands

```bash
make dev           # Run dev server with hot reload
make build         # Build for production
make test          # Run tests
make lint          # Lint code
make migrate       # Run new migrations
make seed          # Re-seed database
make docker-up     # Start services
make docker-down   # Stop services
```

---

## 🎨 Architecture Highlights

### Pricing Resolution (Pure Function)
```typescript
// Automatically resolves in this order:
1. Client-specific override  (highest priority)
2. Supplier-specific override
3. Base product price        (fallback)

// With date-based validity:
effectiveFrom <= NOW <= effectiveTo
```

### Invoice Immutability
Once an invoice is **ISSUED**, totals cannot be changed. This ensures financial integrity.

### Audit Trail
Critical changes are logged:
- Invoice status transitions
- Pricing changes
- User actions

Query `audit_logs` table for full history.

---

## 🔐 Roles & Permissions

| Role | Can Do |
|------|--------|
| **EMPLOYEE** | Full access to everything |
| **CLIENT_USER** | Read own invoices, create drafts, view products |
| **SUPPLIER_USER** | Read own products, view pricing |

Configured via `@Roles()` decorators on controllers.

---

## 🚧 What's Next?

### Recommended Additions
1. **BullMQ Jobs** - PDF generation, email sending
2. **WebSocket Gateway** - Real-time resource locks
3. **Redis Caching** - Product lists, pricing resolution
4. **Payment Integration** - Stripe, PayPal
5. **File Uploads** - Invoice attachments, product images
6. **Reporting** - Sales reports, revenue dashboards
7. **Multi-tenancy** - Tenant isolation
8. **E2E Tests** - Complete test coverage

---

## 💡 Tips

- Use Swagger UI for interactive API exploration
- Check `prisma/seed.ts` for sample data UUIDs
- Monitor logs in console when running `make dev`
- Prisma Studio is great for quick data inspection
- All DTOs have validation - check Swagger for required fields

---

## 🐛 Troubleshooting

### Database connection error
```bash
# Make sure Docker is running
make docker-up

# Check if PostgreSQL is ready
docker logs minierp_postgres
```

### Migration failed
```bash
# Reset database (WARNING: deletes all data)
make migrate-reset
```

### Port 3000 already in use
```bash
# Change in .env
PORT=3001
```

---

## 📧 Need Help?

Check the main README.md for more detailed information.

**Happy coding! 🎉**

