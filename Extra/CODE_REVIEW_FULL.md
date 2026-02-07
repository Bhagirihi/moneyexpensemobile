# Trivense (TripExpanse) – Full Code Review

## 1. Project overview

**Trivense** is an Expo/React Native expense-tracking app with:

- **Auth**: Supabase (email/password, session, profile)
- **Data**: Expense boards, expenses, categories, shared users, notifications
- **Features**: Dashboard, boards, analytics, notifications, theme (light/dark), settings (currency, language, 2FA, referral)

**Stack:** React 19, React Native 0.79, Expo 53, Supabase, React Navigation (native stack).

---

## 2. Architecture summary

| Layer        | Location              | Purpose                                      |
|-------------|------------------------|----------------------------------------------|
| Entry       | `App.js`               | Providers, fonts, splash, auth gate, stack   |
| Context     | `src/context/`         | Auth, Theme, AppSettings                     |
| Config      | `src/config/supabase.js` | Supabase client + auth/profile helpers    |
| Navigation  | `App.js` (inline Stack) | Session-based routes (no separate navigator) |
| Screens     | `src/screens/`          | Dashboard, Expense, Boards, Settings, etc.   |
| Components  | `src/components/`      | Header, lists, modals, ThemeToggle, etc.     |
| Services    | `src/services/`        | Expenses, boards, dashboard, notifications, realtime |
| Fetcher     | `src/fetcher/`         | `fetchDashboardData()` used by Dashboard     |
| Utils       | `src/utils/`           | Toast, formatters                            |
| Theme       | `src/theme/`           | Theme definitions                             |

**Unused / legacy:** `src/navigation/AppNavigator.js` references `SplashScreen`, which doesn’t exist, and isn’t used by `App.js`.

---

## 3. What’s working well

- Clear split between **screens**, **services**, and **context**.
- **ThemeContext** and **AppSettingsContext** are simple and focused.
- **Services** (e.g. `expenseService`, `expenseBoardService`) centralize Supabase calls and error handling.
- **Real-time** via `realTimeSync` for expenses, boards, categories, notifications, profiles, shared_users.
- **Push notifications** (registration, foreground/background handlers) are wired in.
- Reusable **common** components (FormInput, FormButton, Card, etc.).
- **Dashboard** uses a dedicated fetcher and refresh.

---

## 4. Critical bugs (fix first)

### 4.1 `src/config/supabase.js` – missing `showToast` import

`updateUserProfile` calls `showToast.success(...)` but `showToast` is never imported. This will throw at runtime when a user updates their profile.

**Fix:** Add: `import { showToast } from "../utils/toast";`

---

### 4.2 `src/fetcher/index.js` – missing `showToast` import

`showToast.error("Failed to load dashboard data")` is used in the `catch` block but `showToast` is not imported. Dashboard errors will throw instead of showing a toast.

**Fix:** Add: `import { showToast } from "../utils/toast";`

---

### 4.3 `src/screens/DashboardScreen.js` – undefined `fetchUserProfile` on refresh

`onRefresh` calls `fetchUserProfile()` but only `loadProfile` is defined. Pull-to-refresh will throw.

**Fix:** Either rename `loadProfile` to `fetchUserProfile` and use it in `onRefresh`, or call `loadProfile` in `onRefresh` (and ensure it’s in scope / stable with `useCallback` if needed).

---

### 4.4 `src/screens/SettingsScreen.js` – `invitees` is a number, UI expects an array

- `fetchInvitees` sets `setInvitees(count)` (number from `count: "exact"`).
- `renderInvitees` uses `invitees.length`, `invitees.map(...)`, and `invitee.userName`, etc., so it expects an **array** of invitee objects.
- Opening the Invitees modal will crash when calling `.map` on a number.

**Fix:** Keep a separate state for the **list** of invitees (e.g. `inviteesList`) and use it in the modal. Use `invitees` (count) only for the subtitle like “X Invited”. In `fetchInvitees`, fetch the rows (with the fields you need), set the list state, and set the count from `data.length` or from the same query’s count.

---

### 4.5 `src/services/realTimeSync.js` – cleanup doesn’t unsubscribe

