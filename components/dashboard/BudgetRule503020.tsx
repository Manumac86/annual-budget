"use client";

import useSWR from "swr";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface BudgetRule503020Props {
  budgetId: string;
  month: number;
  year: number;
  currencySymbol: string;
}

interface BudgetData {
  projected: {
    needs: number;
    wants: number;
    savings: number;
    total: number;
  };
  actual: {
    needs: number;
    wants: number;
    savings: number;
    total: number;
  };
  percentages: {
    needs: number;
    wants: number;
    savings: number;
  };
  totalIncome: number;
}

export function BudgetRule503020({
  budgetId,
  month,
  year,
  currencySymbol,
}: BudgetRule503020Props) {
  const { data, isLoading, error } = useSWR<BudgetData>(
    `/api/budget/503020?budgetId=${budgetId}&month=${month}&year=${year}`,
    fetcher
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>50/30/20 Budget Rule</CardTitle>
          <CardDescription>Needs / Wants / Savings</CardDescription>
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
          <CardTitle>50/30/20 Budget Rule</CardTitle>
          <CardDescription>Needs / Wants / Savings</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Failed to load budget data
          </p>
        </CardContent>
      </Card>
    );
  }

  const { percentages, actual, totalIncome } = data;

  const categories = [
    {
      name: "Needs",
      target: 50,
      actual: percentages.needs,
      amount: actual.needs,
      color: "bg-blue-500",
      description: "50% of income for necessities",
    },
    {
      name: "Wants",
      target: 30,
      actual: percentages.wants,
      amount: actual.wants,
      color: "bg-purple-500",
      description: "30% of income for lifestyle",
    },
    {
      name: "Savings",
      target: 20,
      actual: percentages.savings,
      amount: actual.savings,
      color: "bg-green-500",
      description: "20% of income for future",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>50/30/20 Budget Rule</CardTitle>
        <CardDescription>
          Track your spending against the 50/30/20 guideline
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {categories.map((category) => {
            const isOverBudget = category.actual > category.target;
            const progressValue = Math.min(
              (category.actual / category.target) * 100,
              100
            );

            return (
              <div key={category.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{category.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {category.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {category.actual.toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {currencySymbol}
                      {category.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="space-y-1">
                  <Progress
                    value={progressValue}
                    className="h-2"
                    indicatorClassName={
                      isOverBudget ? "bg-red-500" : category.color
                    }
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Target: {category.target}%</span>
                    {isOverBudget && (
                      <span className="text-red-500 font-medium">
                        Over by {(category.actual - category.target).toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {totalIncome > 0 && (
            <div className="pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Monthly Income:</span>
                <span className="font-semibold">
                  {currencySymbol}
                  {totalIncome.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
