# Quick Fix: "The given origin is not allowed for the given client ID"

## The Problem
You're seeing this error in the browser console:
```
[GSI_LOGGER]: The given origin is not allowed for the given client ID.
```

This means Google doesn't recognize `http://localhost:3000` as an authorized origin for your OAuth Client ID.

## The Solution (5 minutes)

### Step 1: Open Google Cloud Console
Go to: https://console.cloud.google.com/

### Step 2: Navigate to Credentials
1. Select your project (or create one if needed)
2. Go to **APIs & Services** → **Credentials**
3. Find your OAuth 2.0 Client ID (the one starting with `406122794218-...`)
4. Click the **edit icon** (pencil) next to it

### Step 3: Add Authorized Origins
1. Scroll down to **Authorized JavaScript origins**
2. Click **"Add URI"**
3. Enter exactly: `http://localhost:3000`
   - ⚠️ **NO trailing slash!**
   - ⚠️ **Use `http` not `https` for local development**
4. Click outside the input to save the URI

### Step 4: Add Redirect URI (if needed)
1. Scroll down to **Authorized redirect URIs**
2. Click **"Add URI"**
3. Enter exactly: `http://localhost:3000`
   - ⚠️ **NO trailing slash!**
4. Click outside the input to save the URI

### Step 5: Save Changes
1. Scroll to the bottom
2. Click **"SAVE"** button
3. Wait 1-2 minutes for changes to propagate

### Step 6: Test Again
1. Clear your browser cache (or use incognito mode)
2. Refresh the page at `http://localhost:3000`
3. Try logging in again

## Visual Guide

Your Google Cloud Console should look like this:

```
Authorized JavaScript origins
┌─────────────────────────────────────┐
│ http://localhost:3000          [×]  │
└─────────────────────────────────────┘
[+ Add URI]

Authorized redirect URIs
┌─────────────────────────────────────┐
│ http://localhost:3000          [×]  │
└─────────────────────────────────────┘
[+ Add URI]
```

## Still Not Working?

1. **Double-check the Client ID matches:**
   - In Google Cloud Console, verify the Client ID matches what's in your `.env` file
   - The Client ID should be the same in both places

2. **Check for typos:**
   - `http://localhost:3000` (correct)
   - `http://localhost:3000/` (wrong - has trailing slash)
   - `https://localhost:3000` (wrong - should be http for local)

3. **Wait longer:**
   - Google changes can take up to 5 minutes to propagate
   - Try in an incognito window after waiting

4. **Verify your app is running on port 3000:**
   ```bash
   # Check if frontend is running
   docker compose ps frontend
   
   # Check logs
   docker compose logs frontend
   ```

5. **Check environment variable:**
   ```bash
   # Verify the Client ID is set
   docker compose exec frontend printenv | grep GOOGLE
   ```

## Need More Help?

See `DEBUG_GOOGLE_AUTH.md` for comprehensive debugging steps.

