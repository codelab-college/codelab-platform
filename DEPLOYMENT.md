# Deployment Guide for Render

This guide explains how to deploy the CodeLab platform on Render.

## Prerequisites

- GitHub repository with your code
- Render account (free tier available)

## Deployment Options

### Option 1: Using render.yaml (Recommended)

The `render.yaml` file is already configured for automatic deployment.

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

2. **Connect to Render**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect `render.yaml` and create both services

3. **Set Environment Variables**
   
   The following will be auto-configured:
   - `NODE_ENV=production`
   - `PORT=10000`
   - `JWT_SECRET` (auto-generated)
   - `FRONTEND_URL` and `VITE_API_URL` (auto-linked)

### Option 2: Manual Deployment

#### Backend Service

1. **Create Web Service**
   - Go to Render Dashboard
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `codelab-backend`
     - **Root Directory**: `backend`
     - **Runtime**: Node
     - **Build Command**: `npm install && npm run init-db && npm run seed`
     - **Start Command**: `npm start`
     - **Plan**: Free

2. **Environment Variables**
   Add these in Render dashboard:
   ```
   NODE_ENV=production
   PORT=10000
   JWT_SECRET=<generate-a-secure-random-string>
   FRONTEND_URL=https://your-frontend-app.onrender.com
   ```

3. **Health Check**
   - Path: `/health`

#### Frontend Service

1. **Create Static Site**
   - Click "New" → "Static Site"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `codelab-frontend`
     - **Root Directory**: `frontend`
     - **Build Command**: `npm install && npm run build`
     - **Publish Directory**: `dist`
     - **Plan**: Free

2. **Environment Variables**
   ```
   VITE_API_URL=https://your-backend-app.onrender.com/api
   ```

3. **Rewrite Rules**
   Add this to handle client-side routing:
   - **Source**: `/*`
   - **Destination**: `/index.html`
   - **Action**: Rewrite

## Post-Deployment

### 1. Initialize Database
The database will be automatically initialized during the build process. To reseed:
- Go to backend service in Render
- Shell tab
- Run: `npm run seed`

### 2. Update URLs
After both services are deployed, update the environment variables with actual URLs:

**Backend** (`FRONTEND_URL`):
```
https://your-actual-frontend.onrender.com
```

**Frontend** (`VITE_API_URL`):
```
https://your-actual-backend.onrender.com/api
```

### 3. Test Login
Use the default credentials:
- **Student**: USN: `1MS21CS001`, Password: `password123`
- **Teacher**: USN: `TCSE001`, Password: `password123`
- **Admin**: USN: `ADMIN001`, Password: `password123`

## Important Notes

### Free Tier Limitations
- Services spin down after 15 minutes of inactivity
- First request after inactivity may take 30-50 seconds
- 750 hours/month of runtime
- Database is stored in disk (persistent across deploys)

### Production Considerations

1. **Security**
   - Change default passwords immediately
   - Use strong JWT_SECRET (auto-generated in render.yaml)
   - Enable HTTPS (automatic on Render)

2. **Database**
   - SQLite is stored on disk (persists across deploys)
   - For production scale, consider PostgreSQL

3. **Performance**
   - Free tier may be slow on first request
   - Consider upgrading to paid tier for better performance

## Troubleshooting

### Backend won't start
- Check logs in Render dashboard
- Verify all environment variables are set
- Ensure `npm install` completed successfully

### Frontend can't connect to backend
- Check `VITE_API_URL` environment variable
- Verify CORS settings in backend
- Check backend `FRONTEND_URL` matches your frontend URL

### Database errors
- Run `npm run init-db` manually from Shell
- Check database file permissions
- Verify disk space

## Local Development

Create `.env` files based on examples:

**Backend** (`.env`):
```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your settings
```

**Frontend** (`.env`):
```bash
cp frontend/.env.example frontend/.env
# Set VITE_API_URL=http://localhost:5000/api
```

## Updating Deployment

Simply push to GitHub:
```bash
git add .
git commit -m "Your changes"
git push origin main
```

Render will automatically rebuild and deploy both services.

---

For more help, visit [Render Documentation](https://render.com/docs)