The function returns a cleanup that only logs. It never calls `supabase.removeChannel(channel)`, so the channel stays subscribed and can cause leaks and duplicate handlers.

**Fix:** In the returned cleanup, call `supabase.removeChannel(channel)` (and keep the log if you want).

---

### 4.6 `App.js` – session and auth flow

- **Duplicate providers:** `ThemeProvider` / `AuthProvider` / `AppSettingsProvider` are wrapped **twice** (in `App` and again in `AppContent`). The inner wrap in `AppContent` is the one that matters for navigation; the outer in `App` is redundant for the same tree.
- **Two sources of session:** `AppContent` keeps its own `session` with `supabase.auth.onAuthStateChange` and uses it to switch between protected/public stacks. `AuthContext` also subscribes to auth and exposes `session`/`user`. So session is maintained in two places; if they ever get out of sync, you can get inconsistent UI (e.g. logged in in one place, logged out in another).
- **`prepare()` runs for everyone:** On every cold start, `prepare()` runs and, when there is a session, it:
  - Updates `profiles.updated_at`
  - Shows toasts: “User session not found” when there’s no session, and “Updated at” + timestamp when there is.
  So every app open for a logged-in user shows an “Updated at” toast, which is noisy and not useful.

**Recommendation:**

- Use **one** source of truth for session: e.g. only `AuthContext`. In `App.js`, render the stack based on `useAuth().session` (and handle `loading` so you don’t flash the wrong stack).
- Run profile/session “heartbeat” or `updated_at` logic only when needed (e.g. after login or in a dedicated place), and avoid toasting “Updated at” on every launch.
- Remove the duplicate outer provider wrap in `App` so you have a single, clear provider tree.

---

### 4.7 `App.js` – `prepare()` when there is no session

If there’s no session, `prepare()` still calls `showToast.error("User session not found.")` on every app open for logged-out users. That’s a bad first-time and returning-user experience.

**Fix:** Only show that toast when you explicitly tried to restore a session and it failed (e.g. after checking stored session), not on every cold start when the user is simply not logged in.

---

### 4.8 Clipboard in `SettingsScreen` – wrong API

`Clipboard` is imported from `react-native`. React Native’s built-in `Clipboard` has `setString(value)` (sync), not `setStringAsync`. So `await Clipboard.setStringAsync(referralCode)` can fail or be undefined.

**Fix:** Use `expo-clipboard` and `await Clipboard.setStringAsync(referralCode)`, or use React Native’s `Clipboard.setString(referralCode)` (no await). Prefer one Clipboard API (Expo or RN) across the app.

---

## 5. Other improvements

### 5.1 App entry and providers

- Remove duplicate provider nesting in `App.js` and rely on `AuthContext` for session so navigation and “logged in” state stay in sync.
- Consider moving the Stack and screen list into a separate component or `AppNavigator.js` and importing it in `App.js` to keep `App.js` smaller and easier to read.

### 5.2 Console and debug

- Remove or guard `console.log` in production (e.g. “Session is ==> onAuthStateChange”, “theme.background”, “📥” in realtime, “✅ Subscribed to realtime”, “data” in dashboard). Use a small logger that no-ops in production if you want to keep some logs in dev.

### 5.3 Dashboard

- **Test notification block:** `renderNotificationTestButtons()` is a large block of test buttons. Consider moving to a dev-only screen or behind a feature flag so the main dashboard stays clean for users.
- **Budget notifications:** `memoizedCalculateMonthlyStats` sends multiple over-budget notifications (e.g. at 50%, 70%, 90%, 100%). You may want to send one per “threshold crossed” per period (e.g. per day or per month) to avoid spam.
- **Loading state:** Initial `loading` is `false`, so the loading animation block may never show. Confirm whether you want a short loading state on first load and set `loading` accordingly.

### 5.4 Supabase config

- **Connection check:** `checkSupabaseConnection` uses `.select("count")` on `profiles`. If “count” isn’t a column, the query may fail. Prefer something like `.select("*").limit(1)` to only check connectivity.
- **RLS:** Ensure Row Level Security is enabled and tested for all tables (expenses, expense_boards, profiles, shared_users, notifications) so users only see their own or shared data.

