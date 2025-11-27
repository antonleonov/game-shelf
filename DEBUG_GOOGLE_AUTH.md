# Debugging Google OAuth Login Issues

## Quick Debugging Steps

### 1. Check Browser Console
Open your browser's Developer Tools (F12) and check the Console tab for errors:
- Look for JavaScript errors
- Check for network request failures
- Note any error messages from Google Sign-In

### 2. Check Network Tab
In Developer Tools, go to the Network tab:
- Look for requests to `/api/auth/google`
- Check the request payload and response
- Note the HTTP status code (should be 200 for success)
- Check for CORS errors

### 3. Check Backend Logs
```bash
# View backend logs
docker compose logs -f backend

# Or if running locally
cd backend && npm run dev
```

Look for:
- Authentication errors
- Database connection issues
- Missing environment variables
- JWT secret issues

### 4. Verify Environment Variables

#### Frontend (.env or docker-compose.yml)
```bash
# Check if NEXT_PUBLIC_GOOGLE_CLIENT_ID is set
echo $NEXT_PUBLIC_GOOGLE_CLIENT_ID

# In browser console, check:
console.log('Google Client ID:', process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID)
```

#### Backend (.env)
```bash
# Check backend environment variables
docker compose exec backend env | grep -E "GOOGLE|JWT|DATABASE"
```

Required variables:
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (frontend)
- `GOOGLE_CLIENT_ID` (backend, if used)
- `GOOGLE_CLIENT_SECRET` (backend, if used)
- `JWT_SECRET` (backend)
- `DATABASE_URL` (backend)

### 5. Common Issues and Solutions

#### Issue: "The given origin is not allowed for the given client ID"
**This is the most common error!** It means your origin isn't authorized in Google Cloud Console.

**Solutions:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to: **APIs & Services** → **Credentials**
3. Find your OAuth 2.0 Client ID and click the edit (pencil) icon
4. Under **Authorized JavaScript origins**, verify you have:
   - `http://localhost:3000` (no trailing slash!)
   - If missing, click "Add URI" and add it
5. Under **Authorized redirect URIs**, verify you have:
   - `http://localhost:3000` (no trailing slash!)
   - If missing, click "Add URI" and add it
6. **Click "Save"** (very important!)
7. Wait 1-2 minutes for changes to propagate
8. Clear browser cache and try again

**Common mistakes:**
- ❌ `http://localhost:3000/` (trailing slash - WRONG)
- ✅ `http://localhost:3000` (no trailing slash - CORRECT)
- ❌ Using `https://localhost:3000` (wrong protocol for local)
- ❌ Forgetting to click Save after adding URIs

#### Issue: "Failed to initialize Google Sign-In"
**Possible causes:**
- Missing or incorrect `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- Google Client ID not properly configured in Google Cloud Console
- Script loading error

**Solutions:**
1. Verify `.env` file has `NEXT_PUBLIC_GOOGLE_CLIENT_ID` set
2. Restart frontend container: `docker compose restart frontend`
3. Check Google Cloud Console:
   - Authorized JavaScript origins: `http://localhost:3000` (no trailing slash!)
   - Authorized redirect URIs: `http://localhost:3000` (no trailing slash!)

#### Issue: "Login failed. Please try again."
**Possible causes:**
- Backend API not reachable
- Database connection issue
- Missing required fields in request
- JWT secret not set

**Solutions:**
1. Check backend is running: `docker compose ps`
2. Test backend health: `curl http://localhost:3001/health`
3. Check backend logs for specific error
4. Verify database is running: `docker compose ps postgres`

#### Issue: CORS Error
**Possible causes:**
- Frontend URL not in CORS allowed origins
- Backend CORS configuration incorrect

**Solutions:**
1. Check `FRONTEND_URL` in backend `.env`
2. Verify it matches your frontend URL (default: `http://localhost:3000`)

#### Issue: "Invalid or expired token"
**Possible causes:**
- JWT_SECRET not set or changed
- Token expired (should be 7 days)

**Solutions:**
1. Verify `JWT_SECRET` is set in backend `.env`
2. Clear browser cookies and try again

### 6. Step-by-Step Debugging

1. **Test Google Script Loading**
   ```javascript
   // In browser console
   console.log('Google object:', window.google)
   console.log('Client ID:', process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID)
   ```

2. **Test Backend Endpoint**
   ```bash
   # Test auth endpoint manually
   curl -X POST http://localhost:3001/api/auth/google \
     -H "Content-Type: application/json" \
     -d '{
       "googleId": "test123",
       "email": "test@example.com",
       "name": "Test User"
     }'
   ```

3. **Check Database Connection**
   ```bash
   docker compose exec postgres psql -U gameshelf -d gameshelf -c "SELECT COUNT(*) FROM users;"
   ```

4. **Verify Environment Variables in Container**
   ```bash
   # Frontend
   docker compose exec frontend printenv | grep GOOGLE
   
   # Backend
   docker compose exec backend printenv | grep -E "GOOGLE|JWT|DATABASE"
   ```

### 7. Enable Detailed Logging

The code now includes improved error logging. Check:
- Browser console for frontend errors
- Backend logs for server-side errors
- Network tab for HTTP errors

### 8. Reset and Retry

If all else fails:
```bash
# Stop all services
docker compose down

# Remove volumes (WARNING: deletes data)
docker compose down -v

# Rebuild and start
docker compose up -d --build

# Run migrations
docker compose exec backend npm run migrate
```

## Getting Help

When reporting issues, include:
1. Browser console errors (screenshot or copy)
2. Network tab request/response details
3. Backend logs output
4. Environment variable status (without showing secrets)
5. Steps to reproduce

