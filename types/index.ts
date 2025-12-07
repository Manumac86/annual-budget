import { ObjectId } from "mongodb";

// User types
export interface User {
  _id: ObjectId;
  clerkId: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  settings?: UserSettings;
}

export interface UserSettings {
  country: string;
  currency: string;
  currencySymbol: string;
  startingMonth: number;
  year: number;
  rolloverEnabled: boolean;
}

// Budget types
export interface Budget {
  _id: ObjectId;
  userId: ObjectId;
  clerkId: string;
  year: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetCreate {
  userId: ObjectId;
  clerkId: string;
  year: number;
  name: string;
}

// Category types
export interface IncomeCategory {
  _id: ObjectId;
  budgetId: ObjectId;
  name: string;
  projectedAmount: number;
  order: number;
  createdAt: Date;
}

export interface ExpenseCategory {
  _id: ObjectId;
  budgetId: ObjectId;
  name: string;
  projectedAmount: number;
  category: "needs" | "wants" | "savings";
  order: number;
  createdAt: Date;
}

export interface CategoryCreate {
  budgetId: ObjectId;
  name: string;
  projectedAmount: number;
  order: number;
}

export interface ExpenseCategoryCreate extends CategoryCreate {
  category: "needs" | "wants" | "savings";
}

// Serializable category types (for passing to client components)
export interface SerializableIncomeCategory {
  _id: string;
  budgetId: string;
  name: string;
  projectedAmount: number;
  order: number;
  createdAt: Date;
}

export interface SerializableExpenseCategory {
  _id: string;
  budgetId: string;
  name: string;
  projectedAmount: number;
  category: "needs" | "wants" | "savings";
  order: number;
  createdAt: Date;
}

// Transaction types
export interface Transaction {
  _id: ObjectId;
  budgetId: ObjectId;
  date: Date;
  type: "income" | "expense";
  categoryId: ObjectId;
  categoryName: string;
  amount: number;
  description?: string;
  isRecurring: boolean;
  recurringId?: ObjectId;
  month: number;
  year: number;
  // Account tracking fields (optional for backward compatibility)
  accountId?: ObjectId;
  accountName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionCreate {
  budgetId: string;
  date: Date;
  type: "income" | "expense";
  categoryId: string;
  categoryName: string;
  amount: number;
  description?: string;
  isRecurring?: boolean;
  recurringId?: string;
  // Optional account linking
  accountId?: string;
  accountName?: string;
}

export interface TransactionUpdate {
  date?: Date;
  type?: "income" | "expense";
  categoryId?: string;
  categoryName?: string;
  amount?: number;
  description?: string;
  accountId?: string;
  accountName?: string;
}

// Account Transaction types (Transfer, Interest, Adjustment)
export interface AccountTransaction {
  _id: ObjectId;
  budgetId: ObjectId;
  accountId: ObjectId;
  accountName: string;
  type: "transfer" | "interest" | "adjustment";
  amount: number;
  date: Date;
  month: number;
  year: number;
  description?: string;
  // For transfers only
  toAccountId?: ObjectId;
  toAccountName?: string;
  transferId?: ObjectId; // Links the pair of transfer transactions
  transferDirection?: "out" | "in"; // Which side of the transfer
  createdAt: Date;
  updatedAt: Date;
}

export interface AccountTransactionCreate {
  budgetId: string;
  accountId: string;
  accountName: string;
  type: "transfer" | "interest" | "adjustment";
  amount: number;
  date: Date;
  description?: string;
  // For transfers
  toAccountId?: string;
  toAccountName?: string;
}

// Monthly Account Summary (for the account tracker table)
export interface MonthlyAccountSummary {
  accountId: string;
  accountName: string;
  accountType: string;
  startBalance: number;
  incoming: number; // IN column
  outgoing: number; // OUT column
  transfers: number; // Net transfers (in - out)
  interest: number;
  adjustments: number;
  endBalance: number; // Calculated balance
}

// Recurring transaction types
export interface RecurringTransaction {
  _id: ObjectId;
  budgetId: ObjectId;
  type: "income" | "expense";
  categoryId: ObjectId;
  categoryName: string;
  amount: number;
  description?: string;
  frequency: "daily" | "weekly" | "biweekly" | "monthly" | "yearly";
  startDate: Date;
  endDate?: Date;
  dayOfMonth?: number;
  isActive: boolean;
  isSubscription: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecurringTransactionCreate {
  budgetId: string;
  type: "income" | "expense";
  categoryId: string;
  categoryName: string;
  amount: number;
  description?: string;
  frequency: "daily" | "weekly" | "biweekly" | "monthly" | "yearly";
  startDate: Date;
  endDate?: Date;
  dayOfMonth?: number;
  isSubscription?: boolean;
}

// Account types
export interface Account {
  _id: ObjectId;
  budgetId: ObjectId;
  name: string;
  type: "checking" | "savings" | "credit" | "investment" | "other";
  balance: number;
  currency: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Subscription types
export interface Subscription {
  _id: ObjectId;
  budgetId: ObjectId;
  name: string;
  amount: number;
  billingCycle: "monthly" | "yearly";
  nextBillingDate: Date;
  category: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionCreate {
  budgetId: string;
  name: string;
  amount: number;
  billingCycle: "monthly" | "yearly";
  nextBillingDate: Date;
  category: string;
}

export interface SubscriptionUpdate {
  name?: string;
  amount?: number;
  billingCycle?: "monthly" | "yearly";
  nextBillingDate?: Date;
  category?: string;
  isActive?: boolean;
}

// Savings goal types
export interface SavingsContribution {
  date: Date;
  amount: number;
  type: "deposit" | "withdrawal";
  note?: string;
}

export interface SavingsGoal {
  _id: ObjectId;
  budgetId: ObjectId;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: Date;
  priority: "low" | "medium" | "high";
  isCompleted: boolean;
  contributions: SavingsContribution[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SavingsGoalCreate {
  budgetId: string;
  name: string;
  targetAmount: number;
  currentAmount?: number;
  deadline?: Date;
  priority: "low" | "medium" | "high";
}

export interface SavingsGoalUpdate {
  name?: string;
  targetAmount?: number;
  currentAmount?: number;
  deadline?: Date;
  priority?: "low" | "medium" | "high";
  isCompleted?: boolean;
  contributions?: SavingsContribution[];
}

// Net worth types
export interface NetWorthEntry {
  _id: ObjectId;
  budgetId: ObjectId;
  date: Date;
  assets: {
    cash: number;
    investments: number;
    realEstate: number;
    other: number;
    total: number;
  };
  liabilities: {
    creditCards: number;
    loans: number;
    mortgages: number;
    other: number;
    total: number;
  };
  netWorth: number;
  createdAt: Date;
}

// Response types for API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Monthly summary types
export interface MonthlySummary {
  month: number;
  year: number;
  income: {
    projected: number;
    actual: number;
  };
  expenses: {
    projected: number;
    actual: number;
  };
  balance: number;
  rollover: number;
}

// 50/30/20 Rule types
export interface BudgetRule503020 {
  monthlyIncome: number;
  needs: {
    budgeted: number;
    actual: number;
    percentage: number;
  };
  wants: {
    budgeted: number;
    actual: number;
    percentage: number;
  };
  savings: {
    budgeted: number;
    actual: number;
    percentage: number;
  };
}
