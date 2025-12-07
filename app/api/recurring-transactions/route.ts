import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getCollection } from "@/lib/db";
import { recurringTransactionSchema } from "@/lib/validations";
import type { RecurringTransaction, User } from "@/types";
import { ObjectId } from "mongodb";

// GET /api/recurring-transactions?budgetId=xxx
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

    // Verify budget belongs to user
    const budgetsCollection = await getCollection("budgets");
    const budget = await budgetsCollection.findOne({
      _id: new ObjectId(budgetId),
      clerkId,
    });

    if (!budget) {
      return NextResponse.json(
        { error: "Budget not found" },
        { status: 404 }
      );
    }

    const recurringTransactionsCollection = await getCollection<RecurringTransaction>(
      "recurringTransactions"
    );

    const recurringTransactions = await recurringTransactionsCollection
      .find({ budgetId: new ObjectId(budgetId) })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ recurringTransactions });
  } catch (error) {
    console.error("Error fetching recurring transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch recurring transactions" },
      { status: 500 }
    );
  }
}

// POST /api/recurring-transactions
export async function POST(request: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate input
    const validatedData = recurringTransactionSchema.parse(body);

    // Verify budget belongs to user
    const budgetsCollection = await getCollection("budgets");
    const budget = await budgetsCollection.findOne({
      _id: new ObjectId(validatedData.budgetId),
      clerkId,
    });

    if (!budget) {
      return NextResponse.json(
        { error: "Budget not found" },
        { status: 404 }
      );
    }

    const recurringTransactionsCollection = await getCollection<RecurringTransaction>(
      "recurringTransactions"
    );

    const newRecurringTransaction = {
      budgetId: new ObjectId(validatedData.budgetId),
      type: validatedData.type,
      categoryId: new ObjectId(validatedData.categoryId),
      categoryName: validatedData.categoryName,
      amount: validatedData.amount,
      description: validatedData.description,
      frequency: validatedData.frequency,
      startDate: validatedData.startDate,
      endDate: validatedData.endDate,
      dayOfMonth: validatedData.dayOfMonth,
      isActive: true,
      isSubscription: validatedData.isSubscription ?? false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await recurringTransactionsCollection.insertOne(
      newRecurringTransaction as any
    );

    return NextResponse.json(
      {
        recurringTransaction: {
          _id: result.insertedId,
          ...newRecurringTransaction,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating recurring transaction:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create recurring transaction" },
      { status: 500 }
    );
  }
}
