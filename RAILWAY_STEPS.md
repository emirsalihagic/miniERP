# 🚀 **RAILWAY DEPLOYMENT - STEP BY STEP**

## **Step 1: Login to Railway**
Run this command in your terminal:
```bash
railway login
```
This will open your browser to authenticate with Railway.

## **Step 2: Create Project**
After login, run:
```bash
railway project new
```
Name it: `mini-erp`

## **Step 3: Deploy Backend**
```bash
cd apps/api
railway up
```

## **Step 4: Add Database**
In Railway dashboard:
1. Go to your project
2. Click "New" → "Database" → "PostgreSQL"
3. Railway will automatically set `DATABASE_URL`

## **Step 5: Set Environment Variables**
In Railway dashboard, go to Variables tab and add:
```bash
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_REFRESH_EXPIRES_IN=7d
NODE_ENV=production
PORT=3000
API_PREFIX=api/v1
CORS_ORIGIN=*
```

## **Step 6: Run Database Setup**
```bash
railway run npx prisma migrate deploy
railway run npx prisma db seed
```

## **Step 7: Deploy Frontend**
```bash
cd ../ui
railway up
```

## **Step 8: Get URLs**
```bash
railway domain
```

---

**Ready to start? Run the commands above!**
