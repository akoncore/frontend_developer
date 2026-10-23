# PetCareCenter — React SPA Midterm

A polished, responsive pet-care dashboard built with React, Vite and custom CSS. It is designed to match the domain and endpoint naming of the [PetCareCenter Django REST backend](https://github.com/akoncore/PetCareCenter).

## Quick start

```bash
npm install
cp .env.example .env   # optional (Windows: copy .env.example .env)
npm run dev
```

Open the URL printed by Vite, usually http://localhost:5173.

## Midterm features

- SPA routes: Overview, Pets list, Pet details, Add Pet, Clinics, Services, Appointments.
- 120 **initial** pets from a simulated Promise-based API; state is persisted in `localStorage`.
- Reusable layout, pet cards, avatars, loading/error/empty views, pagination and section headings.
- Controlled Add Pet form and appointment booking form (validation and success toast).
- Pets list: text search, animal filter, four sort orders, pagination at 12 items/page, reset action.
- Clinics and services search; appointment status tabs and cancellation.
- Correct hooks: `useState`, `useEffect`, dependency arrays, AbortController and cancellation guards for stale updates, stable IDs.
- Responsive sidebar, cards and modal on desktop/tablet/mobile.
- No direct DOM manipulation in React components.

## API modes

**Demo is the default** (`VITE_API_MODE=demo`) so the static frontend works without a backend. Demo includes clinics, services, bookings, and 120 pets; additions persist across reloads in browser storage.

For an already running **Django backend**, create `.env`:

```dotenv
VITE_API_MODE=real
VITE_API_URL=http://127.0.0.1:8000/api
```

The Django backend uses DRF `TokenAuthentication` and protects every list with `IsAuthenticated`. In real mode you must provide a token in browser `localStorage` at key `petcare-auth-token` or add a login screen; otherwise API returns 401. To test via browser console after obtaining the token by POST `/api/auth/login/`:

```js
localStorage.setItem("petcare-auth-token", "YOUR_TOKEN");
```

**Important backend limitations:** no browser CORS middleware is currently configured in the linked Django settings; production cross-origin real mode needs `django-cors-headers` and exact frontend origin allowlisting. Frontend will not silently fall back to demo if live API fails. Django's pet list returns pets visible to the logged-in user, not 120 public records. For midterm grading the standalone 120-record demo is safer unless real backend is deployed and seeded.

Live endpoint mapping:

| UI action                    | Django endpoint                      |
| ---------------------------- | ------------------------------------ |
| Pets list / add              | `GET/POST /api/pets/`                |
| Pet detail                   | `GET /api/pets/:id/`                 |
| Clinics                      | `GET /api/clinics/`                  |
| Services                     | `GET /api/services/`                 |
| Appointment list / create    | `GET/POST /api/appointments/`        |
| Cancel appointment           | `POST /api/appointments/:id/cancel/` |
| Login (API adapter prepared) | `POST /api/auth/login/`              |

## Deployment

1. In Vercel, import the GitHub repository `akoncore/frontend_developer` and select branch `main`.
2. Set **Root Directory** to `petcare-midterm_1` (the repository contains several separate apps). Select framework **Vite**, build command `npm run build`, and output directory `dist`.
3. Set `VITE_API_MODE=demo` or leave it unset. Vercel rewrites handle client-side SPA routing.
4. Test /pets, /pets/new, /pets/:id and /appointments directly using the public URL.

The demo deployment needs no custom backend or secrets. Its 120 synthetic initial pets are bundled with the frontend; changes are saved separately in each browser's localStorage. After deploying, submit the production `https://…vercel.app` URL from Vercel's project dashboard. Subsequent pushes to `main` automatically redeploy when the GitHub integration is connected.

Alternative: Netlify build `npm run build`, publish `dist`, and add an SPA redirect.

## Project structure

```text
src/
  api/          demoApi.js + real backend adapter
  components/   UI building blocks
  context/      reusable feedback/toast
  data/         120-record seed + clinic/service data
  pages/        route screens
  hooks.js      async data and filtering hooks
  main.jsx      render tree and routes
  styles.css    theme, desktop and mobile CSS
```

## Defense cheat sheet

- **Render tree:** BrowserRouter → ToastProvider → Routes → Layout → route page → reusable components.
- **State location:** search/filter/page live in Pets; booking modal/form live in Appointments; toast lives in ToastProvider; fetched data lives in `useApiList`.
- **Data flow:** the page fetches data via API, passes each pet down to PetCard/PetAvatar via props.
- **Controlled form:** all form values come from `useState`, updated using `onChange` and object spread (immutable state).
- **Async state:** effects fetch data, set loading and errors, and cancel stale work on unmount or dependency changes.
- **Re-render:** setState updates search, inputs, data or filters; React re-renders and reconciles by stable pet ID.
- **Identity:** changing pet detail route changes `id` in effect dependency; a new pet is fetched, and outdated responses cannot overwrite the new state.
- **Filtering order:** filter/search → sort → paginate, so results and page counts stay correct.
- **Batching/snapshots:** an event handler sees state from its current render; functional updates `v => v + 1` avoid stale-counter updates.
- **Render vs commit:** render calculates JSX; commit applies DOM changes; effects run after render commits.

## Notes

This is a midterm frontend MVP, not a production medical records application. The demo dataset is synthetic. The demo represents 120 pets in a shared illustrative catalog (not 120 real pets belonging to the logged-in user). Backend authentication UI and role-based dashboards can be added after the layout is approved.

## Local photos

Six user-supplied photographs are bundled in `src/assets/`; no remote image service is required. Clinic and service pictures are illustrative. Demo dog profiles reuse three sample dog photos; cats, rabbits and birds use species icons until a profile photo is supplied. `PetAvatar` prefers the `photo` model field and falls back to a species icon if an image fails.
