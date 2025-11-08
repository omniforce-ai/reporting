# Clerk Authentication Setup Guide

## How to Sign In as Admin

### Step 1: Sign Up (First Time)

1. Go to `/sign-up` or click "Sign Up" on the sign-in page
2. Create an account with your email and password
3. Verify your email if required by Clerk

### Step 2: Set Your Role as Admin

After signing up, you need to set your role to "admin" to access the admin dashboard.

**Option A: Using the Frontend UI (Recommended)**
1. Sign in at `/sign-in`
2. Go to `/admin/users` (you'll be redirected if not admin)
3. Find your email in the list
4. Click "Edit Role"
5. Select "Admin" and click "Save"

**Option B: Using CLI**
```bash
# Set your role by email
npm run clerk:set your-email@example.com admin

# Or by user ID (get it from /admin/users or Clerk dashboard)
npm run clerk:set user_abc123 admin
```

**Option C: Using Clerk Dashboard**
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to Users
3. Find your user
4. Click on the user → Metadata tab
5. Add to Public metadata:
   ```json
   {
     "role": "admin"
   }
   ```

### Step 3: Sign In as Admin

1. Go to `/sign-in`
2. Enter your email and password
3. You'll be redirected to `/dashboard` (client view) or `/admin` (admin view)

### Accessing Admin Dashboard

Once your role is set to "admin":
- Visit `/admin` or `/admin/clients` to see the admin dashboard
- You'll see the sidebar navigation with:
  - Dashboard
  - Clients
  - Users
  - Settings

### Troubleshooting

**Can't access `/admin` routes?**
- Make sure your role is set to "admin" (not "client")
- Check your role: `npm run clerk:get your-email@example.com`
- Sign out and sign back in to refresh your session

**Redirected to `/dashboard` when accessing `/admin`?**
- Your role is not set to "admin"
- Set it using one of the methods above

**Need to create the first admin?**
1. Sign up at `/sign-up`
2. Use CLI: `npm run clerk:set your-email@example.com admin`
3. Sign in again

