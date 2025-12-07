# Claude AI Memory - Annual Budget SaaS

## Project Overview

Converting an Excel-based Annual Budget spreadsheet into a modern SaaS application with all formulas, relationships, and calculations preserved.

## ⚠️ IMPORTANT REFERENCE

**ALWAYS check Annual_Budget.xlsx for:**
- Formula verification and calculations
- Page functionality and business logic
- Expected behavior and data relationships
- UI/UX patterns and workflows

The Excel file is the source of truth for all features, formulas, and calculations.

---

## Architecture

### Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19 with Radix UI components (shadcn/ui) + Tailwind CSS v4
- **Database**: MongoDB Atlas with native driver
- **Data Fetching**: SWR for client-side data fetching
- **Forms**: React Hook Form + Zod validation
- **Deployment**: Vercel

### Client-Side Data Fetching

The application uses SWR for data fetching with custom hooks:

- `useBudgets()` - Fetches all budgets, returns `{ budgets, isLoading, error, isError, mutate }`
- `useBudget(id)` - Fetches single budget, returns `{ budget, isLoading, error, isError, mutate }`
- `useTransactions(budgetId, month, year)` - Fetches filtered transactions
- `useRecurringTransactions(budgetId)` - Fetches recurring transactions

Both hooks use automatic revalidation and provide a `mutate` function for cache invalidation.

---

## Important Configuration

### TypeScript

- Path alias `@/*` maps to project root
- Strict mode enabled
- Build with type validation

### Next.js

- Uses Google Fonts: Geist, Geist Mono, Source Serif 4
- App Router with Server Components by default
- Image optimization enabled

### Styling

- Tailwind CSS v4 with PostCSS
- Theme provider supports system/light/dark modes
- Custom Tailwind classes via `tailwind-merge` and `class-variance-authority`

---

## Frontend State Management & Architecture Guidelines

**IMPORTANT**: Follow these guidelines for all frontend development to ensure consistent, maintainable, and performant React applications.

### Core Principles

1. 🔄 **SWR for data** - automatic caching, revalidation, deduplication
2. 🎯 **Context for UI state** - view modes, selections, UI-only state
3. ⚡ **Server Components first** - reduce client JavaScript
4. 🧩 **Composition over complexity** - small, focused components
5. 🚫 **Avoid useEffect** - use hooks, memos, and proper patterns
6. 📝 **Simple business logic** - pure functions, testable utilities

This pattern provides better performance, maintainability, and aligns with Next.js 16+ best practices.

---

### PARAMS in API Routes

```typescript
// app/api/budgets/[id]/route.ts
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // ... logic
  return NextResponse.json({ id, data });
}
```

**Key points:**

- `params` is a promise that resolves to an object with the parameters
- `await params` resolves the promise
- `const { id } = await params` destructures the object to get the id

---

### State Management Pattern: SWR + Context API

**DO NOT use Zustand** or other global state management libraries. Instead, use the SWR + Context API pattern for better control, caching, and React Server Component optimization.

---

### Data Fetching with SWR

**Create custom hooks wrapping `useSWR`** for all data fetching operations:

```typescript
// hooks/useBudgets.ts
import useSWR from "swr";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  });

export const useBudgets = () => {
  const { data, error, isLoading, mutate } = useSWR("/api/budgets", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000, // Cache for 1 minute
  });

  return {
    budgets: data?.budgets || [],
    isLoading,
    error,
    mutate, // For manual cache updates
  };
};

export const useTransactions = (
  budgetId: string,
  month: number,
  year: number
) => {
  const params = new URLSearchParams({
    budgetId,
    month: month.toString(),
    year: year.toString(),
  });

  const { data, error, isLoading, mutate } = useSWR(
    `/api/transactions?${params.toString()}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  );

  return {
    transactions: data?.transactions || [],
    total: data?.total || 0,
    isLoading,
    error,
    mutate,
  };
};
```

**Key points:**

- URL becomes the cache key (automatic deduplication)
- Include query params in the URL for proper caching
- Return destructured data with sensible defaults
- Expose `mutate` for cache invalidation
- Configure `revalidateOnFocus` and `dedupingInterval` appropriately

---

### Mutations with SWR

**Create separate hooks for mutations** (create, update, delete):
**Reference**: https://swr.vercel.app/docs/mutation

```typescript
// hooks/useTransactionMutations.ts
import { useSWRConfig } from "swr";

