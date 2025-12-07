import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getCollection } from "@/lib/db";
import { ObjectId } from "mongodb";
import type { Budget, RecurringTransaction } from "@/types";

type UpcomingPayment = {
  _id: string;
  description: string;
  categoryName: string;
  amount: number;
  type: "income" | "expense";
  frequency: string;
  nextDate: Date;
  daysUntil: number;
};

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

    // Get active recurring transactions
    const recurringCollection = await getCollection<RecurringTransaction>(
      "recurringTransactions"
    );
    const recurringTransactions = await recurringCollection
      .find({
        budgetId: new ObjectId(budgetId),
        isActive: true,
      })
      .toArray();

    // Calculate next occurrence for each recurring transaction
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingPayments = recurringTransactions
      .map((recurring: RecurringTransaction): UpcomingPayment | null => {
        const nextDate = calculateNextOccurrence(
          recurring,
          today
        );

        if (!nextDate) return null;

        return {
          _id: recurring._id.toString(),
          description: recurring.description || "Untitled",
          categoryName: recurring.categoryName,
          amount: recurring.amount,
          type: recurring.type,
          frequency: recurring.frequency,
          nextDate,
          daysUntil: Math.ceil(
            (nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
          ),
        };
      })
      .filter((payment: UpcomingPayment | null): payment is UpcomingPayment => payment !== null)
      .sort((a: UpcomingPayment, b: UpcomingPayment) => a.nextDate.getTime() - b.nextDate.getTime())
      .slice(0, 10); // Get next 10 upcoming payments

    return NextResponse.json({ upcomingPayments });
  } catch (error) {
    console.error("Error fetching upcoming payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch upcoming payments" },
      { status: 500 }
    );
  }
}

function calculateNextOccurrence(
  recurring: RecurringTransaction,
  fromDate: Date
): Date | null {
  const startDate = new Date(recurring.startDate);
  const endDate = recurring.endDate ? new Date(recurring.endDate) : null;

  // If end date is in the past, no future occurrences
  if (endDate && endDate < fromDate) {
    return null;
  }

  // If start date is in the future, return start date
  if (startDate > fromDate) {
    return startDate;
  }

  let nextDate = new Date(startDate);

  switch (recurring.frequency) {
    case "daily":
      while (nextDate <= fromDate) {
        nextDate.setDate(nextDate.getDate() + 1);
      }
      break;

    case "weekly":
      while (nextDate <= fromDate) {
        nextDate.setDate(nextDate.getDate() + 7);
      }
      break;

    case "biweekly":
      while (nextDate <= fromDate) {
        nextDate.setDate(nextDate.getDate() + 14);
      }
      break;

    case "monthly":
      while (nextDate <= fromDate) {
        nextDate.setMonth(nextDate.getMonth() + 1);
      }
      // If dayOfMonth is specified, use that day
      if (recurring.dayOfMonth) {
        nextDate.setDate(recurring.dayOfMonth);
      }
      break;

    case "yearly":
      while (nextDate <= fromDate) {
        nextDate.setFullYear(nextDate.getFullYear() + 1);
      }
      break;

    default:
      return null;
  }

  // Check if next occurrence is after end date
  if (endDate && nextDate > endDate) {
    return null;
  }

  return nextDate;
}
