# Folio — Redux Toolkit homework

The existing blog, Firebase authentication, dashboard, filters and Community CRUD are preserved. Folio now includes an installable manifest, a manually implemented Service Worker, offline public data, safe version updates and responsive navigation.

**Подробное объяснение на русском с полным путём запроса:** [PWA_GUIDE_RU.md](PWA_GUIDE_RU.md).

## Redux: алдымен теория / сначала теория

**Басты тапсырма:** дайын React қосымшасын Redux Toolkit-ке көшіру. Жаңа сайтты нөлден жасау қажет емес. Авторизация, routing, CRUD, іздеу, фильтр, pagination және PWA жұмысын сақтау керек.

React экранды салады. Redux ортақ мәліметтің қайда сақталатынын және қалай өзгеретінін басқарады. Redux Toolkit (RTK) — Redux-пен жұмыс істеуге арналған ресми құралдар. `react-redux` React компоненттерін store-мен байланыстырады.

| Термин   | Мағынасы                                          | Осы жобада                                                             |
| -------- | ------------------------------------------------- | ---------------------------------------------------------------------- |
| state    | Қазіргі мәлімет / текущее состояние               | Посттар, сұрау күйі, сақталған ID-лер                                  |
| store    | Ортақ state қоймасы                               | `src/store/index.ts`                                                   |
| slice    | Бір функцияға қатысты state пен өзгерту ережелері | `posts`, `community`, `reading`                                        |
| action   | Не болғанын сипаттайтын объект                    | `{ type: 'reading/toggleSaved', payload: { reader: 'guest', id: 1 } }` |
| payload  | Action алып келген мәлімет                        | Пост ID-сі немесе API жауабы                                           |
| dispatch | Action/thunk-ті іске жіберу                       | `dispatch(fetchPosts())`                                               |
| reducer  | State-ті action негізінде жаңарту ережесі         | `readingSlice.reducers.toggleSaved`                                    |
| selector | State-тен керегін оқу/есептеу                     | `selectSavedCount`                                                     |
| thunk    | Асинхронды жұмыс: API күту, action жіберу         | `writeCommunity`                                                       |
| Provider | Компоненттерге store-ді қолжетімді етеді          | `main.tsx`                                                             |

`useState` бір компоненттің уақытша жағдайына жақсы: input, ашық menu, редакциялау формасы. Redux бірнеше компонентке керек мәліметке қолданылады. Firebase сессиясы `AuthContext` ішінде қалады: тапсырма оған рұқсат береді. Firebase `User`, Promise, AbortController немесе DOM event Redux state-іне салынбайды.

## 1. Store және Provider

`src/store/index.ts` үш reducer-ді біріктіреді:

```ts
export const createAppStore = () =>
  configureStore({
    reducer: {
      posts: postsSlice.reducer,
      community: communitySlice.reducer,
      reading: readingSlice.reducer,
    },
  });
export const store = createAppStore();
```

Нәтижесінде state пішіні: `{ posts: ..., community: ..., reading: ... }`.

`main.tsx`:

```tsx
<Provider store={store}>
  <AuthProvider>
    <App />
  </AuthProvider>
</Provider>
```

Provider state-ті өзі өзгертпейді. Ол store-ді React ағашына береді. `useAppDispatch` және `useAppSelector` — TypeScript типтері берілген `useDispatch`/`useSelector` нұсқалары (`store/hooks.ts`).

## 2. Синхронды практика: постты сақтау

`SaveStoryButton.tsx` карточкада және толық постта бірдей қолданылады:

```tsx
const saved = useAppSelector((state) =>
  selectSavedIds(state, uid).includes(id),
);
const dispatch = useAppDispatch();
// Батырма басылғанда:
dispatch(toggleSaved({ reader: readerKey(uid), id }));
```

1. `toggleSaved(...)` action объектісін жасайды.
2. `dispatch(...)` оны store-ге береді.
3. `readingSlice` ID бар болса алып тастайды, жоқ болса қосады.
4. `useAppSelector` жаңа мәнді байқайды.
5. Батырма мәтіні және `/posts` бетіндегі saved counter жаңарады.

`readingSlice.ts` ішіндегі `ids.push(id)` сияқты жазу Immer draft ішінде орындалады. RTK оны immutable жаңартуға айналдырады. Компонентте `store.getState().reading...push(...)` деп тікелей өзгертуге болмайды.

Бұл bookmark — осы ашық бет сессиясының белгісі. F5 кезінде жойылады; басқа аккаунт өз ID тізімін көреді. Ол мақаланы офлайнға жүктеу командасы емес: офлайн көшірмені Service Worker басқарады.

## 3. Асинхронды практика: посттарды жүктеу

`useAllPosts()` ашылғанда `dispatch(fetchPosts())` шақырылады. `fetchPosts` → `getAllPosts(signal)` → `fetchPublicJSON('/data/posts.json', signal)`.

```ts
export const fetchPosts = createAsyncThunk(
  'posts/fetchList',
  async (_: boolean | undefined, { signal }) => ({
    posts: await getAllPosts(signal),
    at: Date.now(),
  }),
  // Нақты файлда condition қайталанатын/әлі жаңа сұрауларды тоқтатады.
);
```

