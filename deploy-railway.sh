#!/bin/bash

# Mini ERP Railway Deployment Script
echo "🚀 Mini ERP Railway Deployment Script"
echo "======================================"

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Login to Railway
echo "🔐 Logging into Railway..."
railway login

# Create new project
echo "📦 Creating Railway project..."
railway project new

# Add PostgreSQL database
echo "🗄️ Adding PostgreSQL database..."
railway add postgresql

# Deploy backend
echo "🚀 Deploying backend..."
cd apps/api
railway up

# Get the deployed URL
echo "🌐 Getting deployment URL..."
BACKEND_URL=$(railway domain)
echo "Backend deployed at: $BACKEND_URL"

# Update frontend environment
echo "🔧 Updating frontend environment..."
cd ../ui
echo "export const environment = {
  production: true,
  apiUrl: '$BACKEND_URL/api/v1',
  appName: 'Mini ERP',
  version: '1.0.0'
};" > src/environments/environment.prod.ts

# Deploy frontend
echo "🚀 Deploying frontend..."
railway up

# Get frontend URL
FRONTEND_URL=$(railway domain)
echo "Frontend deployed at: $FRONTEND_URL"

echo "✅ Deployment complete!"
echo "Backend: $BACKEND_URL"
echo "Frontend: $FRONTEND_URL"
echo "Database: PostgreSQL (managed by Railway)"
echo ""
echo "🔧 Next steps:"
echo "1. Run database migrations: railway run npx prisma migrate deploy"
echo "2. Seed database: railway run npx prisma db seed"
echo "3. Test your application!"
