# 🚀 **ONE-CLICK RAILWAY DEPLOYMENT**

## ✅ **Is it FREE?**
**YES!** Railway offers:
- **$5 credit monthly** (enough for small apps)
- **PostgreSQL database** included
- **Custom domains** included
- **Automatic deployments** included

## 🎯 **Quick Start (5 minutes)**

### **Option 1: Manual Deployment**
1. **Go to [railway.app](https://railway.app)**
2. **Sign up with GitHub**
3. **Click "New Project" → "Deploy from GitHub repo"**
4. **Select your `miniERP` repository**
5. **Choose `apps/api` folder as root**
6. **Add PostgreSQL database**
7. **Set environment variables** (see below)
8. **Deploy!**

### **Option 2: CLI Deployment**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Run deployment script
./deploy-railway.sh
```

## 🔧 **Required Environment Variables**

```bash
# Database (Railway provides automatically)
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

## 🎉 **What You Get**

After deployment:
- ✅ **Backend API**: `https://your-app.railway.app`
- ✅ **PostgreSQL Database**: Managed by Railway
- ✅ **Automatic Deployments**: On every Git push
- ✅ **SSL Certificates**: Automatic HTTPS
- ✅ **Custom Domain**: Optional
- ✅ **Monitoring**: Built-in logs and metrics

## 💰 **Cost Breakdown**

| Service | Free Tier | Paid |
|---------|-----------|------|
| **Backend** | $5 credit/month | $5-15/month |
| **Database** | Included | Included |
| **Frontend** | $5 credit/month | $5-15/month |
| **Total** | **$0-5/month** | **$10-30/month** |

## 🚀 **Ready to Deploy?**

**Just say "yes" and I'll:**
1. ✅ Guide you through Railway setup
2. ✅ Configure environment variables
3. ✅ Deploy backend + database
4. ✅ Deploy frontend
5. ✅ Test everything
6. ✅ Give you live URLs

**Your app will be live in under 10 minutes!**
