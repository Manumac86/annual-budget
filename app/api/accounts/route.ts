import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getCollection } from "@/lib/db";
import type { Account } from "@/types";
import { ObjectId } from "mongodb";

// GET /api/accounts?budgetId=xxx
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

    const accountsCollection = await getCollection<Account>("accounts");

    const accounts = await accountsCollection
      .find({ budgetId: new ObjectId(budgetId) })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ accounts });
  } catch (error) {
    console.error("Error fetching accounts:", error);
    return NextResponse.json(
      { error: "Failed to fetch accounts" },
      { status: 500 }
    );
  }
}

// POST /api/accounts
export async function POST(request: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { budgetId, name, type, balance, currency } = body;

    // Validate required fields
    if (!budgetId || !name || !type || balance === undefined || !currency) {
      return NextResponse.json(
        { error: "Missing required fields" },
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

    const accountsCollection = await getCollection<Account>("accounts");

    const newAccount = {
      budgetId: new ObjectId(budgetId),
      name,
      type,
      balance: parseFloat(balance),
      currency,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await accountsCollection.insertOne(newAccount as any);

    return NextResponse.json(
      {
        account: {
          _id: result.insertedId,
          ...newAccount,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating account:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
