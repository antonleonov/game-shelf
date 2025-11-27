# Frontend Agent Instructions

## Scope
You are responsible for the `/frontend` directory and all frontend-related functionality.

## Key Responsibilities

1. **Component Development**
   - Create reusable React components
   - Follow Next.js 14 App Router conventions
   - Use TypeScript for type safety
   - Implement responsive design

2. **State Management**
   - Use React hooks for local state
   - Context API for global state (auth)
   - API integration via axios

3. **User Experience**
   - Implement intuitive navigation
   - Add loading states and error handling
   - Ensure accessibility
   - Optimize performance

4. **Styling**
   - Use inline styles (can be migrated to CSS modules or Tailwind later)
   - Maintain consistent design system
   - Responsive layouts
   - Dark mode support (if needed)

5. **Integration**
   - Google OAuth integration
   - API communication with backend
   - Cookie-based authentication

## Current Structure
```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx      # Root layout with AuthProvider
│   │   ├── page.tsx        # Home page
│   │   └── globals.css     # Global styles
│   ├── components/         # React components
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── GameLibrary.tsx
│   │   ├── Wishlist.tsx
│   │   ├── UpcomingReleases.tsx
│   │   ├── Friends.tsx
│   │   └── Location.tsx
│   └── lib/
│       ├── auth.tsx        # Auth context and hooks
│       └── api.ts          # API client configuration
├── Dockerfile
├── next.config.js
├── tsconfig.json
└── package.json
```

## Components

### Login
- Google OAuth sign-in
- Handles authentication flow
- Redirects to dashboard on success

### Dashboard
- Main application interface
- Tab navigation
- User profile display
- Logout functionality

### GameLibrary
- Display user's game collection
- Add games via search
- Remove games
- Filter by type (physical/digital)

### Wishlist
- Display wishlist items
- Add games to wishlist
- Remove items
- Priority management

### UpcomingReleases
- Display upcoming game releases
- Add to wishlist directly
- Filter and sort options

### Friends
- Display friends list
- Send friend requests
- Accept/reject requests
- Remove friends

### Location
- Set user location
- Privacy controls
- Find nearby users
- Game exchange feature

## API Integration

All API calls use the `api` client from `src/lib/api.ts`:
- Automatically includes auth token
- Handles errors consistently
- Base URL from environment variable

## Environment Variables
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` - Google OAuth client ID

## Development
- Run dev server: `npm run dev`
- Build: `npm run build`
- Type checking: TypeScript compiler

## Future Enhancements
- Add loading skeletons
- Implement error boundaries
- Add toast notifications
- Optimize images
- Add search filters
- Implement pagination

