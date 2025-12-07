# Plan Detallado: Conversión de Annual Budget Excel a SaaS

## Stack Tecnológico
- **Framework**: Next.js 16 (App Router)
- **UI**: React 19 with Radix UI components (shadcn/ui) + Tailwind CSS v4
- **Database**: MongoDB Atlas with native driver
- **Data Fetching**: SWR for client-side data fetching
- **Forms**: React Hook Form + Zod validation
- **Deployment**: Vercel
- **State Management**: SWR + Context API (NO Zustand)

---

## Arquitectura y Mejores Prácticas

### Client-Side Data Fetching

La aplicación usa **SWR** para data fetching con hooks personalizados:

- `useBudgets()` - Obtiene todos los presupuestos
- `useBudget(id)` - Obtiene un presupuesto específico
- `useTransactions(budgetId, month, year)` - Obtiene transacciones filtradas
- `useRecurringTransactions(budgetId)` - Obtiene transacciones recurrentes

Todos los hooks devuelven: `{ data, isLoading, error, isError, mutate }`

### Configuración Importante

#### TypeScript
- Alias de path `@/*` apunta a la raíz del proyecto
- Strict mode habilitado
- Build con validación de tipos

#### Next.js
- Google Fonts: Geist, Geist Mono, Source Serif 4
- App Router con Server Components por defecto
- Optimización de imágenes habilitada

#### Styling
- Tailwind CSS v4 con PostCSS
- Theme provider soporta system/light/dark modes
- Custom Tailwind classes vía `tailwind-merge` y `class-variance-authority`

---

## Frontend State Management & Architecture Guidelines

**IMPORTANTE**: Seguir estas guías para todo el desarrollo frontend para asegurar aplicaciones React consistentes, mantenibles y performantes.

### Principios Fundamentales

1. 🔄 **SWR para datos** - caching automático, revalidación, deduplicación
2. 🎯 **Context para UI state** - modos de vista, selecciones, estado de UI solamente
3. ⚡ **Server Components primero** - reducir JavaScript del cliente
4. 🧩 **Composición sobre complejidad** - componentes pequeños y enfocados
5. 🚫 **Evitar useEffect** - usar hooks, memos y patrones correctos
6. 📝 **Lógica de negocio simple** - funciones puras, utilidades testeables

Este patrón provee mejor performance, mantenibilidad y se alinea con las mejores prácticas de Next.js 16+.

---

### PARAMS en API Routes

```typescript
// app/api/budgets/[id]/route.ts
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // ... lógica
  return NextResponse.json({ id, data });
}
```

**Puntos clave:**
- `params` es una promesa que se resuelve a un objeto con los parámetros
- `await params` resuelve la promesa
- `const { id } = await params` destructura el objeto para obtener el id

---

### Patrón de State Management: SWR + Context API

**NO USAR Zustand** u otras librerías de estado global. En su lugar, usar el patrón SWR + Context API para mejor control, caching y optimización de React Server Components.

---

### Data Fetching con SWR

**Crear hooks personalizados envolviendo `useSWR`** para todas las operaciones de data fetching:

```typescript
// hooks/useBudgets.ts
import useSWR from 'swr';

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
  });

export const useBudgets = () => {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/budgets',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // Cache por 1 minuto
    }
  );

  return {
    budgets: data?.budgets || [],
    isLoading,
    error,
    mutate, // Para actualizaciones manuales del caché
  };
};

export const useTransactions = (budgetId: string, month: number, year: number) => {
  const params = new URLSearchParams({
    budgetId,
    month: month.toString(),
    year: year.toString()
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

**Puntos clave:**
- La URL se convierte en la cache key (deduplicación automática)
- Incluir query params en la URL para caching correcto
- Retornar datos destructurados con defaults sensatos
- Exponer `mutate` para invalidación de caché
- Configurar `revalidateOnFocus` y `dedupingInterval` apropiadamente

---

### Mutaciones con SWR

**Crear hooks separados para mutaciones** (create, update, delete):

```typescript
// hooks/useTransactionMutations.ts
import { useSWRConfig } from 'swr';