### 5.5 SettingsScreen

- **`renderBoardDetails`:** Inside `.map()` you call `setSharedMemberCount(members)`. Setting state during render is a side effect and can cause extra renders or bugs. Prefer computing per-board member count inside render (e.g. `sharedMembers?.filter(...).length`) without setState.
- **Invitees:** As above, fix the invitees state (list vs count) and the Clipboard API.

### 5.6 Expense service

- **getExpenses:** The query uses `.in("board_id", boardIds)` and `.in("created_by", createdByIds)` in comments but they’re commented out, so the list might not be scoped to the user’s boards. Re-enable or replace with the correct filters so users only see their (and shared) data.

### 5.7 Fetcher

- **`finally { return dashboard }`:** The `catch` block already `return dashboard`, and the `try` block returns the dashboard. The `finally` return is redundant; you can remove it to avoid confusion.

### 5.8 Navigation

- Either remove `AppNavigator.js` or fix it (e.g. remove or add `SplashScreen`) and use it from `App.js` so you don’t have two different navigation setups.

### 5.9 Theme / context

- **ThemeContext:** `loadThemePreference` is defined inside the component and used in `useEffect`; it doesn’t need to be in the dependency array if it’s only for initial load. No bug, but you could move it outside or wrap in `useCallback` if you ever call it from elsewhere.
- **AuthContext:** Renders `{!loading && children}`, so during loading nothing is rendered. Ensure there’s a splash or loading screen above so the user doesn’t see a blank screen; `App.js` already hides splash when `appIsReady` is true, but auth loading can still happen after that.

### 5.10 Accessibility and i18n

- Add `accessibilityLabel` / `accessibilityRole` on important controls (buttons, inputs, tabs).
- Language is stored in context and AsyncStorage, but screens still use hardcoded English strings. For real i18n, introduce a small i18n layer (e.g. keys + translation files) and use it in Settings and across the app.

---

## 6. Security and env

- **Secrets:** Supabase URL and anon key come from `process.env.EXPO_PUBLIC_*`. Ensure `.env` is in `.gitignore` and not committed; use EAS or your CI to set env in builds.
- **Auth:** Session is persisted via AsyncStorage in Supabase client; ensure the app handles token refresh and logout (clearing session) correctly. Supabase’s `signOut` should clear local session.

---

## 7. Testing and quality

- No tests were found in the repo. Adding even a few tests for:
  - Auth flow (mock Supabase)
  - Expense/board services (mock Supabase)
  - Formatters and utils
  will help refactors and prevent regressions.
- Consider ESLint + a React/React Native config to catch missing deps, unused vars, and consistent style.

---

## 8. Summary table

| Area           | Severity   | Action |
|----------------|------------|--------|
| supabase.js    | Critical   | Import `showToast` in `updateUserProfile` |
| fetcher/index.js | Critical | Import `showToast` |
| DashboardScreen | Critical | Fix refresh: use `loadProfile` or `fetchUserProfile` |
| SettingsScreen | Critical | Invitees: use list + count state; fix Clipboard API |
| realTimeSync   | Critical   | Call `supabase.removeChannel(channel)` in cleanup |
| App.js         | High       | Single auth source (AuthContext); no duplicate providers; no “Updated at” toast on launch; no “session not found” toast for normal logged-out state |
| Dashboard      | Medium     | Dev-only or flag for test notifications; review budget notification frequency |
| expenseService | Medium     | Re-enable or fix board_id/created_by filters in getExpenses |
| AppNavigator   | Low        | Remove or fix and use from App.js |
| Logging        | Low        | Remove or guard console.log in production |

---

## 9. Suggested order of work

1. Fix the 5 critical code bugs (supabase toast, fetcher toast, Dashboard refresh, Settings invitees + Clipboard, realTimeSync cleanup).
2. Simplify `App.js`: single provider tree, use AuthContext for session, soften or remove startup toasts.
3. Harden Supabase (connection check query, RLS, expense query filters).
4. Clean up Dashboard (test buttons, loading state, budget notifications).
5. Add minimal tests and lint, then iterate on i18n and accessibility.

If you want, the next step can be concrete patches for the critical bugs (file-by-file diffs or exact code changes).
