# Vercel Environment Variables Setup

Add these environment variables in your Vercel project settings:

## Required for Sign-In & Core Functionality

### Clerk Authentication (Primary Auth System)
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
```
- Your Clerk publishable key (client-side)
- Get from Clerk Dashboard: API Keys → Publishable Key
- Must be prefixed with `pk_`
- ✅ Already set in Vercel

```
CLERK_SECRET_KEY
```
- Your Clerk secret key (server-side only)
- Get from Clerk Dashboard: API Keys → Secret Key
- Must be prefixed with `sk_`
- ⚠️ Keep this secret - never expose to client
- ✅ Already set in Vercel

### Database
```
DATABASE_URL
```
- Your PostgreSQL connection string
- Format: `postgresql://user:password@host:port/database`
- Get from Supabase: Settings → Database → Connection string
- ✅ Already set in Vercel

### Supabase
```
SUPABASE_URL
```
- Your Supabase project URL
- Format: `https://your-project.supabase.co`
- Get from Supabase: Settings → API → Project URL
- ✅ Already set in Vercel

```
SUPABASE_SERVICE_ROLE_KEY
```
- Your Supabase service role key (server-side only)
- Get from Supabase: Settings → API → service_role key
- ⚠️ Keep this secret - never expose to client
- ✅ Already set in Vercel

### NextAuth.js (Legacy/Secondary - May not be needed)
```
NEXTAUTH_SECRET
```
- Random secret string for JWT signing
- Generate with: `openssl rand -base64 32`
- Or use: https://generate-secret.vercel.app/32
- ✅ Already set in Vercel

```
NEXTAUTH_URL
```
- Your Vercel deployment URL
- Format: `https://your-app.vercel.app`
- Vercel automatically provides `VERCEL_URL`, but NextAuth needs `NEXTAUTH_URL`
- ✅ Already set in Vercel

## Optional (if used)

```
EXTERNAL_API_KEY
```
- Only needed if using external API routes
- Currently only used in example route

```
CLERK_SECRET_KEY
```
- Only needed if using Clerk integration
- App currently uses NextAuth, so this may be legacy

## How to Add in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable:
   - **Key**: Variable name (e.g., `DATABASE_URL`)
   - **Value**: Your actual value
   - **Environment**: Select all (Production, Preview, Development)
4. Click **Save**
5. Redeploy your application

## Quick Setup Script

After adding variables, trigger a redeploy:
- Go to **Deployments** tab
- Click **⋯** on latest deployment → **Redeploy**

## Important Notes

- `NEXTAUTH_URL` must match your actual Vercel deployment URL
- For production: Use your custom domain if configured
- For preview deployments: Vercel provides `VERCEL_URL`, but NextAuth still needs `NEXTAUTH_URL`
- All secrets should be marked as "Encrypted" in Vercel
- Never commit these values to git

