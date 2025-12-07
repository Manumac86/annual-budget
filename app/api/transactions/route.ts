import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getCollection } from "@/lib/db";
import { transactionCreateSchema } from "@/lib/validations";
import type { Transaction, User } from "@/types";
import { ObjectId } from "mongodb";

// GET /api/transactions?budgetId=xxx&month=1&year=2024
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

    const transactionsCollection = await getCollection<Transaction>("transactions");

    // Build query
    const query: any = { budgetId: new ObjectId(budgetId) };

    if (month) {
      query.month = parseInt(month);
    }

    if (year) {
      query.year = parseInt(year);
    }

    const transactions = await transactionsCollection
      .find(query)
      .sort({ date: -1 })
      .toArray();

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

// POST /api/transactions
export async function POST(request: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate input
    const validatedData = transactionCreateSchema.parse(body);

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

    // Extract month and year from date
    const transactionDate = new Date(validatedData.date);
    const month = transactionDate.getMonth() + 1; // 0-indexed to 1-indexed
    const year = transactionDate.getFullYear();

    const transactionsCollection = await getCollection<Transaction>("transactions");

    const newTransaction = {
      budgetId: new ObjectId(validatedData.budgetId),
      date: validatedData.date,
      type: validatedData.type,
      categoryId: new ObjectId(validatedData.categoryId),
      categoryName: validatedData.categoryName,
      amount: validatedData.amount,
      description: validatedData.description,
      isRecurring: validatedData.isRecurring || false,
      recurringId: validatedData.recurringId
        ? new ObjectId(validatedData.recurringId)
        : undefined,
      // Optional account linking
      accountId: validatedData.accountId
        ? new ObjectId(validatedData.accountId)
        : undefined,
      accountName: validatedData.accountName,
      month,
      year,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await transactionsCollection.insertOne(newTransaction as any);

    return NextResponse.json(
      {
        transaction: {
          _id: result.insertedId,
          ...newTransaction,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating transaction:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}