Thunk автоматты түрде үш action түрін береді:

| Кезең     | Қашан             | UI                                                                 |
| --------- | ----------------- | ------------------------------------------------------------------ |
| pending   | Сұрау басталды    | Loading                                                            |
| fulfilled | Жауап сәтті келді | Посттар немесе empty state                                         |
| rejected  | Қате/abort        | Қате және retry; abort кәдімгі сервер қатесі ретінде көрсетілмейді |

`postsSlice.extraReducers` осы action-дарды өңдейді. Нақты кодтан:

```ts
.addCase(fetchPosts.fulfilled, (state, action) => {
  if (state.list.requestId !== action.meta.requestId) return;
  state.ids = action.payload.posts.map((post) => post.id);
  for (const post of action.payload.posts) state.entities[post.id] = post;
  state.list.status = 'succeeded';
  state.list.updatedAt = action.payload.at;
})
```

`requestId` — нақты сұраудың бірегей нөмірі. Ескі сұрау кеш аяқталса, оның жауабы жаңа мәліметті ауыстырмауы керек. Community-де mutation-нан кейінгі refresh осы қорғанысты қолданады.

`fetchPost({ id })` толық постты алады. Егер журнал тізімі әлі fresh болса, сол entity қайта қолданылады; жаңа HTTP сұрау қажет емес. ID бойынша request state бөлек сақталады, сондықтан басқа пост жауабы қазіргі бетке қате көрсетілмейді.

## 4. CRUD: компоненттен серверге және кері

```text
Community form
  → useCommunity.save.mutate({ input, id })
  → dispatch(writeCommunity({ uid, operation: 'save', input, id }))
  → communityService.saveCommunityPost()
  → POST (жаңа) немесе PATCH (бар пост)
  → аккаунттың session overlay-ін жаңарту
  → dispatch(fetchCommunity({ uid, force: true }))
  → жаңа тізім Redux state-іне
  → useAppSelector → экран жаңарады
```

Өшіру үшін сол thunk `operation: 'delete'` арқылы DELETE орындайды. Жазу кезінде батырмалар disabled; сервер қатесі формада көрсетіледі. `.unwrap()` rejected action-ды rejected Promise-ке айналдырады: форма тек сәтті жазудан кейін тазарады. Hook қате Promise-ті ұстайды, қате мәтіні Redux-тен UI-ға келеді.

JSONPlaceholder жазуды тұрақты сақтамайды. Бұрынғы жобадағыдай өзгерістер аккаунтқа бөлінген service overlay-де осы браузер сессиясында ғана сақталады; F5 оларды жояды. Redux бұл API-ді тұрақты дерекқорға айналдырмайды.

## 5. Selectors, іздеу және URL

| Selector                    | Не қайтарады                                 | Memoized?                           |
| --------------------------- | -------------------------------------------- | ----------------------------------- |
| `selectPostsRequest`        | loading/error/request күйі                   | Жоқ, дайын объект                   |
| `selectAllPosts`            | ID-лерден посттар массиві                    | `createSelector`                    |
| `makeSelectFilteredPosts()` | Ізделген, сұрыпталған, бетке бөлінген нәтиже | `createSelector`, әр hook үшін жеке |
| `selectSavedIds`            | Reader сақтаған ID-лер                       | Жоқ                                 |
| `selectSavedCount`          | Сақталған ID саны                            | `createSelector`                    |

Memoization: кіріс мәліметтері өзгермесе, есептеу қайта орындалмайды және алдыңғы нәтиженің reference-і қайтарылады. `useMemo` Posts-та filters объектісін тұрақтандырады.

`?search=design&category=design&page=2` сияқты параметрлер URL-де қалады. `useSearchParams` оларды оқиды. Search мәтіні 300 ms debounce-тен өтеді. Selector бір жүктелген тізімнен search/category/status/sort/page бойынша нәтиже есептейді. URL параметрлерін Redux-қа екінші рет көшірмейміз. Сондықтан Back/Forward және сілтемені бөлісу жұмыс істейді.

## 6. PWA және Redux бірге қалай жұмыс істейді?

```text
React → thunk → API service → fetch → Service Worker
                                      ├─ online: HTTP + public cache
                                      └─ offline: бұрынғы public cache
              ← fulfilled ← JSON жауабы
Redux store → selector → React
```

Redux — жедел жады: reload кезінде қайта құрылады. Service Worker Cache Storage — дискідегі офлайн public ресурстар. Желі жоқ кезде де thunk fetch-ті орындайды, Worker saved response қайтара алады. Офлайн кэш жоқ болса, `Offline` беті шығады. Қайта қосылғанда `useRefresh` force refresh шақырады. `PwaStatus`, `Offline` және алғашқы SW activation ескі Query invalidation орнына `store/refresh.ts` қолданады.

## Өзгерген файлдар / что изменилось

