import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getCollection } from "@/lib/db";
import { ObjectId } from "mongodb";
import type {
  Budget,
  Transaction,
  IncomeCategory,
  ExpenseCategory,
} from "@/types";

export async function GET(request: Request) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const budgetId = searchParams.get("budgetId");

    if (!budgetId) {
      return NextResponse.json(
        { error: "Budget ID is required" },
        { status: 400 }
      );
    }

    // Verify budget ownership
    const budgetsCollection = await getCollection<Budget>("budgets");
    const budget = await budgetsCollection.findOne({
      _id: new ObjectId(budgetId),
      clerkId,
    });

    if (!budget) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 });
    }

    const alerts: Array<{
      id: string;
      type: "warning" | "danger" | "info";
      title: string;
      message: string;
      category?: string;
    }> = [];

    // Get current month and year
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Fetch transactions for current month
    const transactionsCollection = await getCollection<Transaction>(
      "transactions"
    );
    const transactions = await transactionsCollection
      .find({
        budgetId: new ObjectId(budgetId),
        month: currentMonth,
        year: currentYear,
      })
      .toArray();

    // Fetch categories
    const incomeCategoriesCollection = await getCollection<IncomeCategory>(
      "income_categories"
    );
    const expenseCategoriesCollection = await getCollection<ExpenseCategory>(
      "expense_categories"
    );

    const incomeCategories = await incomeCategoriesCollection
      .find({ budgetId: new ObjectId(budgetId) })
      .toArray();

    const expenseCategories = await expenseCategoriesCollection
      .find({ budgetId: new ObjectId(budgetId) })
      .toArray();

    // Check expense categories over budget
    for (const category of expenseCategories) {
      const categoryTransactions = transactions.filter(
        (t: Transaction) =>
          t.type === "expense" &&
          t.categoryId.toString() === category._id.toString()
      );

      const actualAmount = categoryTransactions.reduce(
        (sum: number, t: Transaction) => sum + t.amount,
        0
      );

      const percentageUsed = (actualAmount / category.projectedAmount) * 100;

      if (percentageUsed > 100) {
        alerts.push({
          id: `over-budget-${category._id}`,
          type: "danger",
          title: "Budget Exceeded",
          message: `${category.name} is ${percentageUsed.toFixed(0)}% over budget (${actualAmount.toFixed(2)} / ${category.projectedAmount.toFixed(2)})`,
          category: category.name,
        });
      } else if (percentageUsed === 100) {
        alerts.push({
          id: `at-budget-${category._id}`,
          type: "info",
          title: "Budget Fully Used",
          message: `${category.name} is at exactly 100% of budget (${actualAmount.toFixed(2)} / ${category.projectedAmount.toFixed(2)})`,
          category: category.name,
        });
      } else if (percentageUsed >= 90) {
        alerts.push({
          id: `near-budget-${category._id}`,
          type: "warning",
          title: "Approaching Budget Limit",
          message: `${category.name} is at ${percentageUsed.toFixed(0)}% of budget (${actualAmount.toFixed(2)} / ${category.projectedAmount.toFixed(2)})`,
          category: category.name,
        });
      }
    }

    // Check overall income vs expenses
    const totalIncome = transactions
      .filter((t: Transaction) => t.type === "income")
      .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter((t: Transaction) => t.type === "expense")
      .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

    const projectedIncome = incomeCategories.reduce(
      (sum: number, cat: IncomeCategory) => sum + cat.projectedAmount,
      0
    );

    const projectedExpenses = expenseCategories.reduce(
      (sum: number, cat: ExpenseCategory) => sum + cat.projectedAmount,
      0
    );

    // Alert if expenses are higher than income
    if (totalExpenses > totalIncome) {
      const deficit = totalExpenses - totalIncome;
      alerts.push({
        id: "negative-balance",
        type: "danger",
        title: "Negative Cash Flow",
        message: `Expenses exceed income by ${deficit.toFixed(2)} this month`,
      });
    }

    // Alert if income is significantly below projection
    const incomePercentage = (totalIncome / projectedIncome) * 100;
    if (incomePercentage < 50 && now.getDate() > 15) {
      alerts.push({
        id: "low-income",
        type: "warning",
        title: "Income Below Projection",
        message: `Only ${incomePercentage.toFixed(0)}% of projected income received (${totalIncome.toFixed(2)} / ${projectedIncome.toFixed(2)})`,
      });
    }

    // Alert if no transactions this month
    if (transactions.length === 0) {
      alerts.push({
        id: "no-transactions",
        type: "info",
        title: "No Transactions Yet",
        message: "You haven't added any transactions for this month",
      });
    }

    // Check 50/30/20 rule compliance
    const needs = expenseCategories
      .filter((cat: ExpenseCategory) => cat.category === "needs")
      .reduce((sum: number, cat: ExpenseCategory) => {
        const actual = transactions
          .filter(
            (t: Transaction) =>
              t.type === "expense" &&
              t.categoryId.toString() === cat._id.toString()
          )
          .reduce((s: number, t: Transaction) => s + t.amount, 0);
        return sum + actual;
      }, 0);

    const wants = expenseCategories
      .filter((cat: ExpenseCategory) => cat.category === "wants")
      .reduce((sum: number, cat: ExpenseCategory) => {
        const actual = transactions
          .filter(
            (t: Transaction) =>
              t.type === "expense" &&
              t.categoryId.toString() === cat._id.toString()
          )
          .reduce((s: number, t: Transaction) => s + t.amount, 0);
        return sum + actual;
      }, 0);

    if (totalIncome > 0) {
      const needsPercentage = (needs / totalIncome) * 100;
      const wantsPercentage = (wants / totalIncome) * 100;

      if (needsPercentage > 60) {
        alerts.push({
          id: "needs-high",
          type: "warning",
          title: "High Essential Spending",
          message: `Needs are ${needsPercentage.toFixed(0)}% of income (target: 50%)`,
        });
      }

      if (wantsPercentage > 40) {
        alerts.push({
          id: "wants-high",
          type: "warning",
          title: "High Discretionary Spending",
          message: `Wants are ${wantsPercentage.toFixed(0)}% of income (target: 30%)`,
        });
      }
    }

    return NextResponse.json({ alerts });
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return NextResponse.json(
      { error: "Failed to fetch alerts" },
      { status: 500 }
    );
  }
}
