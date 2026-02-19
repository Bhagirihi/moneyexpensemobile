# Trivense — App Overview & Scope

## 1. What This App Is About

**Trivense** is a **personal and shared expense-tracking app** that helps individuals and groups (e.g. trips, roommates, events) track spending, manage budgets, and see who owes whom.

- **Core idea:** Record expenses, organize them by boards and categories, and—when used with others—share boards so everyone can add expenses and see totals and splits.
- **Target users:** Individuals who want to track daily spending and budgets; friends, families, or colleagues who share costs (trips, house expenses, outings) and need a simple way to log and split them.
- **Positioning:** “Smart expense tracking” with a focus on **sharing** and **collaboration**, plus multi-currency and localisation (e.g. English, Hindi) for a broad user base.

---

## 2. What This App Will Do

### 2.1 Authentication & Account

- **Sign up / Sign in** with email and password.
- **Email verification** after sign-up; unverified users are guided to verify or log out.
- **Sign in with Google** (OAuth).
- **Forgot password** (reset via email).
- **Profile:** Edit name, mobile, avatar; view member-since and last login.
- **Settings:** Language, currency, dark mode, default board, monthly budget, security (reset password), data (backup/export/share app), support (about, version).
- **Invitees:** List of people you’ve invited to boards and their status (e.g. accepted/pending).

### 2.2 Expense Boards

- **Create** multiple expense boards (e.g. “Goa Trip”, “Home”, “Office”).
- **Set** board name, description, color, icon, budget (total/per person), and optional share code.
- **View** list of boards with progress (spent vs budget), transaction count, and quick stats.
- **Open** a board to see its expenses, members, and details.
- **Share** a board via invite link/code; others can **join** using that link.
- **Delete** a board (with confirmation).
- **Default board** can be set in settings for quick add-expense flow.

### 2.3 Expenses

- **Add expense:** Amount, description, category, payment method, date, and board.
- **View** expenses in a list (per board or across boards); filter by category.
- **Edit / Delete** expenses.
- **Categories:** Predefined and custom categories; each can have icon and color.
- **Payment methods** (e.g. Cash, UPI, Card) for labelling how an expense was paid.

### 2.4 Categories

- **Create / Edit / Delete** custom categories.
- **Set** name, icon, and color.
- **Use** in add-expense flow; filter or group expenses by category on expense/analytics screens.

### 2.5 Dashboard (Home)

- **Summary:** Total budget, total spent, remaining (across boards or default board).
- **Quick actions** (e.g. add expense, view boards).
- **Recent transactions** (e.g. last few expenses) with option to see all.
- **Refresh** to reload data.
- Optional **notification test** controls for development.

### 2.6 Analytics

- **View** spending over a chosen period (e.g. weekly, monthly, yearly).
- **Insights** (e.g. top categories, trends) based on expense data.
- **Charts / visualisations** for budget vs actual and category breakdown (as implemented in the app).

### 2.7 Analysis (Settlements / Splits)

- **Select** a board/trip and **view** participants and their expenses.
- **Calculate** “who owes whom” (settlements) so the group can settle up.
- **Settlements view** showing amounts to be paid between members.

### 2.8 Notifications

- **In-app and push notifications** for events such as:
  - Board created, board invite, expense created, category created/updated/deleted, expense deleted, over budget.
- **Notification screen** to see and manage notifications.
- **Preferences** (if implemented) for which events to receive.

### 2.9 Sharing & Invitees

- **Share app:** Referral code and link to invite others to download Trivense (e.g. via email or social).
- **Share board:** Generate invite link/code for a board; others join via “Join existing board” and the invite link.
- **Invitees list:** See people you’ve shared boards with and their acceptance status.

### 2.10 Data & Backup

- **Backup to Google Drive** (as per settings; implementation may be partial or planned).
- **Export to local** (as per settings).
- **Share with** (share app / referral as above).

### 2.11 Localisation & Preferences

- **Languages:** e.g. English, Hindi (and any others added in locales).
- **Currencies:** Multiple currencies with conversion (e.g. USD, EUR, GBP, INR, etc.) for display and budgets.
- **Dark mode** (theme toggle in settings).

---

## 3. Scope of the App

### 3.1 In Scope (What the App Covers)

| Area              | Scope |
|-------------------|--------|
| **Platform**      | Mobile (iOS & Android) via Expo/React Native. |
| **Users**         | Individuals and small groups (friends, family, trips, roommates) who track and split expenses. |
| **Expense data**  | Manual entry of amount, description, category, payment method, date, board. No automatic bank/card sync unless explicitly added later. |
| **Boards**        | Multiple boards per user; boards can be shared via link/code; members can add expenses and see shared totals. |
| **Auth**          | Email/password and Google OAuth; email verification; profile and settings. |
| **Analytics**     | Period-based views, insights, and visualisations based on stored expense data. |
| **Settlements**   | “Who owes whom” and settlement amounts per board/trip. |
| **Notifications**| In-app and push for key events (boards, expenses, categories, over budget). |
| **Data**          | Stored in Supabase (auth, profiles, expense_boards, expenses, categories, shared_users, notifications, etc.). |
| **Localisation**  | Multi-language (e.g. EN, HI) and multi-currency for display and budgets. |

### 3.2 Out of Scope (What the App Does Not Do Today)

| Area                | Not in scope (unless added later) |
|---------------------|------------------------------------|
| **Bank / card sync**| No automatic import of transactions from banks or cards. |
| **In-app payments** | No payment processing (e.g. UPI/PayPal) inside the app; only tracking and settlement amounts. |
| **Web app**         | Mobile-first; no dedicated web dashboard (unless planned separately). |
| **Offline-first**   | App assumes connectivity for sync; full offline queue may not be implemented. |
| **Tax reports**     | No guaranteed tax or compliance reports unless built as a feature. |
| **Recurring expenses** | No built-in recurring/subscription tracking unless added. |
| **Receipt OCR**     | No automatic reading of receipts (unless added). |
| **White-label**     | Single brand (Trivense); no white-label or B2B multi-tenant in current scope. |

### 3.3 Boundaries (Clarity)

- **Expense tracking:** User- or member-entered data only (no auto-import unless explicitly in roadmap).
- **Sharing:** Invite by link/code; membership and roles as implemented (e.g. shared_users, accept/reject).
- **Monetisation:** Free and premium tiers (e.g. limits on boards, export, backup) as per product decisions; no in-app purchase flow described in this doc.
- **Support:** In-app “About” and “Version”; no defined SLA or dedicated support channel in scope here.

---

## 4. Summary

- **What the app is about:** Trivense is a personal and shared expense-tracking app for individuals and groups, with a focus on boards, categories, budgets, and “who owes whom.”
- **What it will do:** Auth (email + Google), profiles, settings, expense boards (create/share/join), expenses and categories, dashboard, analytics, settlements, notifications, sharing/referral, and localisation (language + currency).
- **Scope:** Mobile-only, manual expense entry, Supabase-backed, sharing via invite links; no bank sync, in-app payments, or web app in current scope unless added later.

Use this document for onboarding, product specs, and scope discussions. Update it when features or boundaries change.
