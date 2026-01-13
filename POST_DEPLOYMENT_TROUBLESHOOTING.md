# Post-Deployment Troubleshooting Guide

This guide covers common issues that arise after deploying to Vercel and how to debug and fix them.

---

## Table of Contents

1. [Authentication Issues](#authentication-issues)
2. [Environment Variable Issues](#environment-variable-issues)
3. [Network/Fetch Errors](#networkfetch-errors)
4. [Supabase Connection Issues](#supabase-connection-issues)
5. [CORS Issues](#cors-issues)
6. [Storage/File Upload Issues](#storagefile-upload-issues)
7. [Redirect Issues](#redirect-issues)
8. [Build/Deployment Errors](#builddeployment-errors)
9. [Database/RLS Issues](#databaserls-issues)
10. [Quick Diagnostic Checklist](#quick-diagnostic-checklist)

---

## Authentication Issues

### Issue: "Failed to execute 'fetch' on 'Window': Invalid value"

**Symptoms:**
- Login/signup forms show fetch errors in console
- `TypeError: Failed to execute 'fetch' on 'Window': Invalid value`
- Error occurs in `signInWithPassword` or `signUp`
- Error stack shows `rc.signInWithPassword` or similar

**Debug Steps:**

1. **Check Environment Variables in Browser:**
   ```javascript
   // Open browser console (F12) and run:
   console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
   console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...');
   ```
   - Should show your Supabase URL and key
   - If `undefined`, environment variables aren't loaded at build time

2. **Check Environment Variables in Vercel:**
   - Vercel Dashboard → Your Project → Settings → Environment Variables
   - Verify these are set:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Check they're enabled for **Production**, **Preview**, and **Development**

3. **Verify Supabase URL Format:**
   - ✅ Correct: `https://xxxxx.supabase.co` (no trailing slash)
   - ❌ Wrong: `http://xxxxx.supabase.co` (missing https)
   - ❌ Wrong: `xxxxx.supabase.co` (missing protocol)
   - ❌ Wrong: `https://xxxxx.supabase.co/` (trailing slash can cause issues)
   - ❌ Wrong: Contains spaces or special characters

4. **Check for Trailing Whitespace:**
   ```bash
   # In Vercel, check if URL has trailing spaces
   # Copy-paste the URL and check for hidden characters
   ```

5. **Check Network Tab:**
   - Open DevTools → Network tab
   - Try login
   - Look for failed requests to Supabase
   - Check request URL - is it malformed?

6. **Check Build Logs:**
   - Vercel Dashboard → Deployments → Build Logs
   - Look for environment variable warnings
   - Check if variables are being injected correctly

**Solution:**

1. **Verify Environment Variables Format:**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Click on `NEXT_PUBLIC_SUPABASE_URL`
   - Ensure it's exactly: `https://xxxxx.supabase.co` (no quotes, no trailing slash)
   - Copy directly from Supabase Dashboard → Settings → API → Project URL

2. **Redeploy After Adding/Updating Variables:**
   ```bash
   # Environment variables require redeployment
   # Vercel Dashboard → Deployments → Click "..." → Redeploy
   ```

3. **Check Variable Names:**
   - Must start with `NEXT_PUBLIC_` for client-side access
   - Case-sensitive: `NEXT_PUBLIC_SUPABASE_URL` not `next_public_supabase_url`
   - No spaces before/after the `=` sign

4. **Test Locally First:**
   ```bash
   # Ensure .env.local has correct values
   cat .env.local
   
   # Test build locally
   pnpm build
   
   # If local works but Vercel doesn't, it's an env var issue
   ```

5. **Clear Browser Cache:**
   - Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
   - Or clear cache and reload

6. **Check Supabase Project Status:**
   - Supabase Dashboard → Check if project is active (not paused)
   - Verify project URL matches environment variable exactly

**Advanced Debugging:**

If variables are set correctly but still failing:

1. **Add Debug Code Temporarily:**
   ```typescript
   // In lib/supabase/client.ts, add:
   console.log('Creating client with URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
   console.log('URL type:', typeof process.env.NEXT_PUBLIC_SUPABASE_URL);
   console.log('URL length:', process.env.NEXT_PUBLIC_SUPABASE_URL?.length);
   ```

2. **Check for Runtime Issues:**
   - The error might occur if URL is `undefined` or empty string
   - Check if there's a build-time vs runtime mismatch

3. **Verify Supabase Client Library:**
   ```bash
   # Check package version
   pnpm list @supabase/ssr
   # Should be compatible with your Next.js version
   ```

---

### Issue: "Invalid login credentials" or "Email not confirmed"

**Symptoms:**
- Login fails even with correct credentials
- Error: "Invalid login credentials"
- Error: "Email not confirmed"

**Debug Steps:**

1. **Check Supabase Auth Settings:**
   - Go to Supabase Dashboard → Authentication → Settings
   - Check "Enable email confirmations" setting
   - If enabled, users must verify email before login

2. **Check Email Provider:**
   - Supabase free tier uses their email service
   - Check spam folder for verification emails
   - Emails might be delayed

**Solution:**

1. **Disable Email Confirmation (Development):**
   - Supabase Dashboard → Authentication → Settings
   - Toggle "Enable email confirmations" OFF
   - Users can login immediately after signup

2. **Resend Verification Email:**
   - Supabase Dashboard → Authentication → Users
   - Find user → Click "..." → "Resend confirmation email"

3. **Verify Email Manually (Admin):**
   - Supabase Dashboard → Authentication → Users
   - Find user → Click "..." → "Confirm email"

---

### Issue: "Auth callback redirects to wrong URL"

**Symptoms:**
- After email verification, redirect fails
- Redirects to `localhost:3000` instead of Vercel URL
- 404 errors on callback

**Debug Steps:**

1. **Check `NEXT_PUBLIC_APP_URL`:**
   ```bash
   # Should be your Vercel URL, not localhost
   echo $NEXT_PUBLIC_APP_URL
   ```

2. **Check Supabase Auth Settings:**
   - Supabase Dashboard → Authentication → URL Configuration
   - Verify "Site URL" matches Vercel URL
   - Check "Redirect URLs" includes your callback URL

**Solution:**

1. **Update Environment Variable:**
   ```bash
   # In Vercel Dashboard → Environment Variables
   NEXT_PUBLIC_APP_URL = https://your-project.vercel.app
   ```

2. **Update Supabase Auth URLs:**
   - Site URL: `https://your-project.vercel.app`
   - Redirect URLs:
     - `https://your-project.vercel.app/auth/callback`
     - `https://your-project.vercel.app/**`

3. **Redeploy:**
   - Redeploy on Vercel after updating environment variables

---

## Environment Variable Issues

### Issue: Environment variables are undefined in browser

**Symptoms:**
- `process.env.NEXT_PUBLIC_*` returns `undefined`
- Features that depend on env vars don't work
- Works locally but not in production

**Debug Steps:**

1. **Check Variable Names:**
   ```bash
   # Must start with NEXT_PUBLIC_ for client-side
   NEXT_PUBLIC_SUPABASE_URL ✅
   SUPABASE_URL ❌ (not accessible in browser)
   ```

2. **Check Vercel Environment:**
   - Vercel Dashboard → Settings → Environment Variables
   - Verify variables are set for correct environment (Production/Preview)

3. **Check Build Logs:**
   - Vercel Dashboard → Deployments → Click deployment → Build Logs
   - Look for environment variable warnings

**Solution:**

1. **Add Missing Variables:**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Add variable with `NEXT_PUBLIC_` prefix
   - Enable for all environments

2. **Redeploy:**
   ```bash
   # Environment variables require rebuild
   # Vercel Dashboard → Deployments → Redeploy
   ```

3. **Verify in Runtime:**
   ```javascript
   // Add temporary debug code
   console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
   ```

---

## Network/Fetch Errors

### Issue: "Failed to fetch" or CORS errors

**Symptoms:**
- Network errors in browser console
- CORS policy errors
- Requests fail with network errors

**Debug Steps:**

1. **Check Supabase URL:**
   ```bash
   # Verify URL is accessible
   curl https://your-project.supabase.co
   ```

2. **Check Browser Network Tab:**
   - Open DevTools → Network tab
   - Try login/signup
   - Check failed requests
   - Look at request URL and response

3. **Check Supabase Status:**
   - Visit: https://status.supabase.com
   - Check if Supabase is experiencing issues

**Solution:**

1. **Verify Supabase Project:**
   - Supabase Dashboard → Settings → API
   - Confirm project URL matches environment variable
   - Check project is active (not paused)

2. **Check RLS Policies:**
   - Supabase Dashboard → Authentication → Policies
   - Ensure policies allow public access where needed

3. **Verify API Keys:**
   - Ensure `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
   - Anon key should be from Settings → API → `anon` `public` key

---

## Supabase Connection Issues

### Issue: "Invalid API key" or "JWT expired"

**Symptoms:**
- API requests fail with authentication errors
- "Invalid API key" errors
- "JWT expired" errors

**Debug Steps:**

1. **Verify API Key:**
   ```bash
   # Check key format (should be long JWT token)
   echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```

2. **Test API Key:**
   ```bash
   # Test with curl
   curl -H "apikey: YOUR_ANON_KEY" \
        -H "Authorization: Bearer YOUR_ANON_KEY" \
        https://YOUR_PROJECT.supabase.co/rest/v1/
   ```

**Solution:**

1. **Regenerate API Key (if needed):**
   - Supabase Dashboard → Settings → API
   - Copy fresh `anon` `public` key
   - Update in Vercel environment variables

2. **Check Key Permissions:**
   - Ensure using `anon` key, not `service_role` key
   - `service_role` key should NOT be in `NEXT_PUBLIC_*` variables

---

## CORS Issues

### Issue: CORS policy blocking requests

**Symptoms:**
- "Access to fetch blocked by CORS policy"
- Requests fail with CORS errors
- Works in some browsers but not others

**Debug Steps:**

1. **Check Request Origin:**
   - Browser console shows origin of blocked request
   - Compare with Supabase allowed origins

2. **Check Supabase CORS Settings:**
   - Supabase Dashboard → Settings → API
   - Check CORS configuration

**Solution:**

1. **Supabase CORS is usually automatic:**
   - Supabase handles CORS automatically
   - If issues persist, check Supabase project settings

2. **Verify Request Headers:**
   - Ensure requests include proper headers
   - Supabase client handles this automatically

---

## Storage/File Upload Issues

### Issue: "Storage bucket not found" or upload fails

**Symptoms:**
- Logo upload fails
- "Bucket not found" errors
- 403 Forbidden errors on upload

**Debug Steps:**

1. **Check Storage Bucket:**
   - Supabase Dashboard → Storage
   - Verify `qr-logos` bucket exists
   - Check bucket is not deleted

2. **Check Storage Policies:**
   - Supabase Dashboard → Storage → `qr-logos` → Policies
   - Verify policies allow uploads

3. **Check File Size:**
   - Verify file is under 5MB limit
   - Check file type (PNG/SVG only)

**Solution:**

1. **Recreate Bucket (if missing):**
   - Supabase Dashboard → Storage → New Bucket
   - Name: `qr-logos`
   - Public: Unchecked
   - Add policies for authenticated uploads

2. **Update Storage Policies:**
   ```sql
   -- Allow authenticated users to upload
   CREATE POLICY "Users can upload own logos"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id = 'qr-logos');
   ```

3. **Check File URL Format:**
   - Verify URL construction in `LogoUpload.tsx`
   - Should be: `https://PROJECT.supabase.co/storage/v1/object/qr-logos/PATH`

---

## Redirect Issues

### Issue: QR code redirects don't work

**Symptoms:**
- `/r/[slug]` returns 404
- Redirects to wrong URL
- "Link not found" errors

**Debug Steps:**

1. **Check Database:**
   - Supabase Dashboard → Table Editor → `links`
   - Verify slug exists
   - Check `original_url` is valid

2. **Test Redirect Route:**
   ```bash
   # Test redirect endpoint
   curl -I https://your-project.vercel.app/r/test-slug
   ```

3. **Check RLS Policies:**
   - Supabase Dashboard → Authentication → Policies
   - Verify `links` table has public read policy

**Solution:**

1. **Add Public Read Policy:**
   ```sql
   -- Allow public read access to links (for redirects)
   CREATE POLICY "Public can read links"
   ON links FOR SELECT
   TO public
   USING (true);
   ```

2. **Verify Slug Format:**
   - Check slug doesn't have invalid characters
   - Ensure slug is lowercase

---

## Build/Deployment Errors

### Issue: Build fails on Vercel

**Symptoms:**
- Deployment fails during build
- Build logs show errors
- "Build failed" in Vercel dashboard

**Debug Steps:**

1. **Check Build Logs:**
   - Vercel Dashboard → Deployments → Failed deployment → Build Logs
   - Look for specific error messages

2. **Test Build Locally:**
   ```bash
   pnpm build
   # Should match Vercel build process
   ```

3. **Check Node Version:**
   - Vercel Dashboard → Settings → General
   - Verify Node.js version matches local (should be 20.x)

**Solution:**

1. **Fix Build Errors:**
   - Address TypeScript errors
   - Fix missing dependencies
   - Resolve import errors

2. **Update Node Version:**
   - Vercel Dashboard → Settings → General
   - Set Node.js version to 20.x

3. **Check Package Manager:**
   - Verify `vercel.json` specifies `pnpm`
   - Or set in Vercel project settings

---

## Database/RLS Issues

### Issue: "Row Level Security policy violation"

**Symptoms:**
- Database queries fail
- "new row violates row-level security policy"
- Can't create/read/update links

**Debug Steps:**

1. **Check User Authentication:**
   ```javascript
   // In browser console
   const { data: { user } } = await supabase.auth.getUser();
   console.log('User:', user);
   ```

2. **Check RLS Policies:**
   - Supabase Dashboard → Authentication → Policies
   - Verify policies exist for `links` and `profiles` tables

3. **Check Policy Conditions:**
   - Ensure policies match user ID correctly
   - Verify `auth.uid()` matches `user_id` column

**Solution:**

1. **Verify RLS Policies:**
   ```sql
   -- Check policies exist
   SELECT * FROM pg_policies WHERE tablename = 'links';
   ```

2. **Recreate Policies (if needed):**
   ```sql
   -- Users can view own links
   CREATE POLICY "Users can view own links"
   ON links FOR SELECT
   USING (auth.uid() = user_id);
   ```

3. **Test as Authenticated User:**
   - Ensure user is logged in
   - Check user ID matches database records

---

## Quick Diagnostic Checklist

Run through this checklist when debugging post-deployment issues:

### Environment Variables
- [ ] `NEXT_PUBLIC_SUPABASE_URL` is set in Vercel
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set in Vercel
- [ ] `NEXT_PUBLIC_APP_URL` is set to Vercel URL (not localhost)
- [ ] Variables are enabled for Production environment
- [ ] Redeployed after adding/updating variables

### Supabase Configuration
- [ ] Supabase project is active (not paused)
- [ ] API keys match Supabase Dashboard → Settings → API
- [ ] Auth callback URLs configured in Supabase
- [ ] Site URL matches Vercel deployment URL
- [ ] Storage bucket `qr-logos` exists
- [ ] RLS policies are enabled and configured

### Database
- [ ] Tables exist (`profiles`, `links`)
- [ ] RLS policies allow necessary operations
- [ ] Indexes are created
- [ ] Triggers are set up (for auto profile creation)

### Authentication
- [ ] Email confirmation settings configured
- [ ] Auth providers enabled (Email/Password)
- [ ] Redirect URLs include callback route
- [ ] Test user can sign up and login

### Network/API
- [ ] Supabase URL is accessible
- [ ] API keys are valid
- [ ] CORS is configured (usually automatic)
- [ ] No firewall blocking requests

### Build/Deployment
- [ ] Build succeeds locally (`pnpm build`)
- [ ] Node.js version matches (20.x)
- [ ] Package manager is `pnpm`
- [ ] No TypeScript errors
- [ ] All dependencies installed

---

## Common Error Messages and Solutions

### "Failed to execute 'fetch' on 'Window': Invalid value"
**Cause:** Invalid Supabase URL in environment variable  
**Common Issues:**
- URL has trailing whitespace
- URL is empty string (not undefined)
- URL has trailing slash
- URL missing protocol (`https://`)
- URL contains invalid characters

**Fix Steps:**
1. Check exact URL value in Vercel (copy-paste to text editor to see hidden chars)
2. Remove any trailing spaces or slashes
3. Ensure format is exactly: `https://xxxxx.supabase.co` (no trailing slash)
4. Redeploy after fixing
5. Clear browser cache and hard refresh

**Debug in Browser Console:**
```javascript
// Check actual value
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
console.log('URL:', url);
console.log('URL length:', url?.length);
console.log('URL trimmed:', url?.trim());
console.log('Is valid URL:', url ? new URL(url).href : 'N/A');
```

### "Invalid API key"
**Cause:** Wrong or missing API key  
**Fix:** Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` matches Supabase Dashboard

### "Repository not found" (Git)
**Cause:** Wrong SSH key or repository URL  
**Fix:** See `DEBUG_GIT_AUTH.md`

### "Row Level Security policy violation"
**Cause:** RLS policy doesn't allow operation  
**Fix:** Check/update RLS policies in Supabase

### "Storage bucket not found"
**Cause:** Bucket deleted or wrong name  
**Fix:** Recreate `qr-logos` bucket in Supabase Storage

### "Email not confirmed"
**Cause:** Email confirmation required but email not verified  
**Fix:** Disable email confirmation or verify email

### "Redirect URL mismatch"
**Cause:** Callback URL not in Supabase allowed URLs  
**Fix:** Add callback URL to Supabase Auth settings

---

## Debugging Tools

### Browser Console
```javascript
// Check environment variables
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('App URL:', process.env.NEXT_PUBLIC_APP_URL);

// Check Supabase client
import { createClient } from '@/lib/supabase/client';
const supabase = createClient();
console.log('Supabase client:', supabase);
```

### Network Tab
- Open DevTools → Network
- Filter by "supabase"
- Check request/response details
- Look for 401/403/404 errors

### Vercel Logs
- Vercel Dashboard → Your Project → Logs
- Check runtime logs for errors
- Filter by function/route

### Supabase Logs
- Supabase Dashboard → Logs
- Check API logs for errors
- Check Auth logs for authentication issues

---

## Getting Help

If issues persist:

1. **Check Vercel Build Logs:**
   - Vercel Dashboard → Deployments → Build Logs
   - Look for specific error messages

2. **Check Browser Console:**
   - Open DevTools → Console
   - Look for JavaScript errors
   - Check Network tab for failed requests

3. **Check Supabase Logs:**
   - Supabase Dashboard → Logs
   - Review API and Auth logs

4. **Verify Configuration:**
   - Run through Quick Diagnostic Checklist above
   - Double-check all environment variables

5. **Test Locally:**
   ```bash
   # Ensure it works locally first
   pnpm dev
   # Then check differences with production
   ```

---

## Quick Browser Debugging Script

If environment variables are set but you're still getting errors, run this in your browser console:

```javascript
// Copy-paste this entire block into browser console (F12)

console.log('=== Environment Variable Debug ===');
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('1. Supabase URL:', url);
console.log('2. URL Type:', typeof url);
console.log('3. URL Length:', url?.length);
console.log('4. URL Trimmed:', url?.trim());
console.log('5. Has Trailing Slash:', url?.endsWith('/'));
console.log('6. Has Leading/Trailing Spaces:', url !== url?.trim());

try {
  const urlObj = new URL(url || '');
  console.log('7. ✅ URL is valid:', urlObj.href);
  console.log('8. Protocol:', urlObj.protocol);
  console.log('9. Hostname:', urlObj.hostname);
} catch (e) {
  console.log('7. ❌ URL is INVALID:', e.message);
}

console.log('10. Anon Key Present:', !!key);
console.log('11. Anon Key Length:', key?.length);
console.log('12. Anon Key Starts With:', key?.substring(0, 20));

// Test Supabase client creation
try {
  const { createClient } = await import('/lib/supabase/client.js');
  const client = createClient();
  console.log('13. ✅ Supabase client created successfully');
} catch (e) {
  console.log('13. ❌ Failed to create client:', e.message);
}
```

**What to look for:**
- URL should be exactly `https://xxxxx.supabase.co` (no trailing slash, no spaces)
- Anon key should be a long JWT token (starts with `eyJ...`)
- If URL has trailing slash or spaces, that's your problem!

---

**Last Updated:** January 2025  
**Related Docs:** `DEBUG_GIT_AUTH.md`, `MANUAL_SETUP_GUIDE.md`
