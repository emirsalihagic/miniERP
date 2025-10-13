# 🚀 Railway Deployment Guide

## Prerequisites
1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **Node.js 18+**: Railway supports Node.js 18+

## 🎯 **Step 1: Deploy Backend (API)**

### 1.1 Connect to Railway
1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your `miniERP` repository
5. Select the `apps/api` folder as the root directory

### 1.2 Configure Environment Variables
In Railway dashboard, go to Variables tab and add:

```bash
# Database (Railway will provide this automatically)
DATABASE_URL=postgresql://username:password@host:port/database

# JWT Secrets (CHANGE THESE!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_REFRESH_EXPIRES_IN=7d

# App Configuration
NODE_ENV=production
PORT=3000
API_PREFIX=api/v1
CORS_ORIGIN=*
```

### 1.3 Add PostgreSQL Database
1. In Railway dashboard, click "New"
2. Select "Database" → "PostgreSQL"
3. Railway will automatically set `DATABASE_URL`

### 1.4 Deploy
1. Railway will automatically detect the `Dockerfile`
2. It will run the build process
3. Your API will be available at: `https://your-app-name.railway.app`

## 🎯 **Step 2: Deploy Frontend (UI)**

### 2.1 Create New Service
1. In Railway dashboard, click "New"
2. Select "GitHub Repo"
3. Choose your `miniERP` repository
4. Select the `apps/ui` folder as root directory

### 2.2 Configure Build Settings
Railway will auto-detect Angular, but you can customize:

```bash
# Build Command
npm run build --configuration production

# Output Directory
dist/mini-erp-ui/browser

# Install Command
npm install
```

### 2.3 Environment Variables
```bash
# API URL (replace with your backend URL)
API_URL=https://your-backend-app.railway.app/api/v1
```

## 🎯 **Step 3: Database Setup**

### 3.1 Run Migrations
After backend deployment, run:
```bash
# In Railway dashboard, go to your backend service
# Click "Deploy" → "Run Command"
npx prisma migrate deploy
```

### 3.2 Seed Database
```bash
# Run this command in Railway
npx prisma db seed
```

## 🎯 **Step 4: Custom Domain (Optional)**

1. In Railway dashboard, go to your service
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Update DNS records as instructed

## 💰 **Cost Breakdown**

### Free Tier (Railway)
- **$5 credit monthly** (enough for small apps)
- **PostgreSQL database** included
- **Custom domains** included
- **Automatic deployments** included

### Estimated Monthly Cost
- **Small app**: $0-5 (free tier covers it)
- **Medium app**: $5-15
- **Large app**: $15-50

## 🔧 **Troubleshooting**

### Common Issues

1. **Build Fails**
   - Check Node.js version (should be 18+)
   - Verify all dependencies are in `package.json`
   - Check build logs in Railway dashboard

2. **Database Connection Issues**
   - Verify `DATABASE_URL` is set correctly
   - Check if migrations ran successfully
   - Ensure database service is running

3. **CORS Issues**
   - Update `CORS_ORIGIN` to include your frontend URL
   - Check if frontend is calling correct API URL

4. **Environment Variables**
   - Ensure all required env vars are set
   - Check for typos in variable names
   - Restart service after adding new variables

## 📱 **Testing Your Deployment**

1. **Backend Health Check**
   ```bash
   curl https://your-backend.railway.app/api/v1/health
   ```

2. **Frontend Access**
   ```bash
   curl https://your-frontend.railway.app
   ```

3. **API Test**
   ```bash
   curl -X POST https://your-backend.railway.app/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@minierp.com","password":"password123"}'
   ```

## 🎉 **Success!**

Your Mini ERP application is now live on Railway with:
- ✅ **Backend API**: `https://your-backend.railway.app`
- ✅ **Frontend UI**: `https://your-frontend.railway.app`
- ✅ **PostgreSQL Database**: Managed by Railway
- ✅ **Automatic Deployments**: On every Git push
- ✅ **Custom Domain**: Optional
- ✅ **SSL Certificates**: Automatic HTTPS

## 🔄 **Updates**

To update your application:
1. Push changes to GitHub
2. Railway automatically detects changes
3. Runs build and deployment
4. Your app is updated in minutes!

---

**Need Help?** Check Railway's documentation or contact support.
