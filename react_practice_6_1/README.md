# Folio — React homework: installable PWA

The existing blog, Firebase authentication, dashboard, filters and Community CRUD are preserved. Folio now includes an installable manifest, a manually implemented Service Worker, offline public data, safe version updates and responsive navigation.

**Подробное объяснение на русском с полным путём запроса:** [PWA_GUIDE_RU.md](PWA_GUIDE_RU.md).

## PWA

- `npm run build` builds the app and generates `dist/sw.js` from `pwa/sw.js` with a content-derived version and the actual built asset list.
- The Service Worker runs in the production build (`npm run preview` or HTTPS deployment), not the development server.
- The shell, lazy route chunks, icons and independent offline fallback are precached. Known app routes use the active version's shell.
- Public `/data/posts.json` and JSONPlaceholder GET `/posts` / `/posts/:id` use network-first caching: 4-second timeout, 60 entries, 7-day expiration.
- Public runtime images/fonts/styles use cache-first: 80 entries, 30-day expiration. Auth traffic, credentials, private/no-store responses and mutations are excluded from shared caches.
- `/community/:id` reads a public API detail. `/offline` provides retry and saved-story navigation. Unknown offline navigations use `offline.html` without depending on React.
- Saved data is labelled with its download time. On reconnection, active queries refresh. Public reads reach the Service Worker even when the browser reports offline.
- A waiting worker is activated only by **Update now**. Old tabs reload and outdated Folio shell caches are removed; public runtime data is retained.
- **Install Folio** invokes the browser prompt when supported, or shows browser installation instructions.
- Run `npm run build` then `npm run test:e2e` for browser checks. Install Chromium with `npx playwright install chromium`, or use `PLAYWRIGHT_CHANNEL=msedge` with installed Edge. Tests use controlled public API responses and real Service Workers/Cache Storage.

The initial visit needs a connection. Only successfully downloaded, unexpired public data can be read offline. Firebase sign-in and Community writes need a connection; no offline write queue is implemented.