| Файлдар                                                       | Өзгеріс және себебі                                                                       |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `package.json`, lockfile                                      | RTK және react-redux қосылды; TanStack Query алынды                                       |
| `store/index.ts`, `hooks.ts`, `request.ts`                    | Store, typed hooks, ортақ request типі                                                    |
| `store/postsSlice.ts`                                         | Журнал тізімі, entity-лер және details thunks                                             |
| `store/communitySlice.ts`                                     | Community list/detail, CRUD thunk, account isolation және stale guard                     |
| `store/readingSlice.ts`                                       | Үшінші мағыналы feature: session bookmarks                                                |
| `store/selectors.ts`                                          | Қайта қолданылатын және memoized selectors                                                |
| `hooks/usePosts.ts`, `useCommunity.ts`                        | Query hooks орнына Redux dispatch/selectors                                               |
| `hooks/useDebouncedValue.ts`, `useRefresh.ts`                 | Debounce, mount/focus/reconnect refresh                                                   |
| `main.tsx`                                                    | Redux Provider                                                                            |
| `Posts`, `PostDetails`, `PostCard`, `SaveStoryButton`         | Debounce, retry, bookmark және counter                                                    |
| `Community`, `CommunityDetails`, `Dashboard`, `States`        | Redux read/error/retry байланысы                                                          |
| `services/blogService.ts`                                     | Pure `filterPosts` функциясы selector-ге қайта қолданылады                                |
| `services/communityService.ts`                                | Public detail API функциясы UI-дан service-ке көшірілді                                   |
| `store/refresh.ts`, `PwaStatus`, `Offline`, `pwa/register.ts` | PWA refresh Redux thunks арқылы                                                           |
| `services/queryClient.ts`                                     | Ескі Query cache конфигурациясы алынды                                                    |
| Unit/integration және E2E тесттер                             | Auth/CRUD регрессиясы, memoization, account isolation, retry, stale replies, URL және PWA |

## Өз қолыңмен тексеріп көр

1. `npm ci`, содан соң `npm run dev`.
2. `/posts`: search жаз; URL өзгеруін, debounce және нәтижені бақыла.
3. Category/status/sort өзгерт; Next бас; Back арқылы алдыңғы URL-ге қайт.
4. Бір карточкада **Save for this session** бас: counter 1 болады. Постты аш: батырма **Saved for this session** болады. Тағы бассаң, counter 0 болады.
5. Firebase аккаунтпен кіріп, `/community` бетінде create/edit/delete жаса. Басқа аккаунтқа ауысқанда оның жеке тізімі көрінеді.
6. Redux DevTools-та `posts/fetchList/pending`, `fulfilled`, `community/write/*`, `reading/toggleSaved` action-дарын қара.
7. `npm run build` және `npm run preview`: PWA тек production build-те тіркеледі. Онлайн ашып, содан кейін offline жасап reload орында.

Қорғауда айтуға болатын түсіндірме: «Мен ортақ деректерді Redux Toolkit store-іне көшірдім. Үш feature slice бар. Асинхронды API операциялары createAsyncThunk арқылы орындалады, extraReducers олардың үш күйін өңдейді. UI useSelector арқылы оқиды, useDispatch арқылы өзгеріс жібереді. URL фильтрлерін қайталамаймын, selectors нәтижені есептейді. AuthContext және Service Worker өз міндеттерін сақтайды».

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

Redux Toolkit owns the application data:

- `posts.entities` holds one copy of each journal post; `ids` defines the list.
- `posts.list` and `posts.details[id]` track asynchronous request state.
- `community.feeds[readerKey(uid)]` isolates each account's demo edits.
- `community.details[id]` holds the public API version (separate from session edits).
- `community.writes[readerKey(uid)]` tracks create/update/delete status.
- `reading.byReader` stores saved post IDs per reader, for this page session.
- Successful reads are fresh for 60 seconds. Thunk conditions deduplicate normal reads.
- Stale reads refresh on mount/focus; reconnect and manual retry force refresh.
- Successful mutations force a new account feed request. Request IDs ignore older responses.
- Failed writes preserve current data. A failed refresh after a successful write is a list error, so users retry reading rather than accidentally repeating the write.
- Thunks pass AbortSignal to read services; shared reads continue across navigation.
- Filters are derived locally from the one journal dataset, so search cannot trigger competing network requests.
- Public reads reach the Service Worker even offline. Redux memory and SW disk caches have separate responsibilities.

No UI component fetches an API or reads localStorage directly. Auth calls live
in `services/authService.ts`; data calls live in `services/*Service.ts`;
async operations and reducers live in `store/`; React subscriptions live in `hooks/`.

## Code organization and formatting

```text
src/
  components/  Reusable navigation, cards, states, route protection
  config/      Firebase initialization
  context/     AuthContext and AuthProvider
  hooks/       useAuth, data queries, mutations
  layouts/     Shared page shells
  pages/       Route screens
  services/    Authentication, HTTP and validation
  store/       Store, feature slices, async thunks and selectors
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
- [Redux Toolkit Quick Start](https://redux.js.org/tutorials/quick-start)
- [createAsyncThunk](https://redux-toolkit.js.org/api/createAsyncThunk)
- [Selectors](https://redux.js.org/usage/deriving-data-selectors)
- [JSONPlaceholder limitations](https://jsonplaceholder.typicode.com/)
