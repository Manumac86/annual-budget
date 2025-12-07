"use client";

import { useState } from "react";
import { useBreakdown } from "@/hooks/useBreakdown";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from "recharts";

interface BreakdownViewProps {
  budgetId: string;
  currencySymbol: string;
  year: number;
}

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const COLORS = {
  income: "var(--color-chart-4)",
  expense: "var(--color-chart-5)",
  needs: "var(--color-chart-1)",
  wants: "var(--color-chart-2)",
  savings: "var(--color-chart-3)",
};

export function BreakdownView({
  budgetId,
  currencySymbol,
  year,
}: BreakdownViewProps) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const { breakdown, isLoading } = useBreakdown(budgetId, selectedMonth, year);

  const chartConfig = {
    amount: {
      label: "Amount",
      color: "var(--color-chart-1)",
    },
  } satisfies ChartConfig;

  // Prepare data for expense pie chart
  const expensePieData =
    breakdown?.expenseBreakdown
      .filter((cat) => cat.actual > 0)
      .map((cat) => ({
        name: cat.name,
        value: cat.actual,
        color:
          cat.category === "needs"
            ? COLORS.needs
            : cat.category === "wants"
            ? COLORS.wants
            : COLORS.savings,
      })) || [];

  // Prepare data for income pie chart
  const incomePieData =
    breakdown?.incomeBreakdown
      .filter((cat) => cat.actual > 0)
      .map((cat, index) => ({
        name: cat.name,
        value: cat.actual,
        fill: `hsl(var(--chart-${(index % 5) + 1}))`,
      })) || [];

  // Prepare data for 50/30/20 chart
  const ruleData = breakdown
    ? [
        {
          name: "Needs (50%)",
          value: breakdown.ruleBreakdown.needs.actual,
          fill: COLORS.needs,
        },
        {
          name: "Wants (30%)",
          value: breakdown.ruleBreakdown.wants.actual,
          fill: COLORS.wants,
        },
        {
          name: "Savings (20%)",
          value: breakdown.ruleBreakdown.savings.actual,
          fill: COLORS.savings,
        },
      ].filter((item) => item.value > 0)
    : [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Breakdown</h1>
          <p className="text-muted-foreground">Loading breakdown data...</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 bg-muted rounded animate-pulse w-1/3" />
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!breakdown) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Breakdown</h1>
          <p className="text-muted-foreground">Unable to load breakdown data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Breakdown</h1>
          <p className="text-muted-foreground">
            Detailed analysis of income and expenses
          </p>
        </div>
        <Select
          value={selectedMonth.toString()}
          onValueChange={(value) => setSelectedMonth(parseInt(value))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {months.map((month, index) => (
              <SelectItem key={index + 1} value={(index + 1).toString()}>
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {currencySymbol}
              {breakdown.totals.income.actual.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Projected: {currencySymbol}
              {breakdown.totals.income.projected.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {currencySymbol}
              {breakdown.totals.expense.actual.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Projected: {currencySymbol}
              {breakdown.totals.expense.projected.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                breakdown.totals.balance.actual >= 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {currencySymbol}
              {breakdown.totals.balance.actual.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Projected: {currencySymbol}
              {breakdown.totals.balance.projected.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Expense Breakdown Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Expense Distribution</CardTitle>
            <CardDescription>
              Breakdown by category for {months[selectedMonth - 1]}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {expensePieData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expensePieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={(entry) =>
                        `${entry.name}: ${currencySymbol}${entry.value.toFixed(
                          0
                        )}`
                      }
                    >
                      {expensePieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value) =>
                            `${currencySymbol}${Number(value).toFixed(2)}`
                          }
                        />
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No expense data for this month
              </div>
            )}
          </CardContent>
        </Card>

        {/* 50/30/20 Rule Chart */}
        <Card>
          <CardHeader>
            <CardTitle>50/30/20 Rule</CardTitle>
            <CardDescription>Needs, Wants, and Savings</CardDescription>
          </CardHeader>
          <CardContent>
            {ruleData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ruleData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={(entry) =>
                        `${
                          entry.name?.split(" ")[0]
                        }: ${currencySymbol}${entry.value.toFixed(0)}`
                      }
                    >
                      {ruleData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value) =>
                            `${currencySymbol}${Number(value).toFixed(2)}`
                          }
                        />
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No expense data for this month
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Income Table */}
      <Card>
        <CardHeader>
          <CardTitle>Income Categories</CardTitle>
          <CardDescription>
            Projected vs Actual breakdown for {months[selectedMonth - 1]}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Projected</TableHead>
                <TableHead className="text-right">Actual</TableHead>
                <TableHead className="text-right">Difference</TableHead>
                <TableHead className="text-right">% of Projected</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {breakdown.incomeBreakdown.map((category) => (
                <TableRow key={category._id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-right">
                    {currencySymbol}
                    {category.projected.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    {currencySymbol}
                    {category.actual.toFixed(2)}
                  </TableCell>
                  <TableCell
                    className={`text-right ${
                      category.difference >= 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {category.difference >= 0 ? "+" : ""}
                    {currencySymbol}
                    {category.difference.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    {category.percentageOfProjected.toFixed(1)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Expense Table */}
      <Card>
        <CardHeader>
          <CardTitle>Expense Categories</CardTitle>
          <CardDescription>
            Projected vs Actual breakdown for {months[selectedMonth - 1]}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Projected</TableHead>
                <TableHead className="text-right">Actual</TableHead>
                <TableHead className="text-right">Difference</TableHead>
                <TableHead className="text-right">% of Projected</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {breakdown.expenseBreakdown.map((category) => (
                <TableRow key={category._id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="capitalize">
                    {category.category}
                  </TableCell>
                  <TableCell className="text-right">
                    {currencySymbol}
                    {category.projected.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    {currencySymbol}
                    {category.actual.toFixed(2)}
                  </TableCell>
                  <TableCell
                    className={`text-right ${
                      category.difference <= 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {category.difference >= 0 ? "+" : ""}
                    {currencySymbol}
                    {category.difference.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    {category.percentageOfProjected.toFixed(1)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