Link [https://frontend-developer-s2zh.vercel.app/community](https://frontend-developer-s2zh.vercel.app/community)

This project extends `react_practice_5_1` and replaces the initial auth-only
structure in `react_practice_6_1`. The previous blog routes, 120 sample stories,
search, category/status filters, sorting, URL query parameters, pagination,
details, and dashboard remain available.

## Run locally

```bash
npm ci
cp .env.example .env.local
npm run dev
```

On PowerShell, use `Copy-Item .env.example .env.local`.
If you already have a `.env` file, keep it: Vite reads it too. Do not overwrite
your existing Firebase values with the blank example. Restart Vite after changes.

## Firebase setup

1. Open your Firebase project and register a Web app.
2. Enable **Email/Password** and **Google** in Authentication → Sign-in method.
3. Add `localhost` and your deployment domain to Authentication → Settings →
   Authorized domains.
4. Copy the Web app configuration into `.env.local`:

| Firebase field    | Environment variable     |
| ----------------- | ------------------------ |
| apiKey            | VITE_API_KEY             |
| authDomain        | VITE_AUTH_DOMAIN         |
| projectId         | VITE_PROJECT_ID          |
| storageBucket     | VITE_STORAGE_BUCKET      |
| messagingSenderId | VITE_MESSAGING_SENDER_ID |
| appId             | VITE_APP_ID              |

The original misspelling `VITE_PTOJECT_ID` is supported for compatibility;
prefer the corrected `VITE_PROJECT_ID`. Analytics/measurement ID is optional.
Firebase initializes in `src/config/firebase.js`.

Without configuration, public pages still work and auth pages explain what is
missing. No fake logged-in user is created. Environment files are ignored by Git;
only the empty `.env.example` is committed.

## Routes

| Route      | Purpose                                               |
| ---------- | ----------------------------------------------------- |
| /          | Featured stories                                      |
| /about     | About the project                                     |
| /posts     | Search, filters, sorting, pagination                  |
| /posts/:id | Story details; invalid/missing IDs handled            |
| /dashboard | Statistics, category/status breakdown, recent content |
| /login     | Email/password and Google sign-in                     |
| /signup    | Email, password, confirmation, validation             |
| /profile   | Protected email, UID, provider information, logout    |
| /community | Cached HTTP API and create/update/delete exercise     |
| /signin    | Compatibility redirect to /login                      |
| /signout   | Protected logout confirmation page                    |
| *          | Not-found page                                        |

`AuthProvider` restores the Firebase session with `onAuthStateChanged`.
Persistence uses `browserLocalPersistence`. Protected routes wait for session
restoration before redirecting guests. Successful login returns to the intended
internal route, otherwise `/profile`. The navigation changes with auth state.
Auth errors are displayed in the UI, and pending actions disable the form.
Google buttons use `type="button"`.

## Data and caching

The original blog remains a **bundled mock HTTP resource** at
`/data/posts.json`; it is not a Django backend. Filtering and pagination run
in the service, preserving the previous homework's behavior.

The Community page calls the real public demonstration API at
`https://jsonplaceholder.typicode.com/posts` with GET, POST, PATCH, and DELETE.
**JSONPlaceholder does not persist writes.** After successful responses, a
service-layer, per-account in-memory overlay keeps changes visible for the
current browser session. Refreshing the page resets those edits. This is a
CRUD/caching exercise, not production publishing or a private data backend.
Only sample title/body/userId data is sent to that API; Firebase tokens are not.

TanStack Query owns the cache:

- `['posts', 'list', filters]`: search, category, status, sort, page, limit.
- `['posts', 'detail', id]`: individual story.
- `['posts', 'all']`: dashboard dataset.
- `['community', uid]`: community data isolated by signed-in account.
- `staleTime: 60_000`: fresh results are reused for one minute.
- `gcTime: 300_000`: inactive cache entries are removed after five minutes.
- Stale queries revalidate on mount, window focus, or reconnection.
- Successful create/update/delete cancels outstanding community requests and
  invalidates that account's query. Active subscribers refetch immediately.
- Failed writes leave the current data unchanged and show an error.
- Query functions pass `AbortSignal` into fetch. Different filters/IDs have
  separate cache keys, so an old response cannot overwrite a newer view.
- Loading, error, empty, and manual refresh states are included.

No UI component fetches an API or reads localStorage directly. Auth calls live
in `services/authService.ts`; data calls live in `services/*Service.ts`;
query/mutation coordination lives in `hooks/`.

## Code organization and formatting

```text
src/
  components/  Reusable navigation, cards, states, route protection
  config/      Firebase initialization
  context/     AuthContext and AuthProvider
  hooks/       useAuth, data queries, mutations
  layouts/     Shared page shells
  pages/       Route screens
  services/    Authentication, HTTP, validation, cache configuration
  styles/      Responsive CSS
  types/       Blog data types
```

The restored blog uses TypeScript/TSX. Components use multiline JSX with
80-column Prettier formatting; styles use regular CSS.

```bash
npm run format
npm run format:check
npm run lint
npm test
npm run build
```

Tests cover protected route restoration, login/logout, Google button behavior,
validation, visible errors, cache invalidation, failed writes, account isolation,
and stale-request handling. Firebase is mocked in automated auth tests.
A real Firebase project is still required to verify actual Google login and
session restoration against Firebase.

## Deployment

Use this directory as the deployment root. Build: `npm run build`; output:
`dist`. Add the same Firebase environment variables to the hosting settings,
rebuild, and add the domain to Firebase Authorized domains.
The included SPA rewrite preserves direct navigation and refresh.

The public application URL is listed at the top of this README. Deploy this directory (`react_practice_6_1`) with `npm run build` and output `dist`. The Vercel configuration excludes PWA files from the SPA rewrite and disables caching of `sw.js` so updates can be detected.

## References

- [Firebase authentication](https://firebase.google.com/docs/auth/web/start)
- [Firebase persistence](https://firebase.google.com/docs/auth/web/auth-state-persistence)
- [TanStack Query cancellation](https://tanstack.com/query/latest/docs/framework/react/guides/query-cancellation)
- [Mutation invalidation](https://tanstack.com/query/latest/docs/framework/react/guides/invalidations-from-mutations)
- [JSONPlaceholder limitations](https://jsonplaceholder.typicode.com/)
