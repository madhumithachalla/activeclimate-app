# ActiveClimate Melbourne

A web application for a not-for-profit that connects Melburnians to community sport and
active-travel groups, and turns the trips they log into a measured cut in transport emissions.

Built for FIT5032 by Madhumitha Challa (35363584) — A1.2 covered Business Requirements A and B,
A1.3 adds Business Requirements C.

## Running it

```bash
npm install
npm run dev
```

Then open http://localhost:5173. `npm run build` produces a production bundle in `dist/`.

The app is entirely client-side, as the A1.3 brief allows. Accounts, activities and ratings are
persisted in `localStorage`; there is no server and no Firebase.

## Demo accounts

Seeded automatically on a first visit, and listed on the sign-in page.

| Role | Email | Password |
| --- | --- | --- |
| NFP Coordinator (admin) | `coordinator@activeclimate.org` | `Climate2026` |
| Community Member | `vaish@activeclimate.org` | `Cycling2026` |
| Community Member | `jordan@activeclimate.org` | `Running2026` |

The member accounts arrive with a month of logged trips and ratings, so the dashboard and the
aggregated scores show real values straight away. Seeding is skipped once any real account or
activity exists, so it never overwrites your own data.

## Business requirements

| BR | Where it lives |
| --- | --- |
| A.1 Vue 3 + Composition API | Every component uses `<script setup>` |
| A.2 Responsiveness | Grids reflow to one column; the nav collapses to a toggle below 820px |
| B.1 Validations | `src/utils/validators.js` — format, strength, cross-field, range, length |
| B.2 Dynamic data | `src/services/activityLog.js`, `src/services/ratings.js` |
| C.1 Authentication | `src/services/auth.js`, `LoginView.vue`, `RegisterView.vue` |
| C.2 Role-based authentication | `src/router/index.js`, `src/views/AdminView.vue` |
| C.3 Rating | `src/services/ratings.js`, `src/components/ActivityRatingPanel.vue` |
| C.4 Security | `src/utils/sanitize.js`, `src/services/storage.js`, and the auth service |

## Structure

```
src/
  components/   NavBar, StarRating, ActivityRatingPanel, ActivityForm, Dashboard
  views/        One per route, including the coordinator-only AdminView
  router/       Routes plus the guard that enforces authentication and roles
  services/     auth, ratings, activityLog, storage, theme, units, demoData
  utils/        sanitize, validators
  data/         The four activity groups the app renders from
```

## Notes on a few decisions

**Authorisation is enforced in the router, not the navigation bar.** Hiding the Admin link from
members is a convenience; the `beforeEach` guard is the actual control, so typing `/admin` as a
member lands on the access-denied page.

**Passwords are hashed even though this is client-side.** Each account gets a random salt and a
PBKDF2-SHA256 hash at 150,000 iterations via the Web Crypto API. A browser-only app cannot offer
real confidentiality, but a shared laptop is exactly the case this protects against.

**Distances are stored in kilometres and converted only for display.** The km/miles switch in the
nav bar never rewrites stored data, so switching back and forth cannot accumulate rounding error.

**The theme keeps one green palette.** Light and dark share identical greens for the header, hero,
buttons and footer — only the neutral surfaces and text invert. The single exception is green text
on a page surface, which moves to the palette's lighter `#45a049` in dark mode because the darker
green fails contrast against a near-black background.
