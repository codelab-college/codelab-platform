# Quick Deployment to Render

## Step 1: Prepare Your Code

```bash
# Make sure everything is committed
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

## Step 2: Deploy Backend

1. Go to https://dashboard.render.com/
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Fill in the details:
   - **Name**: `codelab-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run init-db && npm run seed`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

5. Add Environment Variables:
   - `NODE_ENV` = `production`
   - `JWT_SECRET` = (click "Generate" for random value)
   - `FRONTEND_URL` = (leave blank for now, will update after frontend is deployed)

6. Click **"Create Web Service"**
7. Wait for deployment (5-10 minutes)
8. **Copy the backend URL** (e.g., `https://codelab-backend-xyz.onrender.com`)

## Step 3: Deploy Frontend

1. Click **"New +"** → **"Static Site"**
2. Connect your GitHub repository
3. Fill in the details:
   - **Name**: `codelab-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

4. Add Environment Variable:
   - `VITE_API_URL` = `https://codelab-backend-xyz.onrender.com/api` (use YOUR backend URL from Step 2)

5. Add Rewrite Rule:
   - Click "Redirects/Rewrites"
   - **Source**: `/*`
   - **Destination**: `/index.html`
   - **Action**: `Rewrite`

6. Click **"Create Static Site"**
7. Wait for deployment (3-5 minutes)
8. **Copy the frontend URL** (e.g., `https://codelab-frontend-abc.onrender.com`)

## Step 4: Update Backend Environment

1. Go back to your backend service
2. Go to "Environment" tab
3. Update `FRONTEND_URL` to your frontend URL from Step 3
4. Save changes (backend will auto-redeploy)

## Step 5: Test Your App

1. Open your frontend URL
2. Try logging in with:
   - **Student**: USN: `1MS21CS001`, Password: `password123`
   - **Teacher**: USN: `TCSE001`, Password: `password123`
   - **Admin**: USN: `ADMIN001`, Password: `password123`

## Troubleshooting

### "Cannot connect to backend"
- Check that `VITE_API_URL` in frontend matches your backend URL
- Make sure it ends with `/api`
- Example: `https://codelab-backend-xyz.onrender.com/api`

### "CORS error"
- Update `FRONTEND_URL` in backend environment variables
- Match it to your actual frontend URL
- Redeploy backend after changing

### "Service won't start"
- Check the logs in Render dashboard
- Most common: missing environment variables
- Make sure build command completed successfully

## Important Notes

- **First load is slow**: Free tier services sleep after 15 minutes of inactivity
- **Database persists**: Your SQLite database will persist across deploys
- **Change passwords**: Update default passwords immediately in production!

## Need Help?

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.
