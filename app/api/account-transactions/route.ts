import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getCollection } from "@/lib/db";
import { accountTransactionSchema } from "@/lib/validations";
import type { AccountTransaction, Budget } from "@/types";
import { ObjectId } from "mongodb";

// GET /api/account-transactions?budgetId=xxx&accountId=xxx&month=1&year=2024
export async function GET(request: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const budgetId = searchParams.get("budgetId");
    const accountId = searchParams.get("accountId");
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    if (!budgetId) {
      return NextResponse.json(
        { error: "Budget ID is required" },
        { status: 400 }
      );
    }

    // Verify budget belongs to user
    const budgetsCollection = await getCollection<Budget>("budgets");
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

    const accountTransactionsCollection = await getCollection<AccountTransaction>(
      "accountTransactions"
    );

    // Build query
    const query: any = { budgetId: new ObjectId(budgetId) };

    if (accountId) {
      query.accountId = new ObjectId(accountId);
    }

    if (month) {
      query.month = parseInt(month);
    }

    if (year) {
      query.year = parseInt(year);
    }

    const accountTransactions = await accountTransactionsCollection
      .find(query)
      .sort({ date: -1 })
      .toArray();

    return NextResponse.json({ accountTransactions });
  } catch (error) {
    console.error("Error fetching account transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch account transactions" },
      { status: 500 }
    );
  }
}

// POST /api/account-transactions
export async function POST(request: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate input
    const validatedData = accountTransactionSchema.parse(body);

    // Verify budget belongs to user
    const budgetsCollection = await getCollection<Budget>("budgets");
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
    const month = transactionDate.getMonth() + 1;
    const year = transactionDate.getFullYear();

    const accountTransactionsCollection = await getCollection<AccountTransaction>(
      "accountTransactions"
    );

    // Handle different transaction types
    if (validatedData.type === "transfer") {
      // TRANSFER: Create TWO linked transactions
      if (!validatedData.toAccountId || !validatedData.toAccountName) {
        return NextResponse.json(
          { error: "Destination account required for transfers" },
          { status: 400 }
        );
      }

      const transferId = new ObjectId(); // Unique ID to link the pair

      // Transaction 1: Money OUT from source account
      const outTransaction = {
        budgetId: new ObjectId(validatedData.budgetId),
        accountId: new ObjectId(validatedData.accountId),
        accountName: validatedData.accountName,
        type: "transfer" as const,
        amount: validatedData.amount,
        date: validatedData.date,
        month,
        year,
        description: validatedData.description,
        toAccountId: new ObjectId(validatedData.toAccountId),
        toAccountName: validatedData.toAccountName,
        transferId,
        transferDirection: "out" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Transaction 2: Money IN to destination account
      const inTransaction = {
        budgetId: new ObjectId(validatedData.budgetId),
        accountId: new ObjectId(validatedData.toAccountId),
        accountName: validatedData.toAccountName,
        type: "transfer" as const,
        amount: validatedData.amount,
        date: validatedData.date,
        month,
        year,
        description: validatedData.description,
        toAccountId: new ObjectId(validatedData.accountId),
        toAccountName: validatedData.accountName,
        transferId,
        transferDirection: "in" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Insert both transactions
      await accountTransactionsCollection.insertMany([
        outTransaction as any,
        inTransaction as any,
      ]);

      return NextResponse.json(
        {
          accountTransactions: [outTransaction, inTransaction],
          transferId: transferId.toString(),
        },
        { status: 201 }
      );
    } else {
      // INTEREST or ADJUSTMENT: Single transaction
      const newTransaction = {
        budgetId: new ObjectId(validatedData.budgetId),
        accountId: new ObjectId(validatedData.accountId),
        accountName: validatedData.accountName,
        type: validatedData.type,
        amount: validatedData.amount,
        date: validatedData.date,
        month,
        year,
        description: validatedData.description,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await accountTransactionsCollection.insertOne(
        newTransaction as any
      );

      return NextResponse.json(
        {
          accountTransaction: {
            _id: result.insertedId,
            ...newTransaction,
          },
        },
        { status: 201 }
      );
    }
  } catch (error: any) {
    console.error("Error creating account transaction:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create account transaction" },
      { status: 500 }
    );
  }
}
