"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Transaction, SerializableIncomeCategory, SerializableExpenseCategory } from "@/types";

interface CashFlowSummaryProps {
  transactions: Transaction[];
  incomeCategories: SerializableIncomeCategory[];
  expenseCategories: SerializableExpenseCategory[];
  currencySymbol: string;
  previousMonthBalance?: number;
}

export function CashFlowSummary({
  transactions,
  incomeCategories,
  expenseCategories,
  currencySymbol,
  previousMonthBalance = 0,
}: CashFlowSummaryProps) {
  // Calculate projected income/expenses
  const projectedIncome = incomeCategories.reduce(
    (sum, cat) => sum + cat.projectedAmount,
    0
  );

  const projectedExpenses = expenseCategories.reduce(
    (sum, cat) => sum + cat.projectedAmount,
    0
  );

  // Calculate actual income/expenses from transactions
  const actualIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const actualExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  // Calculate balances
  const projectedBalance = projectedIncome - projectedExpenses;
  const actualBalance = actualIncome - actualExpenses;
  const currentBalance = previousMonthBalance + actualBalance;

  // Calculate variance
  const incomeVariance = actualIncome - projectedIncome;
  const expenseVariance = actualExpenses - projectedExpenses;

  const formatAmount = (amount: number) => {
    return `${currencySymbol}${Math.abs(amount).toFixed(2)}`;
  };

  const getVarianceColor = (variance: number, isIncome: boolean) => {
    if (variance === 0) return "text-muted-foreground";
    if (isIncome) {
      return variance > 0 ? "text-chart-1" : "text-chart-5";
    } else {
      return variance > 0 ? "text-chart-5" : "text-chart-1";
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Income Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Income</CardTitle>
          <span className="text-xs text-muted-foreground">
            of {formatAmount(projectedIncome)}
          </span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-chart-1">
            {formatAmount(actualIncome)}
          </div>
          <p
            className={`text-xs ${getVarianceColor(incomeVariance, true)} mt-1`}
          >
            {incomeVariance >= 0 ? "+" : ""}
            {formatAmount(incomeVariance)} vs projected
          </p>
        </CardContent>
      </Card>

      {/* Expenses Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Expenses</CardTitle>
          <span className="text-xs text-muted-foreground">
            of {formatAmount(projectedExpenses)}
          </span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-chart-5">
            {formatAmount(actualExpenses)}
          </div>
          <p
            className={`text-xs ${getVarianceColor(expenseVariance, false)} mt-1`}
          >
            {expenseVariance >= 0 ? "+" : ""}
            {formatAmount(expenseVariance)} vs projected
          </p>
        </CardContent>
      </Card>

      {/* Monthly Balance Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Balance</CardTitle>
          <span className="text-xs text-muted-foreground">
            projected: {formatAmount(projectedBalance)}
          </span>
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${
              actualBalance >= 0 ? "text-chart-1" : "text-chart-5"
            }`}
          >
            {actualBalance >= 0 ? "+" : "-"}
            {formatAmount(actualBalance)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Income - Expenses
          </p>
        </CardContent>
      </Card>

      {/* Current Balance Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Current Balance
          </CardTitle>
          {previousMonthBalance !== 0 && (
            <span className="text-xs text-muted-foreground">
              prev: {formatAmount(previousMonthBalance)}
            </span>
          )}
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${
              currentBalance >= 0 ? "text-chart-1" : "text-chart-5"
            }`}
          >
            {currentBalance >= 0 ? "" : "-"}
            {formatAmount(currentBalance)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Including rollover
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
