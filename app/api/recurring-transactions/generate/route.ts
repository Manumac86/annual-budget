import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getCollection } from "@/lib/db";
import { ObjectId } from "mongodb";
import type { RecurringTransaction, Transaction } from "@/types";

// Helper function to check if a transaction should be generated for a given month
function shouldGenerateForMonth(
  recurring: RecurringTransaction,
  year: number,
  month: number
): boolean {
  const targetDate = new Date(year, month - 1, 1);
  const startDate = new Date(recurring.startDate);
  const endDate = recurring.endDate ? new Date(recurring.endDate) : null;

  // Check if target month is before start date
  if (targetDate < new Date(startDate.getFullYear(), startDate.getMonth(), 1)) {
    return false;
  }

  // Check if target month is after end date
  if (endDate && targetDate > new Date(endDate.getFullYear(), endDate.getMonth(), 1)) {
    return false;
  }

  // Check if recurring transaction is active
  if (!recurring.isActive) {
    return false;
  }

  // Calculate months difference from start date
  const monthsDiff =
    (year - startDate.getFullYear()) * 12 + (month - 1 - startDate.getMonth());

  switch (recurring.frequency) {
    case "monthly":
      // Generate every month
      return monthsDiff >= 0;
    case "yearly":
      // Generate once per year
      return monthsDiff >= 0 && monthsDiff % 12 === 0;
    case "daily":
    case "weekly":
    case "biweekly":
      // For daily/weekly/biweekly, generate every month but could be enhanced later
      return monthsDiff >= 0;
    default:
      return false;
  }
}

// Helper function to calculate the transaction date
function calculateTransactionDate(
  recurring: RecurringTransaction,
  year: number,
  month: number
): Date {
  const dayOfMonth = recurring.dayOfMonth || 1;

  // Create date for the specified day of the month
  const date = new Date(year, month - 1, Math.min(dayOfMonth, new Date(year, month, 0).getDate()));

  return date;
}

// POST /api/recurring-transactions/generate?budgetId=xxx&year=2025&month=1
export async function POST(request: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const budgetId = searchParams.get("budgetId");
    const year = parseInt(searchParams.get("year") || "");
    const month = parseInt(searchParams.get("month") || "");

    if (!budgetId || !year || !month) {
      return NextResponse.json(
        { error: "budgetId, year, and month are required" },
        { status: 400 }
      );
    }

    // Verify budget belongs to user
    const budgetsCollection = await getCollection("budgets");
    const budget = await budgetsCollection.findOne({
      _id: new ObjectId(budgetId),
      clerkId,
    });

    if (!budget) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 });
    }

    // Get all active recurring transactions for this budget
    const recurringCollection = await getCollection<RecurringTransaction>(
      "recurringTransactions"
    );
    const recurringTransactions = await recurringCollection
      .find({
        budgetId: new ObjectId(budgetId),
        isActive: true,
      })
      .toArray();

    // Get existing transactions for this month to avoid duplicates
    const transactionsCollection = await getCollection<Transaction>("transactions");
    const existingTransactions = await transactionsCollection
      .find({
        budgetId: new ObjectId(budgetId),
        year,
        month,
        isRecurring: true,
      })
      .toArray();

    const existingRecurringIds = new Set(
      existingTransactions
        .filter((t: Transaction) => t.recurringId)
        .map((t: Transaction) => t.recurringId!.toString())
    );

    // Generate transactions
    const transactionsToCreate: any[] = [];

    for (const recurring of recurringTransactions) {
      // Check if we should generate for this month
      if (!shouldGenerateForMonth(recurring, year, month)) {
        continue;
      }

      // Check if transaction already exists for this recurring template
      if (existingRecurringIds.has(recurring._id.toString())) {
        continue;
      }

      // Calculate transaction date
      const transactionDate = calculateTransactionDate(recurring, year, month);

      // Create transaction object
      const transaction = {
        budgetId: new ObjectId(budgetId),
        date: transactionDate,
        type: recurring.type,
        categoryId: recurring.categoryId,
        categoryName: recurring.categoryName,
        amount: recurring.amount,
        description: recurring.description || `Recurring: ${recurring.categoryName}`,
        isRecurring: true,
        recurringId: recurring._id,
        month,
        year,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      transactionsToCreate.push(transaction);
    }

    // Insert all transactions
    let createdCount = 0;
    if (transactionsToCreate.length > 0) {
      const result = await transactionsCollection.insertMany(transactionsToCreate);
      createdCount = result.insertedCount;
    }

    return NextResponse.json({
      success: true,
      generated: createdCount,
      skipped: recurringTransactions.length - createdCount,
      message: `Generated ${createdCount} transactions for ${year}-${month}`,
    });
  } catch (error) {
    console.error("Error generating recurring transactions:", error);
    return NextResponse.json(
      { error: "Failed to generate recurring transactions" },
      { status: 500 }
    );
  }
}
