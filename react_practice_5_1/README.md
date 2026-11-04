# Folio — React Blog Frontend

Deploy link [https://frontend-developer-iiyu.vercel.app/](https://frontend-developer-iiyu.vercel.app/)

A complete responsive frontend inspired by [akoncore/blog-api](https://github.com/akoncore/blog-api), built for **05.react-homework-routes**.

## Start locally

```bash
npm install
npm run dev
```

Open the local Vite URL (normally http://localhost:5173). Verify the production build with `npm run build` and `npm run preview`.

## Pages

| Route | Description |
|---|---|
| `/` | Home / featured stories |
| `/about` | About the editorial project |
| `/posts` | List with search, category and status filters, sorting, URL query sync and pagination |
| `/posts/:id` | Details of an individual post; invalid IDs handled |
| `/dashboard` | Four data statistics, category + status breakdowns, interactive filter |
| `/login` | Styled authentication placeholder; NO credentials sent |
| `*` | Not found / 404 |

Nested routes: `RootLayout` with `Outlet`, and `PostsLayout` with nested index and `:id`. Pages use `React.lazy` and `Suspense`, and `useAsync` cancels stale requests. Navigation is client-side. The Vercel rewrite supports direct routes and refreshing.

## Data and backend compatibility

The app is **not connected to Django**. `src/services/blogService.ts` fetches `/data/posts.json` using the browser's HTTP `fetch`; this is a bundled, simulated HTTP API with 120 records. Searching/filtering/pagination happens inside the service to mirror the future server contract. No static post arrays appear inside components. This is a **demo dataset**, not genuine Django content.

Types align with the actual Django `PostSerializer` in `akoncore/blog-api`: `id`, `title`, `slug`, `body`, `author_info`, `category`, `tags`, `status`, `created_at`, `is_published`. The original serializer does not currently provide a cover image or updated-at field. Optional `cover` is a frontend-only placeholder.

The real backend defines `GET /api/posts/`, `GET /api/posts/{id}/`, and authentication endpoints such as `POST /api/token/`; backend response format and permissions must be checked when integration begins. An integration phase will swap the local fetch service for actual Django endpoints and adjust pagination and dates. No backend code has been changed.

## Insert your images later

For a story image, add assets under `public/images/` and set a demo post's optional `cover` to `/images/my-photo.jpg` in `public/data/posts.json`. Home/about placeholders are rendered through `src/components/ImageSlot.tsx`; pass a `cover` prop or replace the placeholder with your own image path. No emojis, stickers, or icon packages are used.

## Deployment

1. Push this frontend directory to its own repository.
2. Import it into Vercel; framework preset **Vite**, build command `npm run build`, output directory `dist`.
3. `vercel.json` rewrites SPA routes to `index.html`; data JSON remains publicly accessible.
4. Submit both GitHub repo URL and deployed URL to the course platform.

## Architecture

`src/pages` — route screens; `src/components` — reusable UI; `src/layouts` — nested route shells; `src/hooks` — abortable async state; `src/services` — all data fetching and filtering; `src/types` — backend-compatible interfaces; `src/styles` — responsive CSS.
