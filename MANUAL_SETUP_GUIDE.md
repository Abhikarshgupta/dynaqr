# Vercel Deployment Guide - Open-QR Platform

This guide covers deploying the Open-QR platform to Vercel. Supabase setup should already be complete.

---

## Table of Contents
1. [Prepare for Deployment](#prepare-for-deployment)
2. [Deploy to Vercel](#deploy-to-vercel)
3. [Configure Environment Variables](#configure-environment-variables)
4. [Configure Supabase Auth Callbacks](#configure-supabase-auth-callbacks)
5. [Verify Deployment](#verify-deployment)

---

## Prepare for Deployment

### Step 1: Prepare for Vercel Deployment
**Action Required:** Ensure your project is ready for deployment.

1. **Push to GitHub (or GitLab/Bitbucket):**
   ```bash
   # Initialize git if not already done
   git init
   git add .
   git commit -m "Initial commit: Open-QR platform"
   git branch -M main
   git remote add origin <your-repository-url>
   git push -u origin main
   ```

2. **Verify Build Works Locally:**
   ```bash
   # Test production build
   pnpm build
   
   # If build succeeds, you're ready to deploy
   ```

### Step 2: Deploy to Vercel
**Action Required:** Deploy your application to Vercel.

1. **Create Vercel Account:**
   - Visit: https://vercel.com
   - Sign up or log in (you can use GitHub to sign in)

2. **Import Project:**
   - Click "Add New..." → "Project"
   - Import your Git repository (GitHub/GitLab/Bitbucket)
   - Select the `dynaqr` repository
   - Click "Import"

3. **Configure Project Settings:**
   - **Framework Preset:** Next.js (should auto-detect)
   - **Root Directory:** `./` (leave as default)
   - **Build Command:** `pnpm build` (or leave default)
   - **Output Directory:** `.next` (leave as default)
   - **Install Command:** `pnpm install` (or leave default)

4. **Add Environment Variables:**
   Before deploying, add all environment variables in Vercel:
   
   - Click on "Environment Variables" section
   - Add each variable one by one:
   
   **Required Variables:**
   ```
   NEXT_PUBLIC_SUPABASE_URL = <your-supabase-project-url>
   ```
   
   ```
   NEXT_PUBLIC_SUPABASE_ANON_KEY = <your-supabase-anon-key>
   ```
   
   **Important:** For each variable:
   - Select environments: **Production**, **Preview**, and **Development** (check all three)
   - Click "Save" after adding each variable
   
   **After First Deployment:**
   - Once Vercel provides your deployment URL (e.g., `https://your-project.vercel.app`), add:
   ```
   NEXT_PUBLIC_APP_URL = https://your-project.vercel.app
   ```
   - Update this in all environments (Production, Preview, Development)
   
   **Where to find Supabase credentials:**
   - Go to Supabase Dashboard → Settings → API
   - Copy Project URL for `NEXT_PUBLIC_SUPABASE_URL`
   - Copy `anon` `public` key for `NEXT_PUBLIC_SUPABASE_ANON_KEY`

5. **Deploy:**
   - Click "Deploy" button
   - Wait for the build to complete (usually 2-3 minutes)
   - Your app will be live at `https://your-project.vercel.app`

### Step 3: Configure Supabase Auth Callback URLs
**Action Required:** Update Supabase to allow authentication from your Vercel domain.

1. **Go to Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard
   - Select your project

2. **Update Auth Settings:**
   - Go to "Authentication" → "URL Configuration"
   - Add your Vercel URL to **Site URL**: `https://your-project.vercel.app`
   - Add to **Redirect URLs**:
     - `https://your-project.vercel.app/auth/callback`
     - `https://your-project.vercel.app/**` (for all routes)
   - Click "Save"

3. **Update Environment Variables in Vercel:**
   - Go back to Vercel dashboard
   - Project Settings → Environment Variables
   - Update `NEXT_PUBLIC_APP_URL` to your actual Vercel URL
   - Redeploy if needed

### Step 4: Verify Deployment
**Action Required:** Test your deployed application.

1. **Visit Your Live Site:**
   - Open `https://your-project.vercel.app`
   - Verify the homepage loads

2. **Test Authentication:**
   - Try signing up for a new account
   - Check email for verification (if enabled)
   - Try logging in

3. **Test Core Features:**
   - Create a new link
   - Customize QR code
   - Test redirect functionality (`/r/your-slug`)

---

## Adding Environment Variables to Vercel (Detailed Guide)

### Method 1: Via Vercel Dashboard (Recommended)

1. **Navigate to Project Settings:**
   - Go to https://vercel.com/dashboard
   - Click on your project
   - Go to "Settings" tab
   - Click "Environment Variables" in the left sidebar

2. **Add Variables:**
   - Click "Add New" button
   - Enter variable name (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
   - Enter variable value
   - Select environments:
     - ✅ Production
     - ✅ Preview
     - ✅ Development
   - Click "Save"
   - Repeat for each variable

3. **Variables to Add:**
   ```
   NEXT_PUBLIC_SUPABASE_URL = <your-supabase-project-url>
   NEXT_PUBLIC_SUPABASE_ANON_KEY = <your-supabase-anon-key>
   NEXT_PUBLIC_APP_URL = <your-vercel-url> (add after first deployment)
   ```

### Method 2: Via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   pnpm add -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Link Project:**
   ```bash
   vercel link
   ```

4. **Add Environment Variables:**
   ```bash
   # Add each variable (you'll be prompted for the value)
   vercel env add NEXT_PUBLIC_SUPABASE_URL production preview development
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production preview development
   ```

5. **Deploy:**
   ```bash
   vercel --prod
   ```

---

## Troubleshooting

### Issue: Vercel deployment fails
**Solution:**
- Check build logs in Vercel dashboard for specific errors
- Verify all environment variables are set correctly
- Ensure `pnpm build` works locally before deploying
- Check that Node.js version in Vercel matches your local version (should be 20.x)

### Issue: Environment variables not working in Vercel
**Solution:**
- Verify variables are added to all environments (Production, Preview, Development)
- Redeploy after adding new environment variables
- Check variable names match exactly (case-sensitive)
- Ensure `NEXT_PUBLIC_` prefix is used for client-side variables

### Issue: Authentication not working
**Solution:**
- Verify Supabase Auth is enabled in project settings
- Ensure callback URL is set in Supabase Auth settings: `https://your-project.vercel.app/auth/callback`
- Verify `NEXT_PUBLIC_APP_URL` matches your Vercel deployment URL

---

**Last Updated:** January 2025