import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCollection } from "@/lib/db";
import type { User, Budget, Transaction } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { UpcomingTransactions } from "@/components/dashboard/UpcomingTransactions";
import { BudgetRule503020 } from "@/components/dashboard/BudgetRule503020";
import { UpcomingPayments } from "@/components/dashboard/UpcomingPayments";
import { BudgetAlerts } from "@/components/dashboard/BudgetAlerts";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { userId: clerkId } = await auth();
  const clerkUser = await currentUser();

  if (!clerkId) {
    redirect("/");
  }

  // Check if user exists in database
  const usersCollection = await getCollection<User>("users");
  const user = await usersCollection.findOne({ clerkId });

  // If user doesn't exist or hasn't completed setup, redirect to setup
  if (!user || !user.settings) {
    redirect("/setup");
  }

  // Get the user's budget
  const budgetsCollection = await getCollection<Budget>("budgets");
  const budget = await budgetsCollection.findOne({
    clerkId,
    year: user.settings.year,
  });

  // Get current month/year
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // Fetch transactions for current month
  let totalIncome = 0;
  let totalExpenses = 0;

  if (budget) {
    const transactionsCollection = await getCollection<Transaction>(
      "transactions"
    );
    const transactions = await transactionsCollection
      .find({
        budgetId: new ObjectId(budget._id),
        month: currentMonth,
        year: currentYear,
      })
      .toArray();

    // Calculate totals
    transactions.forEach((transaction: Transaction) => {
      if (transaction.type === "income") {
        totalIncome += transaction.amount;
      } else {
        totalExpenses += transaction.amount;
      }
    });
  }

  const balance = totalIncome - totalExpenses;
  const savingsRate =
    totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, {clerkUser?.firstName || "User"}!
        </h1>
        <p className="text-muted-foreground">
          Here's an overview of your budget for {user.settings.year}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user.settings.currencySymbol}
              {totalIncome.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalIncome > 0 ? "This month" : "No income yet"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user.settings.currencySymbol}
              {totalExpenses.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalExpenses > 0 ? "This month" : "No expenses yet"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                balance >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {user.settings.currencySymbol}
              {balance.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{savingsRate}%</div>
            <p className="text-xs text-muted-foreground">
              {totalIncome > 0 ? "This month" : "No data yet"}
            </p>
          </CardContent>
        </Card>
      </div>

      {budget && (
        <div className="grid gap-4">
          <DashboardCharts
            budgetId={budget._id.toString()}
            year={user.settings.year}
            currencySymbol={user.settings.currencySymbol}
          />
        </div>
      )}

      {budget && (
        <div className="grid gap-4 md:grid-cols-2">
          <BudgetRule503020
            budgetId={budget._id.toString()}
            month={currentMonth}
            year={currentYear}
            currencySymbol={user.settings.currencySymbol}
          />
          <UpcomingTransactions
            budgetId={budget._id.toString()}
            currencySymbol={user.settings.currencySymbol}
          />
        </div>
      )}

      {budget && (
        <div className="grid gap-4 md:grid-cols-2">
          <BudgetAlerts budgetId={budget._id.toString()} />
          <UpcomingPayments
            budgetId={budget._id.toString()}
            currencySymbol={user.settings.currencySymbol}
          />
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Link href={`/month/${new Date().getMonth() + 1}`}>
              <Button variant="outline" className="w-full">
                Go to Current Month
              </Button>
            </Link>
            <Link href={`/month/${user.settings.startingMonth}`}>
              <Button variant="outline" className="w-full">
                Go to Starting Month
              </Button>
            </Link>
            <Link href={`/subscriptions`}>
              <Button variant="outline" className="w-full">
                Add new subscription
              </Button>
            </Link>
            <Link href={`/recurring`}>
              <Button variant="outline" className="w-full">
                Add recurring transaction
              </Button>
            </Link>
            <Link href={`/month/${new Date().getMonth() + 1}`}>
              <Button variant="outline" className="w-full">
                Add new single transaction
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">
                <strong>Country:</strong> {user.settings.country}
              </p>
              <p className="text-sm">
                <strong>Currency:</strong> {user.settings.currency} (
                {user.settings.currencySymbol})
              </p>
              <p className="text-sm">
                <strong>Fiscal Year:</strong> {user.settings.year}
              </p>
              <p className="text-sm">
                <strong>Starting Month:</strong> {user.settings.startingMonth}
              </p>
              <p className="text-sm">
                <strong>Rollover:</strong>{" "}
                {user.settings.rolloverEnabled ? "Enabled" : "Disabled"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
