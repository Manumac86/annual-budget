"use client";

import { Calendar, TrendingUp } from "lucide-react";
import useSWR from "swr";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface UpcomingPayment {
  _id: string;
  description: string;
  categoryName: string;
  amount: number;
  type: "income" | "expense";
  frequency: string;
  nextDate: string;
  daysUntil: number;
}

interface UpcomingPaymentsProps {
  budgetId: string;
  currencySymbol: string;
}

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  });

export function UpcomingPayments({ budgetId, currencySymbol }: UpcomingPaymentsProps) {
  const { data, isLoading } = useSWR<{ upcomingPayments: UpcomingPayment[] }>(
    `/api/dashboard/upcoming-payments?budgetId=${budgetId}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutes
    }
  );

  // Filter to show only income
  const upcomingIncome = (data?.upcomingPayments || []).filter(
    (payment) => payment.type === "income"
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getDaysText = (days: number) => {
    if (days === 0) return "Today";
    if (days === 1) return "Tomorrow";
    return `In ${days} days`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Income</CardTitle>
          <CardDescription>Loading upcoming income...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                </div>
                <div className="h-4 bg-muted rounded animate-pulse w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (upcomingIncome.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Income</CardTitle>
          <CardDescription>Next scheduled recurring income</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No upcoming income scheduled</p>
            <p className="text-sm mt-2">
              Set up recurring income transactions to see them here.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Income</CardTitle>
        <CardDescription>Next {upcomingIncome.length} scheduled income transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {upcomingIncome.map((payment: UpcomingPayment) => (
            <div
              key={payment._id}
              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                <TrendingUp className="h-5 w-5" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{payment.description}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="truncate">{payment.categoryName}</span>
                  <span>•</span>
                  <span>{formatDate(payment.nextDate)}</span>
                </div>
              </div>

              <div className="text-right">
                <p className="font-semibold text-green-600 dark:text-green-400">
                  +{currencySymbol}
                  {payment.amount.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {getDaysText(payment.daysUntil)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
