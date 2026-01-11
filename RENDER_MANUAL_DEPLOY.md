# Manual Render Deployment (Recommended)

The Blueprint deployment has issues. Follow these manual steps instead:

## Step 1: Deploy Backend

1. Go to https://dashboard.render.com/
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository: `codelab-college/codelab-platform`

### Backend Configuration:
```
Name: codelab-backend
Region: Oregon (US West)
Branch: main
Root Directory: backend
Runtime: Node
Build Command: npm install && npm run init-db && npm run seed
Start Command: npm start
```

### Environment Variables (click "Advanced" → "Add Environment Variable"):
```
NODE_ENV = production
JWT_SECRET = (click "Generate" to create random value)
FRONTEND_URL = (leave blank for now, add after frontend deploys)
```

### Advanced Settings:
- Auto-Deploy: Yes
- Health Check Path: /health

4. Click **"Create Web Service"**
5. Wait 5-10 minutes for deployment
6. **COPY YOUR BACKEND URL** (example: `https://codelab-backend-abc.onrender.com`)

---

## Step 2: Deploy Frontend

1. Click **"New +"** → **"Static Site"**
2. Connect the same repository

### Frontend Configuration:
```
Name: codelab-frontend
Region: Oregon (US West)
Branch: main
Root Directory: frontend
Build Command: npm install && npm run build
Publish Directory: dist
```

### Environment Variables:
```
VITE_API_URL = https://YOUR-BACKEND-URL-FROM-STEP1.onrender.com/api
```

**IMPORTANT**: Replace with your actual backend URL from Step 1!

Example: `https://codelab-backend-abc.onrender.com/api`

### Redirects/Rewrites (click "Add Rule"):
```
Source: /*
Destination: /index.html
Action: Rewrite
```

3. Click **"Create Static Site"**
4. Wait 3-5 minutes for deployment
5. **COPY YOUR FRONTEND URL** (example: `https://codelab-frontend-xyz.onrender.com`)

---

## Step 3: Update Backend CORS

1. Go back to your **backend service**
2. Click "Environment" in the left sidebar
3. Update or add:
   ```
   FRONTEND_URL = https://YOUR-FRONTEND-URL-FROM-STEP2.onrender.com
   ```
4. Click "Save Changes"
5. Backend will automatically redeploy (takes 1-2 minutes)

---

## Step 4: Test Your Deployment

1. Open your frontend URL
2. Login with test credentials:
   - **Student**: USN `1MS21CS001`, Password `password123`
   - **Teacher**: USN `TCSE001`, Password `password123`
   - **Admin**: USN `ADMIN001`, Password `password123`

3. Test features:
   - ✓ Login/logout
   - ✓ View assignments
   - ✓ Submit code to practice problems
   - ✓ Dark mode toggle

---

## Common Issues

### "Failed to fetch" or "Network Error"
- Check `VITE_API_URL` in frontend environment
- Make sure it ends with `/api`
- Correct format: `https://your-backend.onrender.com/api`

### "CORS Error"
- Update `FRONTEND_URL` in backend environment
- Must match your actual frontend URL
- Don't include `/api` at the end for this one

### Backend crashes on start
- Check logs in Render dashboard
- Most common: database initialization failed
- Solution: Check if build command completed successfully

### First load very slow (30+ seconds)
- Normal on free tier - services sleep after 15 minutes
- Subsequent loads will be faster
- Upgrade to paid plan for instant loading

---

## After Successful Deployment

1. **Change default passwords immediately!**
2. Share URLs with students and teachers
3. Monitor logs for any errors
4. Consider upgrading to paid tier for:
   - No cold starts
   - More build minutes
   - Better performance

---

## Your URLs

After deployment, save these:

```
Backend API: https://codelab-backend-________.onrender.com
Frontend:    https://codelab-frontend-________.onrender.com

Backend Health Check: https://codelab-backend-________.onrender.com/health
(Should return: {"status":"ok","timestamp":"..."})
```

---

**Need help?** Check the logs in Render dashboard or create an issue on GitHub.
