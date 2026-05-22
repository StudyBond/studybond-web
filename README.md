# StudyBond Web

Learner-facing StudyBond web app.

## V1 Scope

- Public landing page
- Auth flows:
  - login
  - register
  - OTP verification
  - forgot password
  - reset password
- Authenticated dashboard
- Backend-for-frontend routes under `/api/*`
- HTTP-only cookie session handling
- Real dashboard data only

## Non-Goals For This Slice

- No active exam-taking flow
- No exam launcher
- No collaboration/duel UI
- No full leaderboard page
- No bookmarks, subscriptions, reports, or profile/security pages
- No visible institution picker; launch default remains `UI`
- No AI learning surfaces

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Default local environment:

```env
BACKEND_API_BASE_URL=http://localhost:5000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Production Wiring

Set these in Vercel for `studybond-web`:

```env
BACKEND_API_BASE_URL=https://your-backend.onrender.com
NEXT_PUBLIC_APP_URL=https://your-web-domain.vercel.app
```

The learner app calls local `/api/*` routes first. Those route handlers then forward requests to `BACKEND_API_BASE_URL`, so this single backend URL is what connects the Vercel app to the deployed backend service.

## Architecture Rules

- Client components call local BFF routes only, never backend URLs directly.
- Access and refresh tokens stay in HTTP-only cookies.
- Proxy route protection stays thin: cookie presence only, no backend calls or business logic.
- TanStack Query owns server state.
- Zustand is reserved for short-lived UI/product state only.
- Dashboard components must not import mock or dummy data.
- Feature components must use semantic design tokens instead of raw lime/amber colors.
- UI never exposes raw backend errors.

## Validation

```bash
npm run lint
npm run typecheck
npm run build
```
