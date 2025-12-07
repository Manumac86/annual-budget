"use client";

import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Calendar, TrendingDown } from "lucide-react";
import type { RecurringTransaction } from "@/types";
import { addDays, addWeeks, addMonths, addYears } from "date-fns";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Helper function to calculate next occurrence
function calculateNextOccurrence(transaction: RecurringTransaction): Date | null {
  const startDate = new Date(transaction.startDate);
  const endDate = transaction.endDate ? new Date(transaction.endDate) : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // If end date is in the past, no future occurrences
  if (endDate && endDate < today) {
    return null;
  }

  // If start date is in the future, return start date
  if (startDate > today) {
    return startDate;
  }

  let nextDate = new Date(startDate);

  switch (transaction.frequency) {
    case "daily":
      while (nextDate <= today) {
        nextDate = addDays(nextDate, 1);
      }
      break;
    case "weekly":
      while (nextDate <= today) {
        nextDate = addWeeks(nextDate, 1);
      }
      break;
    case "biweekly":
      while (nextDate <= today) {
        nextDate = addWeeks(nextDate, 2);
      }
      break;
    case "monthly":
      while (nextDate <= today) {
        nextDate = addMonths(nextDate, 1);
      }
      if (transaction.dayOfMonth) {
        nextDate.setDate(transaction.dayOfMonth);
      }
      break;
    case "yearly":
      while (nextDate <= today) {
        nextDate = addYears(nextDate, 1);
      }
      break;
    default:
      return null;
  }

  // Check if next occurrence is after end date
  if (endDate && nextDate > endDate) {
    return null;
  }

  return nextDate;
}

// Helper function to get "days until" text
function getDaysUntilText(nextDate: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysUntil = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntil === 0) return "Today";
  if (daysUntil === 1) return "Tomorrow";
  return `In ${daysUntil} days`;
}

interface UpcomingTransactionsProps {
  budgetId: string;
  currencySymbol: string;
}

export function UpcomingTransactions({
  budgetId,
  currencySymbol,
}: UpcomingTransactionsProps) {
  const { data, isLoading, error } = useSWR<{
    recurringTransactions: RecurringTransaction[];
  }>(`/api/recurring-transactions?budgetId=${budgetId}`, fetcher);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Recurring Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Recurring Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Failed to load recurring expenses
          </p>
        </CardContent>
      </Card>
    );
  }

  const activeExpenses = data.recurringTransactions
    .filter((t) => t.isActive && t.type === "expense")
    .slice(0, 5); // Show only first 5

  if (activeExpenses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Recurring Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No recurring expenses set up yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Recurring Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activeExpenses.map((transaction) => {
            const nextDate = calculateNextOccurrence(transaction);

            return (
              <div
                key={transaction._id.toString()}
                className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-medium">{transaction.categoryName}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span className="capitalize">{transaction.frequency}</span>
                      {transaction.description && (
                        <>
                          <span>•</span>
                          <span>{transaction.description}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-red-600">
                    -{currencySymbol}
                    {transaction.amount.toFixed(2)}
                  </div>
                  {nextDate && (
                    <p className="text-xs text-muted-foreground">
                      {getDaysUntilText(nextDate)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
