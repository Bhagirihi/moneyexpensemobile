# Analytics vs Analysis Screens

## What each screen does

### AnalyticsScreen (`src/screens/AnalyticsScreen.js`)

**Purpose:** **Personal spending overview** across your expenses (all boards you have access to).

- **Where it’s opened:** Bottom tab bar → **Analytics** (in `FooterTab.js`).
- **What it shows:**
  - **Time period:** Week / Month / Year / All time (dropdown).
  - **Total expenses** and **average per day** for that period.
  - **Trend:** % change vs previous period (e.g. “X% more/less than last month”).
  - **Stats:** Highest single expense, lowest, total transaction count.
  - **Top categories** (e.g. Food, Transport) with amounts/percentages.
  - **Insights:** e.g. “Spending increased/decreased”, “Top category”, “Savings opportunity”.
- **Data source:** `analyticsService.fetchExpenseTrends(userId, period)` — uses expenses from all boards the user owns or is shared with.

---

### AnalysisScreen (`src/screens/AnalysisScreen.js`)

**Purpose:** **Per–expense-board (trip) breakdown** for a single board: budget vs spent, per-person spending, and who owes whom.

- **Where it’s opened:** **Expense Board Details** → **Analysis** button (passes `boardId` in `ExpenseBoardDetailsScreen.js`).
- **What it shows:**
  - **Trip selector:** Switch between your boards (same list as “trips”).
  - **Trip summary:** Total expense, total budget, per-person budget, status (Under/Over budget).
  - **Per-person spending:** Each participant’s share and % of total.
  - **Payment settlements:** “Who needs to pay whom” and amounts.
- **Data source:** `expenseBoardService.getExpenseBoardsByID(boardId)` — one board at a time.

---

## How to test

### Analytics (personal overview)

1. Log in.
2. Add some expenses (any board) so there is data.
3. Open the **Analytics** tab from the bottom bar.
4. You should see total expenses, trend, stats, top categories, and insights.
5. Change the period (e.g. This week → This month) and confirm numbers/insights update.

### Analysis (per-board / trip)

1. Log in.
2. Go to **Expense Board** (or Boards) and open **one board** (tap it).
3. On the board details screen, tap the **Analysis** button (chart icon).
4. You should see:
   - Trip summary (expense, budget, per person, status).
   - Per-person spending (if the board has participants).
   - Settlements (who pays whom).
5. Use **Selected Trip** at the top to switch to another board and confirm data changes.

**Note:** Analysis expects a `boardId`. It’s only reachable from **Expense Board Details** with a valid `boardId`. If you open it without `boardId` (e.g. direct deep link), the screen should handle that safely (see improvements below).

---

## Suggested improvements

| Area | Issue | Suggestion |
|------|--------|------------|
| **AnalysisScreen** | `route.params` may be undefined → crash on `route.params.boardId`. | Guard: `const boardId = route.params?.boardId;` and show an error/back state if missing. |
| **AnalysisScreen** | `participants` or `settlements` from API can be undefined → `.map` crash. | Default in state: `participants: data.participants ?? []`, `settlements: data.settlements ?? []`. |
| **AnalysisScreen** | Hardcoded strings (“Selected Trip”, “Trip Summary”, etc.). | Use `useTranslation` and locale keys for i18n. |
| **AnalysisScreen** | `console.log` left in. | Remove or replace with proper logging. |
| **AnalyticsScreen** | `useEffect` calls `fetchAnalytics(user.id, selectedPeriod)` but the *local* `fetchAnalytics` takes no args; dependency array omits `fetchAnalytics`. | Call `fetchAnalytics()` (no args) and add `fetchAnalytics` to the effect dependency array. |
| **AnalyticsScreen** | Period modal uses hardcoded `#FFFFFF` background. | Use `theme.card` (or similar) so it respects dark mode. |
| **AnalyticsScreen** | Empty state: when user has no expenses, insights may reference “top 3 categories” that don’t exist. | Guard `categoryBreakdown[0]`, `[1]`, `[2]` before using in insight text to avoid “undefined” in copy. |
| **Both** | No pull-to-refresh. | Add RefreshControl to refetch data on pull. |

The doc and code fixes below implement the critical fixes (boardId guard, participants/settlements defaults, Analytics useEffect and modal theme).

---

## What we still need to improve

| Priority | Area | What to do |
|----------|------|------------|
| **High** | **AnalyticsScreen – error state** | On fetch failure, show a message (e.g. "Couldn't load analytics") and a Retry button instead of leaving the user on a blank or stale screen. |
| **High** | **Pull-to-refresh (both screens)** | Add `RefreshControl` to `ScrollView` so users can pull to refetch Analytics and Analysis data (same pattern as Dashboard, ExpenseScreen, ExpenseBoardDetails). |
| **Medium** | **AnalysisScreen – i18n** | Replace hardcoded strings ("Selected Trip", "Trip Summary", "Payment Settlements", "Who needs to pay whom", "All payments are settled!", etc.) with `useTranslation()` and locale keys. |
| **Medium** | **AnalysisScreen – logging** | Remove `console.log("formattedBoards", formattedBoards)` (or use a proper logger behind a flag). |
| **Low** | **analyticsService.fetchAnalytics** | The query for `expense_boards` returns an array but the code uses `expenseBoard.id`; use the first board (e.g. `expenseBoard[0]?.id`) or filter so the service works if ever used. |
| **Low** | **AnalyticsScreen – empty copy** | Consider translating "No expense data available for this period" and "Select Period" via `t()`. |