export const useTransactionMutations = () => {
  const { mutate } = useSWRConfig();

  const createTransaction = async (data: TransactionCreate) => {
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error('Failed to create');

    // Invalidar caché para refetch
    mutate((key) => typeof key === 'string' && key.startsWith('/api/transactions'));

    return res.json();
  };

  const updateTransaction = async (id: string, payload: TransactionUpdate) => {
    // Optimistic update
    await mutate(
      `/api/transactions/${id}`,
      async () => {
        const res = await fetch(`/api/transactions/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error('Failed to update');
        return res.json();
      },
      { optimisticData: payload, revalidate: true }
    );
  };

  const deleteTransaction = async (id: string) => {
    const res = await fetch(`/api/transactions/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) throw new Error('Failed to delete');

    // Invalidar todas las queries relacionadas
    mutate((key) => typeof key === 'string' && key.startsWith('/api/transactions'));

    return res.json();
  };

  return { createTransaction, updateTransaction, deleteTransaction };
};
```

**Puntos clave:**
- Usar `useSWRConfig().mutate` para actualizaciones globales del caché
- Implementar optimistic updates para mejor UX
- Invalidar cachés relacionados después de mutaciones
- Retornar funciones async para que los componentes puedan await

---

### Context API Solo Para UI State

**Usar Context con moderación** - solo para estado de UI que necesita ser compartido a través de árboles de componentes profundos:

```typescript
// contexts/BudgetUIContext.tsx
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type BudgetUIState = {
  viewMode: 'list' | 'grid';
  selectedMonth: number;
  selectedYear: number;
  setViewMode: (mode: 'list' | 'grid') => void;
  setSelectedMonth: (month: number) => void;
  setSelectedYear: (year: number) => void;
};

const BudgetUIContext = createContext<BudgetUIState | undefined>(undefined);

export const BudgetUIProvider = ({ children }: { children: ReactNode }) => {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
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
    throw new Error('useBudgetUI must be used within BudgetUIProvider');
  }
  return context;
};
```

**Guías para uso de Context:**
- ❌ **NO** usar para data fetching (usar hooks de SWR en su lugar)
- ✅ **SÍ** usar para estado de UI (modos de vista, selecciones, modales)
- ❌ **NO** crear contexts para cada componente
- ✅ **SÍ** preferir composición de componentes y props cuando sea posible

---

### React Server Components (RSC) First

**Priorizar Server Components** y solo usar Client Components cuando sea absolutamente necesario:

**✅ Server Components (default):**
- Componentes de display puro
- Componentes que obtienen datos en build/request time
- Contenido estático, layouts, estados vacíos
- Componentes sin interactividad

**❌ Client Components (usar con moderación):**
- Componentes usando hooks (`useState`, `useEffect`, etc.)
- Event handlers (`onClick`, `onChange`, etc.)
- Browser APIs (`localStorage`, `window`, etc.)
- Librerías de terceros que requieren JS del lado del cliente

**Empujar "use client" al límite más pequeño posible:**

```typescript
// ❌ MAL: Todo el dashboard es cliente
'use client';

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

// ✅ BIEN: Solo las partes interactivas son cliente
export function BudgetDashboard() {
  return (
    <div>
      <DashboardHeader /> {/* Server component */}
      <DashboardFiltersClient /> {/* Client - tiene inputs */}
      <BudgetsListClient /> {/* Client - tiene interacciones */}
    </div>
  );
}
```

---

### Composición de Componentes Sobre Complejidad

**Mantener componentes pequeños y enfocados:**

```typescript
// ❌ MAL: Componente de 500 líneas con todo
'use client';

export function TransactionsDashboard() {
  const [filters, setFilters] = useState(...);
  const [viewMode, setViewMode] = useState(...);
  const [selection, setSelection] = useState(...);

  // 400 líneas de lógica...

  return (/* 100 líneas de JSX */);
}

// ✅ BIEN: Compuesto de componentes más pequeños
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

**Beneficios:**
- Más fácil de testear piezas individuales
- Mejor code splitting
- Separación de responsabilidades más clara
- Más fácil de optimizar performance

---

### Evitar useEffect Cuando Sea Posible

**Reemplazar `useEffect` con mejores patrones:**

```typescript
// ❌ MAL: useEffect para data fetching
useEffect(() => {
  fetchData();
}, [dependency]);

// ✅ BIEN: SWR lo maneja
const { data } = useSWR('/api/data', fetcher);

// ❌ MAL: useEffect para estado derivado
useEffect(() => {
  setFiltered(transactions.filter((t) => t.type === filter));
}, [transactions, filter]);

// ✅ BIEN: useMemo
const filtered = useMemo(
  () => transactions.filter((t) => t.type === filter),
  [transactions, filter]
);

// ❌ MAL: useEffect para sincronizar URL
useEffect(() => {
  const params = new URLSearchParams({ month });
  window.history.replaceState({}, '', `?${params}`);
}, [month]);

// ✅ BIEN: URL como fuente de verdad en SWR key
const searchParams = useSearchParams();
const month = searchParams.get('month') || '1';
const { data } = useSWR(`/api/transactions?month=${month}`, fetcher);
```

**Cuándo `useEffect` ES apropiado:**
- Inicialización de librerías de terceros
- Manipulación del DOM que no puede hacerse declarativamente
- Setup/cleanup de subscripciones
- Integración de Browser APIs (pero considerar Server Components primero)

---

### Simplicidad en Lógica de Negocio

**Mantener la lógica de negocio simple y testeable:**

```typescript
// ✅ Extraer lógica compleja a funciones utilitarias
// utils/budgetHelpers.ts
export const calculateMonthlyBalance = (transactions: Transaction[]) => {
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    income,
    expenses,
    balance: income - expenses
  };
};

export const calculate503020 = (monthlyIncome: number) => ({
  needs: monthlyIncome * 0.5,
  wants: monthlyIncome * 0.3,
  savings: monthlyIncome * 0.2
});

// Componente se mantiene simple
export function MonthlyStats({ transactions }: { transactions: Transaction[] }) {
  const stats = calculateMonthlyBalance(transactions);
  return <Stats {...stats} />;
}
```

**Beneficios:**
- Funciones puras son fáciles de testear
- Lógica es reutilizable entre componentes
- Componentes se enfocan en presentación
- Mejor inferencia de TypeScript

---

## Análisis del Archivo Excel

### Hojas Identificadas (23 total):
1. **Instructions** - Instrucciones para el usuario
2. **Setup** - Configuración inicial (país, moneda, ingresos/gastos proyectados)
3. **Recurring** - Transacciones recurrentes
4. **Calendar** - Vista de calendario mensual
5. **Dashboard** - Dashboard anual con resumen
6. **Jan-Dec** (12 hojas) - Hojas mensuales individuales
7. **Account** - Gestión de cuentas
8. **503020** - Regla 50/30/20 para presupuesto
9. **Breakdown** - Desglose de gastos
10. **Savings Planner** - Planificador de ahorros
11. **Subscriptions** - Gestión de suscripciones
12. **Net Worth Tracker** - Seguimiento de patrimonio neto

### Fórmulas Clave Identificadas:
- **Setup**: ~556 fórmulas (validaciones, referencias cruzadas, símbolos de moneda)
- **Recurring**: ~582 fórmulas (cálculos de transacciones recurrentes)
- **Calendar**: ~505 fórmulas (agregaciones mensuales, filtros por fecha)
- **Dashboard**: ~2,688 fórmulas (consolidación anual, métricas principales)
- **Meses (Jan-Dec)**: ~2,900+ fórmulas por mes (cash flow, balances, categorías)

---

## Arquitectura de Base de Datos (MongoDB)

### Colecciones Principales

#### 1. `users`
```typescript
{
  _id: ObjectId,
  email: string,
  name: string,
  password: string (hashed),
  createdAt: Date,
  updatedAt: Date,
  settings: {
    country: string,
    currency: string,
    currencySymbol: string,
    startingMonth: number,
    year: number,
    rolloverEnabled: boolean
  }
}
```

#### 2. `budgets`
```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: users),
  year: number,
  name: string,
  createdAt: Date,
  updatedAt: Date
}
```

#### 3. `income_categories`
```typescript
{
  _id: ObjectId,
  budgetId: ObjectId (ref: budgets),
  name: string,
  projectedAmount: number,
  order: number,
  createdAt: Date
}
```

#### 4. `expense_categories`
```typescript
{
  _id: ObjectId,
  budgetId: ObjectId (ref: budgets),
  name: string,
  projectedAmount: number,
  category: 'needs' | 'wants' | 'savings', // Para regla 50/30/20
  order: number,
  createdAt: Date
}
```

#### 5. `transactions`
```typescript
{
  _id: ObjectId,
  budgetId: ObjectId (ref: budgets),
  date: Date,
  type: 'income' | 'expense',
  categoryId: ObjectId,
  categoryName: string,
  amount: number,
  description?: string,
  isRecurring: boolean,
  recurringId?: ObjectId,
  month: number, // 1-12
  year: number,
  createdAt: Date,
  updatedAt: Date
}
```

#### 6. `recurring_transactions`
```typescript
{
  _id: ObjectId,
  budgetId: ObjectId (ref: budgets),
  type: 'income' | 'expense',
  categoryId: ObjectId,
  categoryName: string,
  amount: number,
  description?: string,
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly',
  startDate: Date,
  endDate?: Date,
  dayOfMonth?: number, // Para frecuencia mensual
  isActive: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### 7. `accounts`
```typescript
{
  _id: ObjectId,
  budgetId: ObjectId (ref: budgets),
  name: string,
  type: 'checking' | 'savings' | 'credit' | 'investment' | 'other',
  balance: number,
  currency: string,
  isActive: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### 8. `subscriptions`
```typescript
{
  _id: ObjectId,
  budgetId: ObjectId (ref: budgets),
  name: string,
  amount: number,
  billingCycle: 'monthly' | 'yearly',
  nextBillingDate: Date,
  category: string,
  isActive: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### 9. `savings_goals`
```typescript
{
  _id: ObjectId,
  budgetId: ObjectId (ref: budgets),
  name: string,
  targetAmount: number,
  currentAmount: number,
  deadline?: Date,
  priority: 'low' | 'medium' | 'high',
  isCompleted: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### 10. `net_worth_entries`
```typescript
{
  _id: ObjectId,
  budgetId: ObjectId (ref: budgets),
  date: Date,
  assets: {
    cash: number,
    investments: number,
    realEstate: number,
    other: number,
    total: number
  },
  liabilities: {
    creditCards: number,
    loans: number,
    mortgages: number,
    other: number,
    total: number
  },
  netWorth: number, // assets.total - liabilities.total
  createdAt: Date
}
```

---

## Estructura de Rutas (Next.js App Router)

```
/app
├── (auth)
│   ├── login/
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   └── layout.tsx
├── (dashboard)
│   ├── layout.tsx (sidebar, header)
│   ├── page.tsx (redirect a /dashboard)
│   ├── dashboard/
│   │   └── page.tsx (Dashboard anual)
│   ├── setup/
│   │   └── page.tsx (Configuración inicial)
│   ├── calendar/
│   │   └── page.tsx (Vista de calendario)
│   ├── month/
│   │   └── [month]/
│   │       └── page.tsx (Vista mensual dinámica)
│   ├── recurring/
│   │   └── page.tsx (Transacciones recurrentes)
│   ├── accounts/
│   │   └── page.tsx (Gestión de cuentas)
│   ├── budget-rule/
│   │   └── page.tsx (Regla 50/30/20)
│   ├── breakdown/
│   │   └── page.tsx (Desglose de gastos)
│   ├── savings/
│   │   └── page.tsx (Planificador de ahorros)
│   ├── subscriptions/
│   │   └── page.tsx (Gestión de suscripciones)
│   ├── net-worth/
│   │   └── page.tsx (Net Worth Tracker)
│   └── instructions/
│       └── page.tsx (Instrucciones de uso)
├── api/
│   ├── auth/
│   │   └── [...nextauth]/
│   │       └── route.ts
│   ├── budgets/
│   │   └── route.ts
│   ├── transactions/
│   │   ├── route.ts
│   │   └── [id]/
│   │       └── route.ts
│   ├── recurring/
│   │   └── route.ts
│   ├── categories/
│   │   └── route.ts
│   ├── accounts/
│   │   └── route.ts
│   ├── subscriptions/
│   │   └── route.ts
│   ├── savings/
│   │   └── route.ts
│   └── net-worth/
│       └── route.ts
└── layout.tsx
```

---

## Lógica de Negocio - Fórmulas Excel a Código

### 1. Setup (Configuración)
**Excel**: Fórmula VLOOKUP para símbolo de moneda
```excel
=VLOOKUP(O2, Jan!BW3:BY248, 3, TRUE)
```
**TypeScript**:
```typescript
const getCurrencySymbol = (country: string): string => {
  const currencyMap: Record<string, string> = {
    'Spain': '€',
    'USA': '$',
    'UK': '£',
    // ... más países
  };
  return currencyMap[country] || '$';
};
```

### 2. Transacciones Recurrentes
**Excel**: Validación de fechas y propagación automática
```excel
=IF(H4="","",Setup!$O$3)
```
**TypeScript**:
```typescript
const generateRecurringTransactions = async (
  recurring: RecurringTransaction,
  startDate: Date,
  endDate: Date
): Promise<Transaction[]> => {
  const transactions: Transaction[] = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    transactions.push({
      date: new Date(currentDate),
      amount: recurring.amount,
      categoryId: recurring.categoryId,
      type: recurring.type,
      isRecurring: true,
      recurringId: recurring._id
    });

    // Incrementar según frecuencia
    switch(recurring.frequency) {
      case 'monthly':
        currentDate.setMonth(currentDate.getMonth() + 1);
        break;
      case 'weekly':
        currentDate.setDate(currentDate.getDate() + 7);
        break;
      // ... más frecuencias
    }
  }

  return transactions;
};
```

### 3. Dashboard - Cash Flow Summary
**Excel**: Suma de ingresos y gastos
```excel
=SUM(S5:S22) // Total ingresos proyectados
=SUM(U5:U22) // Total ingresos reales
```
**TypeScript**:
```typescript
const calculateCashFlowSummary = async (budgetId: string, year: number) => {
  // Ingresos proyectados
  const projectedIncome = await db.collection('income_categories')
    .aggregate([
      { $match: { budgetId: new ObjectId(budgetId) } },
      { $group: { _id: null, total: { $sum: '$projectedAmount' } } }
    ]).toArray();

  // Ingresos reales
  const actualIncome = await db.collection('transactions')
    .aggregate([
      {
        $match: {
          budgetId: new ObjectId(budgetId),
          type: 'income',
          year
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]).toArray();

  // Similar para gastos...

  return {
    income: {
      projected: projectedIncome[0]?.total || 0,
      actual: actualIncome[0]?.total || 0
    },
    expenses: {
      projected: projectedExpenses[0]?.total || 0,
      actual: actualExpenses[0]?.total || 0
    }
  };
};
```

### 4. Vistas Mensuales - Balance Diario
**Excel**: SUMIF para balance por fecha
```excel
=SUMIF($AF$4:$AF$1001, BH2, $AJ$4:$AJ$1001) // Gastos del día
=SUMIF($AF$4:$AF$997, BH2, $AH$4:$AH$997) // Ingresos del día
=BJ2-BI2 // Balance
```
**TypeScript**:
```typescript
const getDailyBalance = async (
  budgetId: string,
  month: number,
  year: number,
  day: number
) => {
  const startDate = new Date(year, month - 1, day);
  const endDate = new Date(year, month - 1, day + 1);

  const dailyTransactions = await db.collection('transactions')
    .aggregate([
      {
        $match: {
          budgetId: new ObjectId(budgetId),
          date: { $gte: startDate, $lt: endDate }
        }
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' }
        }
      }
    ]).toArray();

  const income = dailyTransactions.find(t => t._id === 'income')?.total || 0;
  const expenses = dailyTransactions.find(t => t._id === 'expense')?.total || 0;

  return {
    income,
    expenses,
    balance: income - expenses
  };
};
```

### 5. Regla 50/30/20
**Cálculo automático**:
```typescript
const calculate503020 = async (budgetId: string, month: number, year: number) => {
  const monthlyIncome = await getMonthlyIncome(budgetId, month, year);

  const categories = await db.collection('expense_categories')
    .aggregate([
      { $match: { budgetId: new ObjectId(budgetId) } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$projectedAmount' }
        }
      }
    ]).toArray();

  return {
    needs: {
      budgeted: monthlyIncome * 0.5,
      actual: categories.find(c => c._id === 'needs')?.total || 0
    },
    wants: {
      budgeted: monthlyIncome * 0.3,
      actual: categories.find(c => c._id === 'wants')?.total || 0
    },
    savings: {
      budgeted: monthlyIncome * 0.2,
      actual: categories.find(c => c._id === 'savings')?.total || 0
    }
  };
};
```

### 6. Calendar View - Filtrado por Día
**Excel**: Uso de FILTER y fórmulas complejas
```excel
=FILTER(dataRange, dateRange=d)
```
**TypeScript**:
```typescript
const getCalendarTransactions = async (
  budgetId: string,
  month: number,
  year: number
) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0); // Último día del mes

  const transactions = await db.collection('transactions')
    .aggregate([
      {
        $match: {
          budgetId: new ObjectId(budgetId),
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { $dayOfMonth: '$date' },
          transactions: {
            $push: {
              description: '$description',
              amount: '$amount',
              category: '$categoryName',
              type: '$type'
            }
          },
          totalIncome: {
            $sum: {
              $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0]
            }
          },
          totalExpenses: {
            $sum: {
              $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0]
            }
          }
        }
      },
      { $sort: { '_id': 1 } }
    ]).toArray();

  return transactions;
};
```

### 7. Savings Calculation (Rollover)
**Excel**:
```excel
=IF(Setup!AA2=FALSE, 0, previous_month_balance)
```
**TypeScript**:
```typescript
const calculateMonthlyRollover = async (
  budgetId: string,
  month: number,
  year: number
) => {
  const settings = await getUserSettings(budgetId);

  if (!settings.rolloverEnabled) {
    return 0;
  }

  // Obtener balance del mes anterior
  const previousMonth = month === 1 ? 12 : month - 1;
  const previousYear = month === 1 ? year - 1 : year;

  const previousBalance = await getMonthlyBalance(
    budgetId,
    previousMonth,
    previousYear
  );

  return previousBalance > 0 ? previousBalance : 0;
};
```

---

## Componentes Clave de UI (shadcn/ui)

### 1. Dashboard Components
- **Card**: Resúmenes de ingresos, gastos, balance
- **Chart**: Gráficos de líneas, barras, circular (usando recharts)
- **Table**: Tabla de próximos pagos
- **Badge**: Estado de categorías, alertas

### 2. Month View Components
- **Tabs**: Navegación entre secciones (Cash Flow, Bills, Savings)
- **DataTable**: Transacciones mensuales con sorting y filtros
- **Dialog**: Agregar/editar transacciones
- **Select**: Selector de mes
- **Calendar**: Selector de fechas

### 3. Setup Components
- **Form**: Configuración inicial con validación
- **Input**: Nombres de categorías, montos
- **Combobox**: Selector de país
- **Switch**: Habilitar rollover
- **Separator**: Divisiones visuales

### 4. Recurring Transactions
- **Accordion**: Lista de transacciones recurrentes agrupadas
- **RadioGroup**: Selección de frecuencia
- **DatePicker**: Fechas de inicio/fin

### 5. Calendar View
- **Calendar Component**: Vista mensual con transacciones
- **Popover**: Detalles de transacciones por día
- **Sheet**: Panel lateral con detalles

### 6. Charts & Visualizations
- **BarChart**: Comparación ingresos vs gastos
- **LineChart**: Evolución mensual
- **PieChart**: Distribución de gastos por categoría
- **AreaChart**: Net worth over time

---

## Funcionalidades Principales por Página

### 1. `/setup` - Configuración Inicial
**Features**:
- Seleccionar país y moneda
- Configurar año fiscal y mes de inicio
- Definir categorías de ingresos (nombre + monto proyectado)
- Definir categorías de gastos (nombre + monto proyectado + tipo: needs/wants/savings)
- Habilitar/deshabilitar rollover
- Importar categorías predefinidas

**Cálculos**:
- Total de ingresos proyectados
- Total de gastos proyectados
- Balance proyectado
- Validación de regla 50/30/20

### 2. `/dashboard` - Dashboard Anual
**Features**:
- Resumen de cash flow anual
- Próximos pagos (transacciones recurrentes)
- Gráfico de evolución mensual
- Comparación proyectado vs real
- Quick stats (total income, total expenses, savings rate)
- Alertas de presupuesto

**Cálculos**:
- Suma de todos los meses
- Promedio mensual
- Tasa de ahorro
- Varianza proyectado vs real

### 3. `/month/[month]` - Vista Mensual
**Features**:
- Selector de mes (dropdown)
- Cash Flow Summary (proyectado vs actual)
- Tabla de transacciones con filtros y búsqueda
- Agregar transacciones manuales
- Marcar transacciones recurrentes
- Categorías con límites y porcentaje usado
- Savings calculation con rollover

**Secciones**:
1. **Income**: Lista de ingresos con proyectado vs real
2. **Expenses**: Categorías de gastos con límites
3. **Bills**: Pagos fijos mensuales
4. **Debt Payments**: Pagos de deudas
5. **Savings**: Ahorro del mes
6. **Transactions**: Tabla completa de transacciones

**Cálculos**:
- Total income (projected vs actual)
- Total expenses (projected vs actual)
- Balance del mes
- Rollover del mes anterior
- Remaining budget por categoría

### 4. `/calendar` - Vista de Calendario
**Features**:
- Calendario mensual con transacciones por día
- Click en día para ver detalle
- Indicadores visuales (colores por tipo)
- Resumen diario (ingresos, gastos, balance)
- Navegación entre meses

**Cálculos**:
- Balance acumulado por día
- Total de transacciones por día
- Límite de 8 transacciones por día (warning)

### 5. `/recurring` - Transacciones Recurrentes
**Features**:
- Lista de transacciones recurrentes
- Agregar nueva recurrente
- Editar/eliminar recurrentes
- Activar/desactivar
- Preview de próximas instancias
- Frecuencias: diaria, semanal, quincenal, mensual, anual

**Cálculos**:
- Generación automática de transacciones
- Cálculo de próxima fecha
- Total mensual de recurrentes

### 6. `/accounts` - Gestión de Cuentas
**Features**:
- Lista de cuentas bancarias
- Balance por cuenta
- Transferencias entre cuentas
- Historial de movimientos
- Tipos: checking, savings, credit, investment

**Cálculos**:
- Balance total de todas las cuentas
- Balance por tipo de cuenta

### 7. `/budget-rule` - Regla 50/30/20
**Features**:
- Visualización de distribución 50/30/20
- Gráfico circular
- Comparación ideal vs real
- Recomendaciones de ajuste
- Desglose por categoría

**Cálculos**:
- 50% Needs (necesidades)
- 30% Wants (deseos)
- 20% Savings (ahorros)
- Diferencia con lo proyectado

### 8. `/breakdown` - Desglose de Gastos
**Features**:
- Gráficos de gastos por categoría
- Comparación mensual
- Top categorías
- Tendencias
- Filtros por rango de fechas

**Cálculos**:
- Porcentaje por categoría
- Comparación mes a mes
- Promedio mensual por categoría

### 9. `/savings` - Planificador de Ahorros
**Features**:
- Objetivos de ahorro
- Progreso de cada objetivo
- Fecha estimada de cumplimiento
- Priorización de objetivos
- Recomendaciones de ahorro mensual

**Cálculos**:
- Ahorro mensual requerido
- Tiempo estimado para cumplir objetivo
- Ahorro total acumulado

### 10. `/subscriptions` - Gestión de Suscripciones
**Features**:
- Lista de suscripciones activas
- Próximas renovaciones
- Costo mensual/anual total
- Categorización de suscripciones
- Alertas de renovación

**Cálculos**:
- Total mensual de suscripciones
- Total anual de suscripciones
- Proyección de gastos

### 11. `/net-worth` - Net Worth Tracker
**Features**:
- Entrada de activos (cash, investments, real estate)
- Entrada de pasivos (credit cards, loans, mortgages)
- Cálculo de patrimonio neto
- Gráfico de evolución temporal
- Comparación mensual

**Cálculos**:
- Total Assets
- Total Liabilities
- Net Worth = Assets - Liabilities
- Variación mensual

### 12. `/instructions` - Instrucciones
**Features**:
- Guía de uso de la aplicación
- Video tutorials (embeds)
- FAQs
- Soporte por email
- Changelog

---

## Sistema de Cálculos en Tiempo Real

### Server Actions (Next.js)
```typescript
// app/actions/calculations.ts
'use server'

export async function recalculateMonthlyBalance(
  budgetId: string,
  month: number,
  year: number
) {
  const transactions = await getMonthlyTransactions(budgetId, month, year);
  const rollover = await calculateMonthlyRollover(budgetId, month, year);

  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    income,
    expenses,
    rollover,
    balance: income - expenses + rollover
  };
}
```

### Hooks Personalizados
```typescript
// hooks/useBudgetCalculations.ts
export function useBudgetCalculations(budgetId: string, month: number) {
  const [calculations, setCalculations] = useState(null);

  useEffect(() => {
    async function calculate() {
      const result = await recalculateMonthlyBalance(budgetId, month, year);
      setCalculations(result);
    }
    calculate();
  }, [budgetId, month]);

  return calculations;
}
```

---

## Validaciones con Zod

```typescript
// schemas/transaction.ts
import { z } from 'zod';

export const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  categoryId: z.string().min(1, 'Category is required'),
  amount: z.number().positive('Amount must be positive'),
  date: z.date(),
  description: z.string().optional(),
  isRecurring: z.boolean().default(false)
});

export const recurringTransactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  categoryId: z.string().min(1),
  amount: z.number().positive(),
  frequency: z.enum(['daily', 'weekly', 'biweekly', 'monthly', 'yearly']),
  startDate: z.date(),
  endDate: z.date().optional(),
  dayOfMonth: z.number().min(1).max(31).optional()
}).refine(
  data => !data.endDate || data.endDate > data.startDate,
  { message: 'End date must be after start date' }
);
```

---

## Autenticación y Autorización

### NextAuth.js Configuration
```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // Verificar credenciales en MongoDB
        const user = await verifyUser(credentials.email, credentials.password);
        return user;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      return session;
    }
  },
  pages: {
    signIn: '/login'
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

### Middleware de Protección
```typescript
// middleware.ts
import { withAuth } from 'next-auth/middleware';

export default withAuth({
  callbacks: {
    authorized({ req, token }) {
      return !!token;
    }
  }
});

export const config = {
  matcher: ['/dashboard/:path*', '/month/:path*', '/setup/:path*']
};
```

---

## Optimizaciones de Performance

### 1. Server Components
- Usar RSC para datos estáticos
- Streaming de UI con Suspense

### 2. Caching
```typescript
import { unstable_cache } from 'next/cache';

export const getCachedBudgetSummary = unstable_cache(
  async (budgetId: string) => {
    return await calculateBudgetSummary(budgetId);
  },
  ['budget-summary'],
  { revalidate: 3600 } // 1 hora
);
```

### 3. Indexes de MongoDB
```typescript
// Crear índices optimizados
db.collection('transactions').createIndex({ budgetId: 1, date: -1 });
db.collection('transactions').createIndex({ budgetId: 1, month: 1, year: 1 });
db.collection('recurring_transactions').createIndex({ budgetId: 1, isActive: 1 });
```

### 4. Paginación
```typescript
const getTransactions = async (
  budgetId: string,
  page: number = 1,
  limit: number = 50
) => {
  const skip = (page - 1) * limit;

  const transactions = await db.collection('transactions')
    .find({ budgetId: new ObjectId(budgetId) })
    .sort({ date: -1 })
    .skip(skip)
    .limit(limit)
    .toArray();

  return transactions;
};
```

---

## Plan de Implementación por Fases

### Fase 1: Fundamentos (Semanas 1-2)
- [ ] Setup de proyecto Next.js 15
- [ ] Configuración de Tailwind CSS 4
- [ ] Instalación de shadcn/ui
- [ ] Conexión a MongoDB Atlas
- [ ] Configuración de NextAuth.js
- [ ] Modelos de datos en TypeScript
- [ ] Sistema de autenticación completo

### Fase 2: Setup y Configuración (Semana 3)
- [ ] Página de Setup
- [ ] Formulario de configuración inicial
- [ ] Gestión de categorías de ingresos
- [ ] Gestión de categorías de gastos
- [ ] Validaciones con Zod
- [ ] Persistencia en MongoDB

### Fase 3: Dashboard Anual (Semana 4)
- [ ] Diseño del dashboard
- [ ] Cards de resumen
- [ ] Gráficos con recharts
- [ ] Cálculos de cash flow anual
- [ ] Próximos pagos
- [ ] Alertas y notificaciones

### Fase 4: Vista Mensual (Semanas 5-6)
- [ ] Ruta dinámica `/month/[month]`
- [ ] Selector de mes
- [ ] Cash Flow Summary mensual
- [ ] Tabla de transacciones
- [ ] Formulario de agregar transacción
- [ ] Cálculos de balance mensual
- [ ] Rollover implementation
- [ ] Categorías con límites

### Fase 5: Transacciones Recurrentes (Semana 7)
- [ ] Página de recurring transactions
- [ ] Formulario de creación
- [ ] Lógica de generación automática
- [ ] Preview de próximas instancias
- [ ] Edición y eliminación
- [ ] Activación/desactivación

### Fase 6: Calendar View (Semana 8)
- [ ] Componente de calendario
- [ ] Integración de transacciones
- [ ] Vista diaria detallada
- [ ] Indicadores visuales
- [ ] Navegación entre meses

### Fase 7: Features Adicionales (Semanas 9-10)
- [ ] Accounts management
- [ ] Regla 50/30/20
- [ ] Breakdown de gastos
- [ ] Savings Planner
- [ ] Subscriptions management
- [ ] Net Worth Tracker

### Fase 8: Optimizaciones y Testing (Semanas 11-12)
- [ ] Optimización de queries
- [ ] Implementación de caché
- [ ] Tests unitarios (Jest)
- [ ] Tests de integración
- [ ] Tests E2E (Playwright)
- [ ] Responsive design
- [ ] Accesibilidad (a11y)

### Fase 9: Deployment y Monitoring (Semana 13)
- [ ] Deploy en Vercel
- [ ] Configuración de MongoDB Atlas production
- [ ] Setup de analytics
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring
- [ ] Backup strategy

### Fase 10: Instrucciones y Documentación (Semana 14)
- [ ] Página de instrucciones
- [ ] Documentación de usuario
- [ ] FAQs
- [ ] Video tutorials
- [ ] Changelog

---

## Migraciones de Datos

### Importar desde Excel
```typescript
// utils/importExcel.ts
import * as XLSX from 'xlsx';

export async function importExcelData(
  file: File,
  userId: string
) {
  const workbook = XLSX.read(await file.arrayBuffer());

  // Importar Setup
  const setupSheet = workbook.Sheets['Setup'];
  const setupData = XLSX.utils.sheet_to_json(setupSheet);

  // Crear presupuesto
  const budget = await createBudget({
    userId,
    year: setupData[0].year,
    country: setupData[0].country
  });

  // Importar categorías de ingresos
  const incomeCategories = extractIncomeCategories(setupData);
  await createIncomeCategories(budget._id, incomeCategories);

  // Importar categorías de gastos
  const expenseCategories = extractExpenseCategories(setupData);
  await createExpenseCategories(budget._id, expenseCategories);

  // Importar transacciones de cada mes
  for (let month = 1; month <= 12; month++) {
    const monthName = getMonthName(month);
    const monthSheet = workbook.Sheets[monthName];

    if (monthSheet) {
      const transactions = extractTransactions(monthSheet, month);
      await createTransactions(budget._id, transactions);
    }
  }

  return budget;
}
```

---

## Variables de Entorno

```env
# .env.local
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/annual-budget
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# Para producción
NEXT_PUBLIC_APP_URL=https://your-app.com
```

---

## Consideraciones de Seguridad

1. **Validación de Datos**: Todas las entradas deben ser validadas con Zod
2. **Sanitización**: Prevenir XSS y injection attacks
3. **Rate Limiting**: Limitar requests por usuario
4. **HTTPS**: Solo en producción
5. **CSP Headers**: Content Security Policy
6. **CORS**: Configuración adecuada
7. **Passwords**: Hashing con bcrypt
8. **Sessions**: Manejo seguro con NextAuth.js

---

## Monitoreo y Analytics

1. **Vercel Analytics**: Performance metrics
2. **Google Analytics**: User behavior
3. **Sentry**: Error tracking
4. **MongoDB Atlas Monitoring**: Database performance
5. **Custom Events**: Track feature usage

---

## Backup y Recovery

1. **MongoDB Atlas**: Automated backups
2. **Export Feature**: Permitir a usuarios exportar sus datos
3. **Data Retention**: Política de retención de datos
4. **GDPR Compliance**: Derecho al olvido

---

## Roadmap Futuro (Post-Launch)

### Versión 2.0
- [ ] Multi-currency support
- [ ] Shared budgets (familia/pareja)
- [ ] Mobile app (React Native)
- [ ] Import from bank APIs (Plaid)
- [ ] AI-powered insights
- [ ] Budget templates
- [ ] Goal tracking with notifications
- [ ] Receipt scanning (OCR)
- [ ] Integration con Stripe para payments
- [ ] White-label solution

### Versión 3.0
- [ ] Investment tracking
- [ ] Tax planning tools
- [ ] Financial advisor integration
- [ ] Cryptocurrency tracking
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Custom reports
- [ ] Export to PDF

---

## Estimación de Costos Mensuales

### Infraestructura
- **Vercel**: $0 - $20/mes (Hobby/Pro)
- **MongoDB Atlas**: $0 - $57/mes (Free tier - M10)
- **NextAuth.js**: Gratis
- **Sentry**: $0 - $26/mes (Free - Team)

### Total estimado: $0 - $100/mes (según escala)

---

## Conclusión

Este plan detallado cubre toda la conversión del Excel a SaaS, manteniendo:
- ✅ Todas las funcionalidades del archivo original
- ✅ Todas las fórmulas convertidas a lógica TypeScript
- ✅ Todas las relaciones entre datos
- ✅ Todos los cálculos automáticos
- ✅ UX mejorada con interfaz moderna
- ✅ Escalabilidad y multi-tenant
- ✅ Seguridad y autenticación
- ✅ Performance optimizado

El proyecto está listo para comenzar la implementación siguiendo el plan por fases.
