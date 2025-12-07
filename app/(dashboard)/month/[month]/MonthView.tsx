"use client";

import { useState } from "react";
import { MonthSelector } from "@/components/month/MonthSelector";
import { CashFlowSummary } from "@/components/month/CashFlowSummary";
import { TransactionForm } from "@/components/month/TransactionForm";
import { TransactionList } from "@/components/month/TransactionList";
import { ExpensePieChart } from "@/components/month/ExpensePieChart";
import { IncomePieChart } from "@/components/month/IncomePieChart";
import { GenerateRecurringButton } from "@/components/month/GenerateRecurringButton";
import { useTransactions } from "@/hooks/useTransactions";
import { useIncomeCategories, useExpenseCategories } from "@/hooks/useCategories";
import type { Transaction } from "@/types";

interface MonthViewProps {
  month: number;
  year: number;
  budgetId: string;
  currencySymbol: string;
  rolloverEnabled: boolean;
}

export function MonthView({
  month,
  year,
  budgetId,
  currencySymbol,
  rolloverEnabled,
}: MonthViewProps) {
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Fetch data using SWR hooks
  const { transactions, isLoading: transactionsLoading } = useTransactions(
    budgetId,
    month,
    year
  );

  const { categories: incomeCategories, isLoading: incomeCategoriesLoading } =
    useIncomeCategories(budgetId);

  const {
    categories: expenseCategories,
    isLoading: expenseCategoriesLoading,
  } = useExpenseCategories(budgetId);

  // Calculate previous month balance (for rollover)
  const { transactions: previousMonthTransactions } = useTransactions(
    rolloverEnabled ? budgetId : null,
    month === 1 ? 12 : month - 1,
    month === 1 ? year - 1 : year
  );

  const previousMonthBalance = rolloverEnabled
    ? previousMonthTransactions.reduce((balance, t) => {
        return balance + (t.type === "income" ? t.amount : -t.amount);
      }, 0)
    : 0;

  const isLoading =
    transactionsLoading || incomeCategoriesLoading || expenseCategoriesLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <MonthSelector currentMonth={month} year={year} />
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <MonthSelector currentMonth={month} year={year} />
        <GenerateRecurringButton
          budgetId={budgetId}
          month={month}
          year={year}
        />
      </div>

      <CashFlowSummary
        transactions={transactions}
        incomeCategories={incomeCategories}
        expenseCategories={expenseCategories}
        currencySymbol={currencySymbol}
        previousMonthBalance={previousMonthBalance}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <TransactionForm
          budgetId={budgetId}
          month={month}
          year={year}
          incomeCategories={incomeCategories}
          expenseCategories={expenseCategories}
          transaction={editingTransaction}
          onSuccess={() => setEditingTransaction(null)}
          onCancel={() => setEditingTransaction(null)}
        />

        <TransactionList
          transactions={transactions}
          currencySymbol={currencySymbol}
          onEdit={(transaction) => setEditingTransaction(transaction)}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <IncomePieChart
          transactions={transactions}
          incomeCategories={incomeCategories}
          currencySymbol={currencySymbol}
        />
        <ExpensePieChart
          transactions={transactions}
          expenseCategories={expenseCategories}
          currencySymbol={currencySymbol}
        />
      </div>
    </div>
  );
}
