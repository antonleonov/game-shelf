# Google OAuth Configuration for External Access (WiFi IP: 10.11.20.39)

This guide explains how to configure Google OAuth to allow access from your local network IP address.

## Prerequisites

- Access to [Google Cloud Console](https://console.cloud.google.com/)
- Your WiFi IP address: `10.11.20.39`
- Your Google OAuth Client ID

## Step-by-Step Configuration

### 1. Access Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Navigate to **APIs & Services** → **Credentials**

### 2. Find Your OAuth 2.0 Client ID

1. In the Credentials page, find your OAuth 2.0 Client ID
2. Click the **Edit** (pencil) icon next to your client ID

### 3. Configure Authorized JavaScript Origins

In the **Authorized JavaScript origins** section, add:

```
http://10.11.20.39:3000
http://localhost:3000
```

**Important Notes:**
- Use `http://` (not `https://`) for local development
- Include the port number (`:3000`)
- No trailing slashes
- You can have multiple origins (localhost for local dev, IP for network access)

### 4. Configure Authorized Redirect URIs

In the **Authorized redirect URIs** section, add:

```
http://10.11.20.39:3000
http://localhost:3000
```

**Important Notes:**
- Must match the JavaScript origins
- Use `http://` (not `https://`)
- Include the port number
- No trailing slashes

### 5. Save Changes

1. Click **SAVE** at the bottom of the page
2. Wait 1-2 minutes for changes to propagate

## Environment Variables

Update your `.env` file or docker-compose.yml with:

```bash
# Frontend URL (used by backend for CORS)
FRONTEND_URL=http://10.11.20.39:3000

# API URL (used by frontend)
NEXT_PUBLIC_API_URL=http://10.11.20.39:3001

# Google OAuth (keep existing values)
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id-here
```

## Docker Configuration

The docker-compose.yml has been updated to:
- Bind ports to `0.0.0.0` (all interfaces) instead of just localhost
- Use environment variables for URLs (defaults to `10.11.20.39`)

To use different IP addresses, set environment variables:

```bash
export FRONTEND_URL=http://YOUR_IP:3000
export NEXT_PUBLIC_API_URL=http://YOUR_IP:3001
docker compose up -d
```

## Testing

1. **Restart Docker containers:**
   ```bash
   docker compose restart frontend backend
   ```

2. **Access the application:**
   - From the same machine: `http://localhost:3000`
   - From other devices on network: `http://10.11.20.39:3000`

3. **Test Google OAuth:**
   - Click "Sign in with Google"
   - Should redirect to Google login
   - After login, should redirect back to your app

## Troubleshooting

### Error: "The given origin is not allowed for the given client ID"

**Solution:**
1. Verify the IP address in Google Cloud Console matches exactly
2. Check for typos (no trailing slashes, correct port)
3. Wait 1-2 minutes after saving changes
4. Clear browser cache and try again

### Error: "Failed to load resource: net::ERR_CONNECTION_REFUSED"

**Solution:**
1. Verify Docker containers are running: `docker compose ps`
2. Check firewall settings on your machine
3. Ensure ports 3000 and 3001 are not blocked

### OAuth works on localhost but not on IP

**Solution:**
1. Double-check Google Cloud Console has both origins configured
2. Verify `NEXT_PUBLIC_API_URL` environment variable is set correctly
3. Check browser console for specific error messages

## Security Notes

⚠️ **Important for Production:**
- This configuration is for **development only**
- For production, use HTTPS with a proper domain
- Never expose development credentials in production
- Consider using environment-specific OAuth clients

## Quick Reference

**Google Cloud Console URLs:**
- Main Console: https://console.cloud.google.com/
- Credentials: https://console.cloud.google.com/apis/credentials
- OAuth Consent Screen: https://console.cloud.google.com/apis/credentials/consent

**Your Application URLs:**
- Frontend: http://10.11.20.39:3000
- Backend API: http://10.11.20.39:3001

**Required Google OAuth Settings:**
- Authorized JavaScript origins: `http://10.11.20.39:3000`, `http://localhost:3000`
- Authorized redirect URIs: `http://10.11.20.39:3000`, `http://localhost:3000`

