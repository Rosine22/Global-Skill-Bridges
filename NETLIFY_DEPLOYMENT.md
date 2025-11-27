# Netlify Deployment Guide

## 🚀 How to Configure Netlify Environment Variables

Since you can't see settings in the Netlify dashboard, here's the complete step-by-step guide:

### Step 1: Access Netlify Dashboard
1. Go to https://app.netlify.com
2. Log in to your account
3. Click on your site: `global-skills-br`

### Step 2: Add Environment Variables
1. Click on **Site configuration** (or **Site settings**)
2. In the left sidebar, click **Environment variables** (under "Build & deploy" section)
3. Click **Add a variable** or **Add environment variables**
4. Add the following:

```
Key: VITE_API_URL
Value: https://global-skill-bridges-1.onrender.com
```

5. Click **Save**

### Step 3: Trigger a New Deployment
After adding environment variables:
1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Deploy site**

OR simply push new code:
```bash
git add .
git commit -m "Fix API URL and add Netlify config"
git push origin main
```

## 📋 Build Settings (Should Already Be Set)

If you need to configure build settings:
- **Base directory**: `frontend`
- **Build command**: `npm run build`
- **Publish directory**: `frontend/dist`
- **Node version**: 18 or higher

## ✅ What I've Fixed

1. ✅ Created `netlify.toml` with proper build configuration
2. ✅ Created `public/_redirects` for SPA routing
3. ✅ Fixed `.env` files to use correct API URL (no trailing slash)
4. ✅ Updated `api.ts` to use environment variables properly

## 🔍 Troubleshooting

### If site is still blank:
1. Check browser console for errors (F12)
2. Verify the site deployed successfully in Netlify
3. Check deploy logs in Netlify for build errors
4. Make sure `dist` folder exists after build

### If API calls still fail:
1. Verify environment variable is set correctly in Netlify
2. Check that your Render backend is running at https://global-skill-bridges-1.onrender.com
3. Look at Network tab in browser DevTools to see actual API URLs being called

## 🌐 Expected URLs

- **Frontend (Netlify)**: https://global-skills-br.netlify.app
- **Backend (Render)**: https://global-skill-bridges-1.onrender.com
- **Local Dev Frontend**: http://localhost:5173
- **Local Dev Backend**: http://localhost:5000
