# Setup Instructions

## Prerequisites

1. **Docker & Docker Compose** - Install from [docker.com](https://www.docker.com/)
2. **Google OAuth Credentials** - Get from [Google Cloud Console](https://console.cloud.google.com/)
3. **IGDB API Credentials** - Get from [Twitch Developer Console](https://dev.twitch.tv/console/apps) (create a Twitch App)

## Step-by-Step Setup

### 1. Clone and Navigate
```bash
git clone <repository-url>
cd game-shelf
```

### 2. Create Environment File

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://gameshelf:gameshelf_dev@postgres:5432/gameshelf

# IGDB API (Twitch) - Get from Twitch Developer Console
IGDB_CLIENT_ID=your-igdb-client-id
IGDB_CLIENT_SECRET=your-igdb-client-secret

# Google OAuth (Get from Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here

# JWT Secret (Change in production!)
JWT_SECRET=your-secret-key-change-in-production

# URLs
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id-here
```

### 3. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Application type: Web application
6. Authorized JavaScript origins: `http://localhost:3000`
7. Authorized redirect URIs: `http://localhost:3000`
8. Copy Client ID and Client Secret to `.env` file

### 4. Start Services

```bash
# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 5. Run Database Migrations

```bash
# Run migrations
docker-compose exec backend npm run migrate
```

### 6. Verify Setup

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Health check: http://localhost:3001/health

## Development Workflow

### Backend Development

```bash
# Enter backend container
docker-compose exec backend sh

# Or run locally (requires Node.js)
cd backend
npm install
npm run dev
```

### Frontend Development

```bash
# Enter frontend container
docker-compose exec frontend sh

# Or run locally (requires Node.js)
cd frontend
npm install
npm run dev
```

### Database Access

```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U gameshelf -d gameshelf
```

## Troubleshooting

### Port Already in Use
If ports 3000, 3001, or 5432 are in use:
1. Stop conflicting services
2. Or modify ports in `docker-compose.yml`

### Database Connection Issues
```bash
# Reset database
docker-compose down -v
docker-compose up -d
docker-compose exec backend npm run migrate
```

### IGDB API Issues
- Verify credentials are correct
- Check API rate limits
- Ensure Twitch app is approved

### Google OAuth Issues
- Verify redirect URIs match exactly
- Check that Google+ API is enabled
- Ensure Client ID is set in both backend and frontend env vars

## Next Steps

1. Set up Google OAuth credentials
2. Start the application
3. Test authentication flow
4. Add your first game to the library
5. Explore all features!

## Production Deployment

Before deploying to production:

1. Change `JWT_SECRET` to a strong random string
2. Update database credentials
3. Set proper CORS origins
4. Use environment-specific `.env` files
5. Enable HTTPS
6. Set up proper logging and monitoring
7. Configure database backups

