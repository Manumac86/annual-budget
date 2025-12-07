import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getCollection } from "@/lib/db";
import { ObjectId } from "mongodb";
import type { Budget, Transaction } from "@/types";

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

    // Fetch all transactions for the specified month and year
    const transactionsCollection = await getCollection<Transaction>("transactions");
    const transactions = await transactionsCollection
      .find({
        budgetId: new ObjectId(budgetId),
        month: parseInt(month),
        year: parseInt(year),
      })
      .sort({ date: 1 })
      .toArray();

    // Group transactions by day
    const transactionsByDay: Record<string, Transaction[]> = {};

    transactions.forEach((transaction: Transaction) => {
      const date = new Date(transaction.date);
      const dayKey = date.getDate().toString();

      if (!transactionsByDay[dayKey]) {
        transactionsByDay[dayKey] = [];
      }

      transactionsByDay[dayKey].push({
        ...transaction,
        _id: transaction._id.toString() as any,
        budgetId: transaction.budgetId.toString() as any,
        categoryId: transaction.categoryId.toString() as any,
      });
    });

    return NextResponse.json({ transactionsByDay });
  } catch (error) {
    console.error("Error fetching calendar transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
