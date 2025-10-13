#!/bin/bash

# Railway deployment script
echo "🚀 Starting Railway deployment..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🗄️ Running database migrations..."
npx prisma migrate deploy

# Seed the database (only if empty)
echo "🌱 Seeding database..."
npx prisma db seed

# Build the application
echo "🏗️ Building application..."
npm run build --workspace=apps/api

echo "✅ Deployment preparation complete!"
