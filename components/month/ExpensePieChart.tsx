"use client";

import { useMemo } from "react";
import {
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { Transaction, SerializableExpenseCategory } from "@/types";

interface ExpensePieChartProps {
  transactions: Transaction[];
  expenseCategories: SerializableExpenseCategory[];
  currencySymbol: string;
}

// Color palette for the pie chart
const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "hsl(142, 76%, 36%)",
  "hsl(221, 83%, 53%)",
  "hsl(262, 83%, 58%)",
  "hsl(291, 64%, 42%)",
  "hsl(24, 70%, 50%)",
];

export function ExpensePieChart({
  transactions,
  expenseCategories,
  currencySymbol,
}: ExpensePieChartProps) {
  const chartData = useMemo(() => {
    // Filter only expense transactions
    const expenseTransactions = transactions.filter(
      (t) => t.type === "expense"
    );

    // Calculate total by category
    const categoryTotals = new Map<
      string,
      { name: string; value: number; category: string }
    >();

    expenseTransactions.forEach((transaction) => {
      const existing = categoryTotals.get(transaction.categoryId.toString());
      if (existing) {
        existing.value += transaction.amount;
      } else {
        // Find the category to get its type (needs/wants/savings)
        const category = expenseCategories.find(
          (cat) => cat._id === transaction.categoryId.toString()
        );
        categoryTotals.set(transaction.categoryId.toString(), {
          name: transaction.categoryName,
          value: transaction.amount,
          category: category?.category || "wants",
        });
      }
    });

    // Convert to array and sort by value (descending)
    return Array.from(categoryTotals.values()).sort(
      (a, b) => b.value - a.value
    );
  }, [transactions, expenseCategories]);

  const chartConfig = useMemo(() => {
    const config: ChartConfig = {};
    chartData.forEach((item, index) => {
      config[item.name] = {
        label: item.name,
        color: COLORS[index % COLORS.length],
      };
    });
    return config;
  }, [chartData]);

  const totalExpenses = chartData.reduce((sum, item) => sum + item.value, 0);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Expenses by Category</CardTitle>
          <CardDescription>Breakdown of your expenses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No expense data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expenses by Category</CardTitle>
        <CardDescription>
          Total: {currencySymbol}
          {totalExpenses.toFixed(2)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{name}:</span>
                        <span className="font-bold">
                          {currencySymbol}
                          {Number(value).toFixed(2)}
                        </span>
                        <span className="text-muted-foreground">
                          ({((Number(value) / totalExpenses) * 100).toFixed(1)}
                          %)
                        </span>
                      </div>
                    )}
                  />
                }
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }) =>
                  percent! > 0.05
                    ? `${name} (${(percent! * 100).toFixed(0)}%)`
                    : ""
                }
                labelLine={{ stroke: "var(--foreground)", strokeWidth: 1 }}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    stroke="var(--background)"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value, entry: any) => {
                  const amount = entry.payload.value;
                  return `${value}: ${currencySymbol}${amount.toFixed(2)}`;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