export const useTransactionMutations = () => {
  const { mutate } = useSWRConfig();

  const createTransaction = async (data: TransactionCreate) => {
    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Failed to create");

    // Invalidate cache to refetch
    mutate(
      (key) => typeof key === "string" && key.startsWith("/api/transactions")
    );

    return res.json();
  };

  const updateTransaction = async (id: string, payload: TransactionUpdate) => {
    // Optimistic update
    await mutate(
      `/api/transactions/${id}`,
      async () => {
        const res = await fetch(`/api/transactions/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error("Failed to update");
        return res.json();
      },
      { optimisticData: payload, revalidate: true }
    );
  };

  const deleteTransaction = async (id: string) => {
    const res = await fetch(`/api/transactions/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("Failed to delete");

    // Invalidate all related queries
    mutate(
      (key) => typeof key === "string" && key.startsWith("/api/transactions")
    );

    return res.json();
  };

  return { createTransaction, updateTransaction, deleteTransaction };
};
```

**Key points:**

- Use `useSWRConfig().mutate` for global cache updates
- Implement optimistic updates for better UX
- Invalidate related caches after mutations
- Return async functions for components to await

---

### Context API for UI State Only

**Use Context sparingly** - only for UI state that needs to be shared across deep component trees:

```typescript
// contexts/BudgetUIContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type BudgetUIState = {
  viewMode: "list" | "grid";
  selectedMonth: number;
  selectedYear: number;
  setViewMode: (mode: "list" | "grid") => void;
  setSelectedMonth: (month: number) => void;
  setSelectedYear: (year: number) => void;
};

const BudgetUIContext = createContext<BudgetUIState | undefined>(undefined);

export const BudgetUIProvider = ({ children }: { children: ReactNode }) => {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  return (
    <BudgetUIContext.Provider
      value={{
        viewMode,
        setViewMode,
        selectedMonth,
        setSelectedMonth,
        selectedYear,
        setSelectedYear,
      }}
    >
      {children}
    </BudgetUIContext.Provider>
  );
};

export const useBudgetUI = () => {
  const context = useContext(BudgetUIContext);
  if (!context) {
    throw new Error("useBudgetUI must be used within BudgetUIProvider");
  }
  return context;
};
```

**Guidelines for Context usage:**

- ❌ **DO NOT** use for data fetching (use SWR hooks instead)
- ✅ **DO** use for UI state (view modes, selections, modals)
- ❌ **DO NOT** create contexts for every component
- ✅ **DO** prefer component composition and props when possible

---

### React Server Components (RSC) First

**Prioritize Server Components** and only use Client Components when absolutely necessary:

**✅ Server Components (default):**

- Pure display components
- Components that fetch data at build/request time
- Static content, layouts, empty states
- Components without interactivity

**❌ Client Components (use sparingly):**

- Components using hooks (`useState`, `useEffect`, etc.)
- Event handlers (`onClick`, `onChange`, etc.)
- Browser APIs (`localStorage`, `window`, etc.)
- Third-party libraries requiring client-side JS

**Push "use client" to the smallest boundary possible:**

```typescript
// ❌ BAD: Entire dashboard is client
"use client";

export function BudgetDashboard() {
  const { budgets } = useBudgets();
  return (
    <div>
      <DashboardHeader />
      <DashboardFilters />
      <BudgetsList budgets={budgets} />
    </div>
  );
}

// ✅ GOOD: Only interactive parts are client
export function BudgetDashboard() {
  return (
    <div>
      <DashboardHeader /> {/* Server component */}
      <DashboardFiltersClient /> {/* Client - has inputs */}
      <BudgetsListClient /> {/* Client - has interactions */}
    </div>
  );
}
```

---

### Component Composition Over Complexity

**Keep components small and focused:**

```typescript
// ❌ BAD: 500-line component with everything
"use client";

export function TransactionsDashboard() {
  const [filters, setFilters] = useState(...);
  const [viewMode, setViewMode] = useState(...);
  const [selection, setSelection] = useState(...);

  // 400 lines of logic...

  return (/* 100 lines of JSX */);
}

// ✅ GOOD: Composed from smaller components
export function TransactionsDashboard() {
  return (
    <BudgetUIProvider>
      <TransactionsHeader />
      <TransactionsToolbar />
      <TransactionsContent />
    </BudgetUIProvider>
  );
}
```

**Benefits:**

- Easier to test individual pieces
- Better code splitting
- Clearer separation of concerns
- Easier to optimize performance

---

### Avoid useEffect When Possible

**Replace `useEffect` with better patterns:**

```typescript
// ❌ BAD: useEffect for data fetching
useEffect(() => {
  fetchData();
}, [dependency]);

// ✅ GOOD: SWR handles it
const { data } = useSWR("/api/data", fetcher);

// ❌ BAD: useEffect for derived state
useEffect(() => {
  setFiltered(transactions.filter((t) => t.type === filter));
}, [transactions, filter]);

// ✅ GOOD: useMemo
const filtered = useMemo(
  () => transactions.filter((t) => t.type === filter),
  [transactions, filter]
);

// ❌ BAD: useEffect for URL sync
useEffect(() => {
  const params = new URLSearchParams({ month });
  window.history.replaceState({}, "", `?${params}`);
}, [month]);

// ✅ GOOD: URL as source of truth in SWR key
const searchParams = useSearchParams();
const month = searchParams.get("month") || "1";
const { data } = useSWR(`/api/transactions?month=${month}`, fetcher);
```

**When `useEffect` IS appropriate:**

- Third-party library initialization
- DOM manipulation that can't be done declaratively
- Setting up/cleaning up subscriptions
- Browser API integration (but consider Server Components first)

---

### Business Logic Simplicity

**Keep business logic simple and testable:**

```typescript
// ✅ Extract complex logic to utility functions
// utils/budgetHelpers.ts
export const calculateMonthlyBalance = (transactions: Transaction[]) => {
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    income,
    expenses,
    balance: income - expenses,
  };
};

export const calculate503020 = (monthlyIncome: number) => ({
  needs: monthlyIncome * 0.5,
  wants: monthlyIncome * 0.3,
  savings: monthlyIncome * 0.2,
});

// Component stays simple
export function MonthlyStats({ transactions }: { transactions: Transaction[] }) {
  const stats = calculateMonthlyBalance(transactions);
  return <Stats {...stats} />;
}
```

**Benefits:**

- Pure functions are easy to test
- Logic is reusable across components
- Components focus on presentation
- Better TypeScript inference

---

## Project Structure

```
/app
├── (auth)
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── layout.tsx
├── (dashboard)
│   ├── layout.tsx (sidebar, header)
│   ├── dashboard/page.tsx
│   ├── setup/page.tsx
│   ├── calendar/page.tsx
│   ├── month/[month]/page.tsx (dynamic route)
│   ├── recurring/page.tsx
│   ├── accounts/page.tsx
│   ├── budget-rule/page.tsx
│   ├── breakdown/page.tsx
│   ├── savings/page.tsx
│   ├── subscriptions/page.tsx
│   ├── net-worth/page.tsx
│   └── instructions/page.tsx
├── api/
│   ├── auth/[...nextauth]/route.ts
│   ├── budgets/route.ts
│   ├── transactions/route.ts
│   ├── recurring/route.ts
│   ├── categories/route.ts
│   ├── accounts/route.ts
│   ├── subscriptions/route.ts
│   ├── savings/route.ts
│   └── net-worth/route.ts
└── layout.tsx
/components
├── ui/ (shadcn/ui components)
├── budget/
├── transactions/
└── shared/
/contexts
├── BudgetUIContext.tsx
└── ThemeProvider.tsx
/hooks
├── useBudgets.ts
├── useBudget.ts
├── useTransactions.ts
├── useTransactionMutations.ts
└── useRecurringTransactions.ts
/lib
├── db.ts (MongoDB connection)
├── auth.ts (NextAuth config)
└── utils.ts
/utils
├── budgetHelpers.ts
├── dateHelpers.ts
└── formatters.ts
/types
├── budget.ts
├── transaction.ts
└── user.ts
```

---

## Database Schema (MongoDB)

### Collections

1. **users** - User accounts
2. **budgets** - Budget instances per user/year
3. **income_categories** - Income category definitions
4. **expense_categories** - Expense category definitions
5. **transactions** - All income/expense transactions
6. **recurring_transactions** - Recurring transaction templates
7. **accounts** - Bank accounts/wallets
8. **subscriptions** - Subscription tracking
9. **savings_goals** - Savings goals and progress
10. **net_worth_entries** - Net worth snapshots over time

---

## Key Features to Implement

### Phase 1: Foundation ✅ COMPLETE
- ✅ Next.js 16 setup
- ✅ MongoDB connection
- ✅ Authentication (Clerk)
- ✅ Basic layout with sidebar

### Phase 2: Setup Page ✅ COMPLETE
- ✅ Configuration form (country, currency, year)
- ✅ Income categories management
- ✅ Expense categories management
- ✅ Projected amounts
- ✅ Rollover setting
- ✅ Starting month selection

### Phase 3: Monthly View ✅ COMPLETE
- ✅ Dynamic route `/month/[month]`
- ✅ Month selector
- ✅ Cash flow summary
- ✅ Transaction list with filters
- ✅ Add/edit/delete transactions
- ✅ Rollover calculation
- ✅ Generate recurring transactions
- ✅ Income by category pie chart
- ✅ Expenses by category pie chart

### Phase 4: Dashboard ✅ COMPLETE
- ✅ Annual overview
- ✅ Monthly summaries (all 12 months)
- ✅ Income vs expenses comparison
- ✅ Balance tracking
- ✅ Quick navigation to months

### Phase 5: Advanced Features ✅ COMPLETE
- ✅ Recurring transactions (with subscription flag)
- ✅ Calendar view (daily transaction display)
- ✅ 50/30/20 budget rule (Breakdown page)
- ✅ Savings planner (goals, contributions, progress)
- ✅ Subscriptions tracker (filtered recurring transactions)
- ⏳ Net worth tracker - **IN PROGRESS**
- ⏳ Account tracker - **NOT STARTED**

### Phase 6: Account Management & Financial Tracking 🔄 CURRENT
- ❌ **Account Tracker** (HIGH PRIORITY)
  - Create/edit/delete accounts (bank, debt, savings, investment)
  - Track starting balance per account
  - Monthly account view with IN/OUT/Transfer/Interest
  - Link transactions to accounts
  - Calculate current balance
  - Support multiple account types
  - Monthly selector for historical view

- ❌ **Net Worth Tracker** (MEDIUM PRIORITY)
  - Assets tracking (cash, investments, real estate, other)
  - Liabilities tracking (credit cards, loans, mortgages, other)
  - Net worth calculation (Assets - Liabilities)
  - Historical tracking by date
  - Trend visualization with charts
  - Add/edit/delete net worth entries

### Phase 7: Polish & Enhancement 📋 PLANNED
- Help & Documentation
  - In-app tooltips
  - Help center/FAQ
  - Onboarding flow
  - Feature tour
- Enhancements
  - Export functionality (CSV, PDF reports)
  - Data import from other tools
  - Multi-currency support improvements
  - Budget templates
  - Notifications for upcoming subscriptions
  - Mobile responsive improvements

---

## Excel Formula Conversions

### Example: Currency Symbol Lookup

**Excel**: `=VLOOKUP(O2, Jan!BW3:BY248, 3, TRUE)`

**TypeScript**:

```typescript
const getCurrencySymbol = (country: string): string => {
  const currencyMap: Record<string, string> = {
    Spain: "€",
    USA: "$",
    UK: "£",
    // ... more countries
  };
  return currencyMap[country] || "$";
};
```

### Example: Monthly Balance Calculation

**Excel**: `=SUM(H7:H8)-SUM(H9:H12)` (Income - Expenses)

**TypeScript**:

```typescript
const calculateMonthlyBalance = (
  income: number,
  expenses: number,
  rollover: number
) => {
  return income + rollover - expenses;
};
```

### Example: Daily Balance with SUMIF

**Excel**: `=SUMIF($AF$4:$AF$1001, BH2, $AJ$4:$AJ$1001)`

**TypeScript**:

```typescript
const getDailyExpenses = async (budgetId: string, date: Date) => {
  const startOfDay = new Date(date.setHours(0, 0, 0, 0));
  const endOfDay = new Date(date.setHours(23, 59, 59, 999));

  const result = await db.collection("transactions").aggregate([
    {
      $match: {
        budgetId: new ObjectId(budgetId),
        type: "expense",
        date: { $gte: startOfDay, $lte: endOfDay },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$amount" },
      },
    },
  ]);

  return result[0]?.total || 0;
};
```

---

## Important Notes

- **NO Zustand**: Use SWR + Context API pattern
- **Server Components First**: Push "use client" to smallest boundary
- **Avoid useEffect**: Use SWR, useMemo, proper patterns
- **Pure Functions**: Extract business logic to testable utilities
- **Small Components**: Keep components focused and composable
- **SWR for Data**: All data fetching through custom SWR hooks
- **Context for UI**: Only use Context for UI state, not data

---

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint
npm run lint

# Type check
npm run type-check
```

---

## Environment Variables

```env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/annual-budget
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Testing Strategy

- **Unit Tests**: Pure functions in `/utils` and `/lib`
- **Integration Tests**: API routes
- **E2E Tests**: Critical user flows with Playwright
- **Component Tests**: React Testing Library for UI components

---

## Performance Optimizations

1. **SWR Caching**: Automatic deduplication and caching
2. **Server Components**: Reduce client-side JavaScript
3. **Code Splitting**: Lazy load heavy components
4. **MongoDB Indexes**: Index on budgetId, date, type
5. **Image Optimization**: Next.js automatic optimization
6. **Font Optimization**: Google Fonts with Next.js font loader

---

## Security Considerations

1. **Authentication**: NextAuth.js with secure sessions
2. **Authorization**: User can only access their own budgets
3. **Input Validation**: Zod schemas for all inputs
4. **SQL Injection**: N/A (using MongoDB)
5. **XSS Prevention**: React automatic escaping
6. **CSRF Protection**: NextAuth.js built-in
7. **Rate Limiting**: Implement on API routes
8. **HTTPS Only**: Enforce in production

---

## Deployment Checklist

- [ ] Environment variables configured in Vercel
- [ ] MongoDB Atlas production cluster ready
- [ ] NextAuth.js secret generated
- [ ] Custom domain configured (optional)
- [ ] Error tracking setup (Sentry)
- [ ] Analytics setup (Vercel Analytics)
- [ ] Performance monitoring enabled
- [ ] Backup strategy for MongoDB

---

## References

- [Next.js 16 Documentation](https://nextjs.org/docs)
- [SWR Documentation](https://swr.vercel.app/)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [MongoDB Node.js Driver](https://www.mongodb.com/docs/drivers/node/)
- [NextAuth.js v5](https://authjs.dev/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod Validation](https://zod.dev/)
