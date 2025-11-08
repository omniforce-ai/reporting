# Clerk Callback URL Configuration for Vercel

## Production URL
Your Vercel production URL: **https://omniforce-reporting.vercel.app**

## Required Clerk Configuration

You need to add your Vercel URLs to Clerk's allowed callback URLs in the Clerk Dashboard.

### Steps to Configure:

1. **Go to Clerk Dashboard**
   - Visit: https://dashboard.clerk.com
   - Select your application

2. **Navigate to Paths & URLs**
   - Go to **Configure** → **Paths & URLs** (or **Settings** → **Paths & URLs**)

3. **Add Production URLs**

   Add these URLs to the following fields:

   **Sign-in redirect URL:**
   ```
   https://omniforce-reporting.vercel.app
   https://omniforce-reporting.vercel.app/*
   ```

   **Sign-up redirect URL:**
   ```
   https://omniforce-reporting.vercel.app
   https://omniforce-reporting.vercel.app/*
   ```

   **After sign-in URL:**
   ```
   https://omniforce-reporting.vercel.app
   ```

   **After sign-up URL:**
   ```
   https://omniforce-reporting.vercel.app
   ```

4. **Keep Development URLs**
   - Make sure `http://localhost:3000` and `http://localhost:3000/*` are still in the list for local development

5. **Save Changes**
   - Click **Save** or **Apply**

## Preview Deployments (Optional)

If you want preview deployments to work, you can add a wildcard pattern:
```
https://*.vercel.app
https://*.vercel.app/*
```

Or add specific preview URLs as needed.

## Verification

After updating:
1. Sign out of your app (if signed in)
2. Try signing in at: https://omniforce-reporting.vercel.app/sign-in
3. You should be redirected back to your app after authentication

## Common Issues

**"Invalid callback URL" error:**
- The URL you're trying to redirect to isn't in Clerk's allowed list
- Make sure you added both the base URL and wildcard patterns (`/*`)

**Redirects to wrong page:**
- Check that your redirect URLs match what's configured in your middleware
- Default redirect is `/` which should work

## Quick Reference

Your production URLs to add:
- `https://omniforce-reporting.vercel.app`
- `https://omniforce-reporting.vercel.app/*`

