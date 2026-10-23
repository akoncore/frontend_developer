# PetCare — React Practice 4

Live application: [petcare-practice-4.vercel.app](https://petcare-practice-4.vercel.app/)

A responsive React/Vite pet dashboard using a simulated asynchronous API inspired by [leravanna/fake-api](https://github.com/leravanna/fake-api). Similar mechanics are adapted to the existing pet domain rather than copying the starter UI.

## Run

```sh
npm ci
npm run dev
npm run build
node --test tests/api.test.js
```

## Features and implementation

- 120 synthetic initial pets. The API stores changes under `petcare-practice-4-v2` in localStorage, separately in each browser.
- Promise requests take a random 300–1800 ms and have a 5% simulated failure chance. Configure these values in `src/api/settings.js`. Failed requests do not write data; retry buttons keep failures recoverable.
- Create pets, select a card to asynchronously load full details, edit, remove with confirmation, and complete/reopen a checkup through the API. Removing a pet removes their related appointments.
- Details show name, species, breed, gender, size, birthday, weight, coat color, allergies, notes, care status and updated time. Care-only fields are omitted from list summaries and loaded separately.
- Lists and details load in useEffect. Dependencies include the selected ID and reload version where applicable. Cleanup aborts timers and guards against stale results. Rendering checks the result ID against the current route.
- Mutations capture the selected ID, use a synchronous ref lock against duplicate/conflicting submissions, disable controls, and abort on selection change or unmount. Results only update the captured item. The API reads storage after the delay, immediately before writing, avoiding stale snapshot overwrites.
- Loading, retryable errors, empty searches and success notifications; Reload list and Reload details buttons.
- Search/filter, sort, then paginate with 12 records per page. Responsive existing PetCare styling is preserved.

## Deployment

Import `akoncore/frontend_developer` into Vercel, select root directory `react_practice_4`, framework Vite, build `npm run build`, output `dist`. Leave `VITE_API_MODE` unset for the fully standalone simulated API. SPA rewrites support direct detail links. No backend is required for demo mode.

## Verification

API tests cover initial records, summary/detail separation, CRUD persistence, simultaneous field updates, cancelled writes, and simulated failures without writes. For manual race testing, quickly open one pet then another while loading; only the final selection may appear. Start a checkup action and navigate away: the pending action is cancelled. Test errors by temporarily setting errorChance to 1, then restore 0.05. Use an unmatched search to inspect the empty state.

