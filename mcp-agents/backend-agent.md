# Backend Agent Instructions

## Scope
You are responsible for the `/backend` directory and all backend-related functionality.

## Key Responsibilities

1. **API Development**
   - Create and maintain REST API endpoints
   - Follow RESTful conventions
   - Implement proper error handling
   - Add input validation using express-validator

2. **Database Management**
   - Maintain database schema in `src/db/schema.sql`
   - Create migration scripts when schema changes
   - Optimize queries with proper indexes
   - Handle database connections and pooling

3. **External Integrations**
   - IGDB API integration (already implemented in `src/services/igdb.js`)
   - Google OAuth (handled via frontend, but backend validates tokens)
   - Any future third-party services

4. **Security**
   - JWT token validation
   - Input sanitization
   - SQL injection prevention (use parameterized queries)
   - CORS configuration

5. **Code Quality**
   - Follow Node.js best practices
   - Use async/await for asynchronous operations
   - Proper error handling and logging
   - Keep routes organized and modular

## Current Structure
```
backend/
├── src/
│   ├── server.js          # Main server entry point
│   ├── db/
│   │   ├── connection.js  # Database connection pool
│   │   ├── schema.sql     # Database schema
│   │   └── migrate.js     # Migration script
│   ├── routes/            # API route handlers
│   ├── services/          # Business logic and external services
│   └── middleware/        # Express middleware (auth, etc.)
├── Dockerfile
└── package.json
```

## API Endpoints

### Auth
- `POST /api/auth/google` - Google OAuth callback
- `GET /api/auth/me` - Get current user

### Games
- `GET /api/games/search?q=query` - Search games
- `GET /api/games/:id` - Get game by ID
- `GET /api/games/upcoming/releases` - Get upcoming releases

### Library
- `GET /api/library` - Get user's game library
- `POST /api/library` - Add game to library
- `PUT /api/library/:id` - Update game in library
- `DELETE /api/library/:id` - Remove game from library

### Wishlist
- `GET /api/wishlist` - Get user's wishlist
- `POST /api/wishlist` - Add game to wishlist
- `PUT /api/wishlist/:id` - Update wishlist item
- `DELETE /api/wishlist/:id` - Remove from wishlist

### Friends
- `GET /api/friends` - Get user's friends
- `GET /api/friends/pending` - Get pending friend requests
- `POST /api/friends/request` - Send friend request
- `PUT /api/friends/accept/:id` - Accept friend request
- `DELETE /api/friends/:id` - Remove friend

### Location
- `GET /api/location` - Get user's location
- `POST /api/location` - Set user's location
- `GET /api/location/nearby` - Find nearby users
- `PUT /api/location/privacy` - Update location privacy

### Ads
- `GET /api/ads/banners` - Get banner ads
- `GET /api/ads/sponsored` - Get sponsored recommendations
- `POST /api/ads/:id/impression` - Track ad impression
- `POST /api/ads/:id/click` - Track ad click

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `IGDB_CLIENT_ID` - IGDB API client ID
- `IGDB_CLIENT_SECRET` - IGDB API client secret
- `JWT_SECRET` - Secret for JWT token signing
- `FRONTEND_URL` - Frontend URL for CORS

## Testing
Run migrations: `npm run migrate`
Start dev server: `npm run dev`

