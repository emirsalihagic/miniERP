# 🌐 **EASIER WAY: Railway Web Interface**

## **Option 1: Web Interface (Recommended)**

### **Step 1: Go to Railway**
1. Open [railway.app](https://railway.app)
2. Sign up with your GitHub account
3. Click "New Project"

### **Step 2: Deploy Backend**
1. Select "Deploy from GitHub repo"
2. Choose your `miniERP` repository
3. **IMPORTANT**: Set root directory to `apps/api`
4. Click "Deploy"

### **Step 3: Add Database**
1. In your project dashboard, click "New"
2. Select "Database" → "PostgreSQL"
3. Railway automatically sets `DATABASE_URL`

### **Step 4: Configure Environment**
In your backend service, go to Variables tab and add:
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

### **Step 5: Run Database Commands**
In your backend service, go to "Deploy" tab and run:
```bash
npx prisma migrate deploy
npx prisma db seed
```

### **Step 6: Deploy Frontend**
1. Click "New" in your project
2. Select "Deploy from GitHub repo"
3. Choose your `miniERP` repository
4. Set root directory to `apps/ui`
5. Add environment variable:
   ```bash
   API_URL=https://your-backend-url.railway.app/api/v1
   ```

## **Option 2: CLI (Advanced)**
Follow the steps in `RAILWAY_STEPS.md`

---

**Which option do you prefer?**
- **Web Interface**: Easier, visual, step-by-step
- **CLI**: Faster, more control
