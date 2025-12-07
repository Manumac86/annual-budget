import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getCollection } from "@/lib/db";
import { ObjectId } from "mongodb";
import type { Transaction, ExpenseCategory } from "@/types";

// GET /api/budget/503020?budgetId=xxx&month=1&year=2025
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
        { error: "budgetId, month, and year are required" },
        { status: 400 }
      );
    }

    // Get expense categories to understand the projected breakdown
    const expenseCategoriesCollection = await getCollection<ExpenseCategory>(
      "expenseCategories"
    );
    const expenseCategories = await expenseCategoriesCollection
      .find({ budgetId: new ObjectId(budgetId) })
      .toArray();

    // Calculate projected amounts by category
    const projectedNeeds = expenseCategories
      .filter((cat: ExpenseCategory) => cat.category === "needs")
      .reduce((sum: number, cat: ExpenseCategory) => sum + cat.projectedAmount, 0);

    const projectedWants = expenseCategories
      .filter((cat: ExpenseCategory) => cat.category === "wants")
      .reduce((sum: number, cat: ExpenseCategory) => sum + cat.projectedAmount, 0);

    const projectedSavings = expenseCategories
      .filter((cat: ExpenseCategory) => cat.category === "savings")
      .reduce((sum: number, cat: ExpenseCategory) => sum + cat.projectedAmount, 0);

    const totalProjected = projectedNeeds + projectedWants + projectedSavings;

    // Get actual transactions for the month
    const transactionsCollection = await getCollection<Transaction>("transactions");
    const transactions = await transactionsCollection
      .find({
        budgetId: new ObjectId(budgetId),
        month: parseInt(month),
        year: parseInt(year),
        type: "expense",
      })
      .toArray();

    // Calculate actual spending by category
    let actualNeeds = 0;
    let actualWants = 0;
    let actualSavings = 0;

    for (const transaction of transactions) {
      const category = expenseCategories.find(
        (cat: ExpenseCategory) => cat._id.toString() === transaction.categoryId.toString()
      );
      if (category) {
        switch (category.category) {
          case "needs":
            actualNeeds += transaction.amount;
            break;
          case "wants":
            actualWants += transaction.amount;
            break;
          case "savings":
            actualSavings += transaction.amount;
            break;
        }
      }
    }

    const totalActual = actualNeeds + actualWants + actualSavings;

    // Get total income for the month to calculate percentages
    const income = await transactionsCollection
      .find({
        budgetId: new ObjectId(budgetId),
        month: parseInt(month),
        year: parseInt(year),
        type: "income",
      })
      .toArray();

    const totalIncome = income.reduce(
      (sum: number, t: Transaction) => sum + t.amount,
      0
    );

    return NextResponse.json({
      projected: {
        needs: projectedNeeds,
        wants: projectedWants,
        savings: projectedSavings,
        total: totalProjected,
      },
      actual: {
        needs: actualNeeds,
        wants: actualWants,
        savings: actualSavings,
        total: totalActual,
      },
      percentages: {
        needs: totalIncome > 0 ? (actualNeeds / totalIncome) * 100 : 0,
        wants: totalIncome > 0 ? (actualWants / totalIncome) * 100 : 0,
        savings: totalIncome > 0 ? (actualSavings / totalIncome) * 100 : 0,
      },
      totalIncome,
    });
  } catch (error) {
    console.error("Error fetching 50/30/20 data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
