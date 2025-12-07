import { z } from "zod";

// User Settings Schema
export const userSettingsSchema = z.object({
  country: z.string().min(1, "Country is required"),
  currency: z.string().min(1, "Currency is required"),
  currencySymbol: z.string().min(1, "Currency symbol is required"),
  startingMonth: z.number().min(1).max(12),
  year: z.number().min(2020).max(2100),
  rolloverEnabled: z.boolean(),
});

export type UserSettingsInput = z.infer<typeof userSettingsSchema>;

// Budget Creation Schema
export const budgetCreateSchema = z.object({
  year: z.number().min(2020).max(2100),
  name: z.string().min(1, "Budget name is required"),
});

export type BudgetCreateInput = z.infer<typeof budgetCreateSchema>;

// Income Category Schema
export const incomeCategorySchema = z.object({
  budgetId: z.string().min(1, "Budget ID is required"),
  name: z.string().min(1, "Category name is required"),
  projectedAmount: z.number().min(0, "Amount must be positive"),
  order: z.number().min(0).optional(),
});

export type IncomeCategoryInput = z.infer<typeof incomeCategorySchema>;

// Expense Category Schema
export const expenseCategorySchema = z.object({
  budgetId: z.string().min(1, "Budget ID is required"),
  name: z.string().min(1, "Category name is required"),
  projectedAmount: z.number().min(0, "Amount must be positive"),
  category: z.enum(["needs", "wants", "savings"], {
    message: "Must be needs, wants, or savings",
  }),
  order: z.number().min(0).optional(),
});

export type ExpenseCategoryInput = z.infer<typeof expenseCategorySchema>;

// Setup Form Schema (combines all setup data)
export const setupFormSchema = z.object({
  // User Settings
  country: z.string().min(1, "Please select a country"),
  currency: z.string().min(1, "Currency is required"),
  currencySymbol: z.string().min(1),
  startingMonth: z.number().min(1).max(12),
  year: z.number().min(2020).max(2100),
  rolloverEnabled: z.boolean(),

  // Budget
  budgetName: z.string().min(1, "Budget name is required"),

  // Income Categories (array)
  incomeCategories: z
    .array(
      z.object({
        name: z.string().min(1, "Category name is required"),
        projectedAmount: z.number().min(0, "Amount must be positive"),
      })
    )
    .min(1, "At least one income category is required"),

  // Expense Categories (array)
  expenseCategories: z
    .array(
      z.object({
        name: z.string().min(1, "Category name is required"),
        projectedAmount: z.number().min(0, "Amount must be positive"),
        category: z.enum(["needs", "wants", "savings"]),
      })
    )
    .min(1, "At least one expense category is required"),
});

export type SetupFormInput = z.infer<typeof setupFormSchema>;

// Transaction Schema
export const transactionCreateSchema = z.object({
  budgetId: z.string().min(1, "Budget ID is required"),
  date: z.union([z.date(), z.string().transform((str) => new Date(str))]),
  type: z.enum(["income", "expense"]),
  categoryId: z.string().min(1, "Category is required"),
  categoryName: z.string().min(1),
  amount: z.number().positive("Amount must be positive"),
  description: z.string().optional(),
  isRecurring: z.boolean().default(false),
  recurringId: z.string().optional(),
  // Optional account linking
  accountId: z.string().optional(),
  accountName: z.string().optional(),
});

export type TransactionCreateInput = z.infer<typeof transactionCreateSchema>;

// Account Transaction Schema (Transfer, Interest, Adjustment)
export const accountTransactionSchema = z.object({
  budgetId: z.string().min(1, "Budget ID is required"),
  accountId: z.string().min(1, "Account is required"),
  accountName: z.string().min(1),
  type: z.enum(["transfer", "interest", "adjustment"]),
  amount: z.number(),
  date: z.union([z.date(), z.string().transform((str) => new Date(str))]),
  description: z.string().optional(),
  // For transfers
  toAccountId: z.string().optional(),
  toAccountName: z.string().optional(),
});

export type AccountTransactionInput = z.infer<typeof accountTransactionSchema>;

// Recurring Transaction Schema
export const recurringTransactionSchema = z.object({
  budgetId: z.string().min(1, "Budget ID is required"),
  type: z.enum(["income", "expense"]),
  categoryId: z.string().min(1, "Category is required"),
  categoryName: z.string().min(1),
  amount: z.number().positive("Amount must be positive"),
  description: z.string().optional(),
  frequency: z.enum(["daily", "weekly", "biweekly", "monthly", "yearly"]),
  startDate: z.union([z.date(), z.string().transform((str) => new Date(str))]),
  endDate: z.union([z.date(), z.string().transform((str) => new Date(str))]).optional(),
  dayOfMonth: z.number().min(1).max(31).optional(),
  isSubscription: z.boolean().optional(),
});

export type RecurringTransactionInput = z.infer<
  typeof recurringTransactionSchema
>;
