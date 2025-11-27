# Game Shelf

A service for gamers to organize their game library, track upcoming releases, connect with friends, and enable offline game exchange.

## Features

- 🎮 **Game Library Management**: Organize physical and digital games across all platforms
- 📅 **Upcoming Releases**: Track upcoming game releases in a single wishlist
- 👥 **Social Features**: User profiles with friends list
- 📍 **Location-Based Exchange**: Store player location for offline game exchange
- 💰 **Monetization**: Banner ads and sponsored game recommendations

## Tech Stack

- **Backend**: Node.js with Express
- **Frontend**: Next.js 14 (App Router) with TypeScript
- **Database**: PostgreSQL
- **Authentication**: Google OAuth
- **Game Data**: IGDB API (via Twitch)
- **Containerization**: Docker Compose

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Google OAuth credentials
- IGDB API credentials (Twitch App)

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd game-shelf
   ```

2. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=postgresql://gameshelf:gameshelf_dev@localhost:5432/gameshelf
   IGDB_CLIENT_ID=fq9axor5gt3896p784metcfcs0huin
   IGDB_CLIENT_SECRET=55egp0tx34711ucygwsp4606s6tlic
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   JWT_SECRET=your-secret-key-change-in-production
   FRONTEND_URL=http://localhost:3000
   NEXT_PUBLIC_API_URL=http://localhost:3001
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
   ```

3. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

4. **Run database migrations**
   ```bash
   docker-compose exec backend npm run migrate
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Database: localhost:5432

## Development

### Backend Development

```bash
cd backend
npm install
npm run dev
```

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

### Database Migrations

```bash
# From backend directory
npm run migrate
```

## Project Structure

```
game-shelf/
├── backend/              # Node.js/Express backend
│   ├── src/
│   │   ├── server.js     # Main server
│   │   ├── db/           # Database schema and migrations
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic (IGDB integration)
│   │   └── middleware/   # Auth middleware
│   └── Dockerfile
├── frontend/             # Next.js frontend
│   ├── src/
│   │   ├── app/          # Next.js app router
│   │   ├── components/   # React components
│   │   └── lib/          # Utilities (auth, API)
│   └── Dockerfile
├── mcp-agents/           # MCP agents orchestration structure
├── docker-compose.yml    # Multi-container setup
└── README.md
```

## API Endpoints

### Authentication
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

## MCP Agents

The project uses Cursor's MCP agents swarm for orchestration:
- **Backend Agent**: Manages backend development
- **Frontend Agent**: Manages frontend development
- **Design Agent**: Manages design system and Figma integration

See `mcp-agents/` directory for agent instructions.

## Environment Variables

### Backend
- `DATABASE_URL` - PostgreSQL connection string
- `IGDB_CLIENT_ID` - IGDB API client ID
- `IGDB_CLIENT_SECRET` - IGDB API client secret
- `JWT_SECRET` - JWT token signing secret
- `FRONTEND_URL` - Frontend URL for CORS
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret

### Frontend
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` - Google OAuth client ID

## Database Schema

- `users` - User accounts
- `games` - Cached game data from IGDB
- `user_games` - User's game library
- `wishlist` - User's wishlist
- `friendships` - Friend relationships
- `user_locations` - User locations for game exchange
- `advertisements` - Banner ads and sponsored content

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

ISC
