"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import useSWR from "swr";
import type { Transaction } from "@/types";
import { TransactionForm } from "@/components/month/TransactionForm";
import { useIncomeCategories } from "@/hooks/useCategories";
import { useExpenseCategories } from "@/hooks/useCategories";

interface CalendarViewProps {
  budgetId: string;
  currencySymbol: string;
  year: number;
}

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  });

export function CalendarView({
  budgetId,
  currencySymbol,
  year,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [showAddTransaction, setShowAddTransaction] = useState(false);

  const month = currentDate.getMonth() + 1;
  const displayYear = currentDate.getFullYear();

  // Fetch transactions for the current month
  const { data, isLoading, mutate } = useSWR<{
    transactionsByDay: Record<string, Transaction[]>;
  }>(
    `/api/calendar/transactions?budgetId=${budgetId}&month=${month}&year=${displayYear}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000,
    }
  );

  // Fetch categories
  const { categories: incomeCategories } = useIncomeCategories(budgetId);
  const { categories: expenseCategories } = useExpenseCategories(budgetId);

  const transactionsByDay = data?.transactionsByDay || {};

  const handlePreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
    setSelectedDate(undefined);
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
    setSelectedDate(undefined);
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      setShowAddTransaction(false);
    }
  };

  const handleAddTransaction = () => {
    setShowAddTransaction(true);
  };

  const getDayTransactions = (day: number) => {
    return transactionsByDay[day.toString()] || [];
  };

  const getDayTotal = (day: number, type: "income" | "expense") => {
    const transactions = getDayTransactions(day);
    return transactions
      .filter((t) => t.type === type)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const selectedDayTransactions = selectedDate
    ? getDayTransactions(selectedDate.getDate())
    : [];

  const monthName = currentDate.toLocaleDateString("en-US", { month: "long" });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Calendar</h1>
          <p className="text-muted-foreground">
            View and manage transactions across the year
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {monthName} {displayYear}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousMonth}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(new Date())}
                >
                  Today
                </Button>
                <Button variant="outline" size="sm" onClick={handleNextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <CardDescription>
              Click on a date to view transactions or add new ones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              month={currentDate}
              onMonthChange={setCurrentDate}
              className="rounded-md border w-full [--cell-size:4rem]"
              modifiers={{
                hasTransactions: (date) => {
                  if (
                    date.getMonth() !== currentDate.getMonth() ||
                    date.getFullYear() !== displayYear
                  ) {
                    return false;
                  }
                  const day = date.getDate();
                  return getDayTransactions(day).length > 0;
                },
              }}
              modifiersClassNames={{
                hasTransactions: "bg-primary/10 font-semibold",
              }}
              components={{
                DayButton: ({ day, modifiers, ...props }) => {
                  const date = day.date;
                  const dayNum = date.getDate();
                  const isCurrentMonth =
                    date.getMonth() === currentDate.getMonth() &&
                    date.getFullYear() === displayYear;
                  const transactions = isCurrentMonth
                    ? getDayTransactions(dayNum)
                    : [];
                  const income = isCurrentMonth
                    ? getDayTotal(dayNum, "income")
                    : 0;
                  const expenses = isCurrentMonth
                    ? getDayTotal(dayNum, "expense")
                    : 0;

                  return (
                    <Button
                      variant="ghost"
                      size="lg"
                      {...props}
                      className="flex aspect-square h-auto w-full flex-col gap-1 font-normal leading-none"
                    >
                      <span className="pt-4 text-sm">{dayNum}</span>
                      <div className="flex flex-col flex-1 h-full items-center justify-center p-1">
                        {transactions.length > 0 && (
                          <div className="flex flex-col gap-1 w-full justify-center items-center">
                            {income > 0 && (
                              <>
                                <div className="h-1 w-4 rounded-full bg-green-500" />
                                <span className="text-sm">
                                  {currencySymbol}
                                  {income.toFixed(0)}
                                </span>
                              </>
                            )}
                            {expenses > 0 && (
                              <>
                                <div className="h-1 w-4 rounded-full bg-red-500" />
                                <span className="text-sm">
                                  {currencySymbol}
                                  {expenses.toFixed(0)}
                                </span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </Button>
                  );
                },
              }}
            />

            <div className="mt-4 flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span>Income</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <span>Expenses</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected Date Details */}
        <div className="space-y-4">
          {selectedDate ? (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>
                        {selectedDate.toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                        })}
                      </CardTitle>
                      <CardDescription>
                        {selectedDayTransactions.length} transaction
                        {selectedDayTransactions.length !== 1 ? "s" : ""}
                      </CardDescription>
                    </div>
                    <Button size="sm" onClick={handleAddTransaction}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedDayTransactions.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No transactions on this date
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {selectedDayTransactions.map((transaction) => (
                        <div
                          key={transaction._id.toString()}
                          className="flex items-start justify-between p-3 rounded-lg border"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  transaction.type === "income"
                                    ? "default"
                                    : "destructive"
                                }
                              >
                                {transaction.type}
                              </Badge>
                              <span className="font-medium">
                                {transaction.categoryName}
                              </span>
                            </div>
                            {transaction.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {transaction.description}
                              </p>
                            )}
                          </div>
                          <div
                            className={`font-semibold ${
                              transaction.type === "income"
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {transaction.type === "income" ? "+" : "-"}
                            {currencySymbol}
                            {transaction.amount.toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {showAddTransaction && (
                <Card>
                  <CardHeader>
                    <CardTitle>Add Transaction</CardTitle>
                    <CardDescription>
                      Create a new transaction for{" "}
                      {selectedDate.toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TransactionForm
                      budgetId={budgetId}
                      month={selectedDate.getMonth() + 1}
                      year={selectedDate.getFullYear()}
                      incomeCategories={incomeCategories}
                      expenseCategories={expenseCategories}
                      onSuccess={() => {
                        mutate();
                        setShowAddTransaction(false);
                      }}
                      onCancel={() => setShowAddTransaction(false)}
                    />
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Select a Date</CardTitle>
                <CardDescription>
                  Click on a date in the calendar to view or add transactions
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center py-12 text-muted-foreground">
                <p>No date selected</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
