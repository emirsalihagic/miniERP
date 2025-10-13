# Vercel Deployment Guide

This guide explains how to deploy your Mini ERP frontend and backend separately to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI**: Install globally with `npm i -g vercel`
3. **Git Repository**: Your code should be in a Git repository (GitHub, GitLab, or Bitbucket)

## Project Structure

Your monorepo has the following structure:
```
miniERP/
├── apps/
│   ├── ui/          # Angular Frontend
│   └── api/         # NestJS Backend
```

## Deployment Steps

### 1. Deploy Backend (API) First

The backend needs to be deployed first because the frontend will reference its URL.

#### Option A: Deploy via Vercel Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your Git repository
4. **Important**: Set the Root Directory to `apps/api`
5. Configure the following settings:
   - **Framework Preset**: Other
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

#### Option B: Deploy via CLI

```bash
# Navigate to the API directory
cd apps/api

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? (select your account)
# - Link to existing project? N
# - Project name: mini-erp-api (or your preferred name)
# - Directory: ./
# - Override settings? N
```

#### Environment Variables for Backend

In your Vercel dashboard, go to your API project settings and add these environment variables:

```
DATABASE_URL=your_database_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=production
```

### 2. Deploy Frontend (UI)

After the backend is deployed, note its URL (e.g., `https://mini-erp-api.vercel.app`).

#### Update Frontend Environment

Update the API URL in your frontend environment:

```typescript
// apps/ui/src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://your-actual-api-url.vercel.app/api/v1',
  appName: 'Mini ERP',
  version: '1.0.0'
};
```

#### Deploy Frontend

#### Option A: Deploy via Vercel Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your Git repository
4. **Important**: Set the Root Directory to `apps/ui`
5. Configure the following settings:
   - **Framework Preset**: Angular
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/mini-erp-ui/browser`
   - **Install Command**: `npm install`

#### Option B: Deploy via CLI

```bash
# Navigate to the UI directory
cd apps/ui

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? (select your account)
# - Link to existing project? N
# - Project name: mini-erp-ui (or your preferred name)
# - Directory: ./
# - Override settings? N
```

## Configuration Files

The following configuration files have been created for you:

### Frontend (`apps/ui/vercel.json`)
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist/mini-erp-ui/browser",
  "installCommand": "npm install",
  "framework": "angular",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "SAMEORIGIN"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### Backend (`apps/api/vercel.json`)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/main.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/main.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "functions": {
    "dist/main.js": {
      "maxDuration": 30
    }
  }
}
```

## Database Considerations

### Option 1: Use Vercel Postgres
1. In your Vercel dashboard, go to Storage
2. Create a new Postgres database
3. Use the connection string as your `DATABASE_URL`

### Option 2: External Database
Use services like:
- PlanetScale
- Supabase
- Railway
- Neon

## Important Notes

1. **CORS Configuration**: Make sure your backend allows requests from your frontend domain
2. **Environment Variables**: Set all required environment variables in Vercel dashboard
3. **Database Migrations**: Run Prisma migrations after deployment
4. **Build Process**: Both projects will build automatically on deployment

## Troubleshooting

### Common Issues

1. **Build Failures**: Check that all dependencies are in `package.json`
2. **CORS Errors**: Update your backend CORS configuration
3. **Database Connection**: Verify your `DATABASE_URL` is correct
4. **Environment Variables**: Ensure all required env vars are set in Vercel

### Useful Commands

```bash
# Check deployment logs
vercel logs

# Redeploy
vercel --prod

# Check project status
vercel ls
```

## Custom Domains

After successful deployment, you can add custom domains:

1. Go to your project in Vercel dashboard
2. Navigate to Settings > Domains
3. Add your custom domain
4. Configure DNS records as instructed

## Monitoring

- Use Vercel Analytics for performance monitoring
- Check Vercel Functions logs for backend issues
- Monitor database performance through your database provider

## Next Steps

1. Set up CI/CD with GitHub Actions (optional)
2. Configure monitoring and alerting
3. Set up staging environments
4. Implement proper error tracking (Sentry, etc.)
