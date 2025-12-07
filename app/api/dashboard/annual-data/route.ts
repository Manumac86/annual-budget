import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getCollection } from "@/lib/db";
import { ObjectId } from "mongodb";
import type { Transaction } from "@/types";

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// GET /api/dashboard/annual-data?budgetId=xxx&year=2025
export async function GET(request: Request) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const budgetId = searchParams.get("budgetId");
    const year = searchParams.get("year");

    if (!budgetId || !year) {
      return NextResponse.json(
        { error: "budgetId and year are required" },
        { status: 400 }
      );
    }

    const transactionsCollection = await getCollection<Transaction>("transactions");

    // Fetch all transactions for the year
    const transactions = await transactionsCollection
      .find({
        budgetId: new ObjectId(budgetId),
        year: parseInt(year),
      })
      .toArray();

    // Group transactions by month
    const monthlyData = MONTH_NAMES.map((monthName, index) => {
      const month = index + 1;
      const monthTransactions = transactions.filter((t: Transaction) => t.month === month);

      const income = monthTransactions
        .filter((t: Transaction) => t.type === "income")
        .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

      const expenses = monthTransactions
        .filter((t: Transaction) => t.type === "expense")
        .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

      return {
        month: monthName,
        income,
        expenses,
      };
    });

    return NextResponse.json({ data: monthlyData });
  } catch (error) {
    console.error("Error fetching annual data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
