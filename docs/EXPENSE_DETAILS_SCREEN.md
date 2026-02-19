# ExpenseDetails Screen — Do We Need It & What to Display

## Do we need ExpenseDetails?

**Yes.** The app already navigates to **ExpenseDetails** in two places:

1. **ExpenseScreen** — when user taps an expense: `navigation.navigate("ExpenseDetails", { expense })`
2. **ExpenseBoardDetailsScreen** — when user taps an expense: `navigation.navigate("ExpenseDetails", { expenseId: expense.id })`

There is **no ExpenseDetails screen** registered in `App.js`, so that navigation currently goes to a missing route. Adding the screen will fix the flow and give users a proper detail view.

---

## What we can display

Use the expense fields you already have (from `expenses` table and joined data). Suggested layout:

### 1. Header / Hero

- **Amount** — large, prominent (e.g. `formatCurrency(expense.amount)`)
- **Category** — name + icon + color chip (same as list)
- **Description** — if present; otherwise show “No description” or hide the row

### 2. Main details (card or list)

| Label        | Value / source                          |
|-------------|------------------------------------------|
| **Date**    | `expense.date` or `expense.created_at`   |
| **Board**   | `expense.board` or `expense.expense_boards?.name` |
| **Payment method** | `expense.payment_method` (e.g. Cash, UPI, Card) |
| **Added by** | `expense.created_by_profile?.full_name` (for shared boards) |
| **Created** | Formatted `expense.created_at` (e.g. “Jan 15, 2025 at 3:30 PM”) |

### 3. Optional (if you have the data)

- **Updated at** — if `expenses.updated_at` exists
- **Notes** — if you add a notes field later
- **Receipt / attachment** — if you add receipt storage later

### 4. Actions (bottom or header)

- **Edit** — navigate to AddExpense (or an edit screen) with `expenseId` / `expense` so the form is pre-filled and saves an update.
- **Delete** — confirm dialog, then call `expenseService.deleteExpense(expense.id)`, send delete notification, go back and refresh list (same pattern as in ExpenseScreen).

---

## Data source

- **From list (ExpenseScreen):** You already pass `{ expense }`, so you can show details without an extra API call. For consistency and to support “open by expenseId” (e.g. from ExpenseBoardDetailsScreen or deep link), you can still call **`expenseService.getExpenseById(expenseId)`** when only `expenseId` is in params.
- **Note:** `getExpenseById` currently filters by `created_by = user.id`. For shared boards, expenses added by others won’t be returned. If you want to show any expense on a board the user can access, you’ll need a method like `getExpenseByIdForBoard(expenseId)` that checks board access (e.g. via `shared_users` or board membership) instead of only `created_by`.

---

## Summary

| Question | Answer |
|----------|--------|
| **Do we need ExpenseDetails?** | Yes — navigation already targets it and the screen is missing. |
| **What to display?** | Amount, category, description, date, board, payment method, “Added by”, created time; actions: Edit, Delete. |
| **Data** | Use passed `expense` when available; otherwise fetch with `getExpenseById(expenseId)`. Consider relaxing access for shared-board expenses. |

Implementing this screen will fix the broken navigation and give users a clear, editable detail view for each expense.
