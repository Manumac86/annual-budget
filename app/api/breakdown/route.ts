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
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    if (!budgetId || !month || !year) {
      return NextResponse.json(
        { error: "Budget ID, month, and year are required" },
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

    // Fetch categories
    const incomeCategoriesCollection =
      await getCollection<IncomeCategory>("income_categories");
    const expenseCategoriesCollection = await getCollection<ExpenseCategory>(
      "expense_categories"
    );

    const incomeCategories = await incomeCategoriesCollection
      .find({ budgetId: new ObjectId(budgetId) })
      .toArray();

    const expenseCategories = await expenseCategoriesCollection
      .find({ budgetId: new ObjectId(budgetId) })
      .toArray();

    // Fetch transactions for the month
    const transactionsCollection =
      await getCollection<Transaction>("transactions");
    const transactions = await transactionsCollection
      .find({
        budgetId: new ObjectId(budgetId),
        month: parseInt(month),
        year: parseInt(year),
      })
      .toArray();

    // Calculate income breakdown
    const incomeBreakdown = incomeCategories.map(
      (category: IncomeCategory) => {
        const categoryTransactions = transactions.filter(
          (t: Transaction) =>
            t.type === "income" &&
            t.categoryId.toString() === category._id.toString()
        );

        const actual = categoryTransactions.reduce(
          (sum: number, t: Transaction) => sum + t.amount,
          0
        );

        return {
          _id: category._id.toString(),
          name: category.name,
          projected: category.projectedAmount,
          actual,
          difference: actual - category.projectedAmount,
          percentageOfProjected:
            category.projectedAmount > 0
              ? (actual / category.projectedAmount) * 100
              : 0,
        };
      }
    );

    // Calculate expense breakdown
    const expenseBreakdown = expenseCategories.map(
      (category: ExpenseCategory) => {
        const categoryTransactions = transactions.filter(
          (t: Transaction) =>
            t.type === "expense" &&
            t.categoryId.toString() === category._id.toString()
        );

        const actual = categoryTransactions.reduce(
          (sum: number, t: Transaction) => sum + t.amount,
          0
        );

        return {
          _id: category._id.toString(),
          name: category.name,
          category: category.category,
          projected: category.projectedAmount,
          actual,
          difference: actual - category.projectedAmount,
          percentageOfProjected:
            category.projectedAmount > 0
              ? (actual / category.projectedAmount) * 100
              : 0,
        };
      }
    );

    // Calculate totals
    const totalIncome = {
      projected: incomeCategories.reduce(
        (sum: number, cat: IncomeCategory) => sum + cat.projectedAmount,
        0
      ),
      actual: transactions
        .filter((t: Transaction) => t.type === "income")
        .reduce((sum: number, t: Transaction) => sum + t.amount, 0),
    };

    const totalExpense = {
      projected: expenseCategories.reduce(
        (sum: number, cat: ExpenseCategory) => sum + cat.projectedAmount,
        0
      ),
      actual: transactions
        .filter((t: Transaction) => t.type === "expense")
        .reduce((sum: number, t: Transaction) => sum + t.amount, 0),
    };

    // Calculate 50/30/20 breakdown
    const needs = {
      projected: expenseCategories
        .filter((cat: ExpenseCategory) => cat.category === "needs")
        .reduce((sum: number, cat: ExpenseCategory) => sum + cat.projectedAmount, 0),
      actual: expenseBreakdown
        .filter((cat: { category: string; actual: number }) => cat.category === "needs")
        .reduce((sum: number, cat: { actual: number }) => sum + cat.actual, 0),
    };

    const wants = {
      projected: expenseCategories
        .filter((cat: ExpenseCategory) => cat.category === "wants")
        .reduce((sum: number, cat: ExpenseCategory) => sum + cat.projectedAmount, 0),
      actual: expenseBreakdown
        .filter((cat: { category: string; actual: number }) => cat.category === "wants")
        .reduce((sum: number, cat: { actual: number }) => sum + cat.actual, 0),
    };

    const savings = {
      projected: expenseCategories
        .filter((cat: ExpenseCategory) => cat.category === "savings")
        .reduce((sum: number, cat: ExpenseCategory) => sum + cat.projectedAmount, 0),
      actual: expenseBreakdown
        .filter((cat: { category: string; actual: number }) => cat.category === "savings")
        .reduce((sum: number, cat: { actual: number }) => sum + cat.actual, 0),
    };

    return NextResponse.json({
      incomeBreakdown,
      expenseBreakdown,
      totals: {
        income: totalIncome,
        expense: totalExpense,
        balance: {
          projected: totalIncome.projected - totalExpense.projected,
          actual: totalIncome.actual - totalExpense.actual,
        },
      },
      ruleBreakdown: {
        needs,
        wants,
        savings,
      },
    });
  } catch (error) {
    console.error("Error fetching breakdown data:", error);
    return NextResponse.json(
      { error: "Failed to fetch breakdown data" },
      { status: 500 }
    );
  }
}
