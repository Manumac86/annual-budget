import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";
import { ObjectId } from "mongodb";
import type { SavingsGoal, SavingsGoalCreate } from "@/types";

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

    const db = await getDb();
    const savingsGoalsCollection = db.collection<SavingsGoal>("savingsGoals");

    const goals = await savingsGoalsCollection
      .find({ budgetId: new ObjectId(budgetId) })
      .sort({ createdAt: -1 })
      .toArray();

    // Convert to serializable format
    const serializedGoals = goals.map((goal: SavingsGoal) => ({
      ...goal,
      _id: goal._id.toString(),
      budgetId: goal.budgetId.toString(),
    }));

    return NextResponse.json(serializedGoals);
  } catch (error) {
    console.error("Error fetching savings goals:", error);
    return NextResponse.json(
      { error: "Failed to fetch savings goals" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: SavingsGoalCreate = await request.json();
    const { budgetId, name, targetAmount, currentAmount, deadline, priority } =
      body;

    if (!budgetId || !name || !targetAmount || !priority) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const savingsGoalsCollection = db.collection<SavingsGoal>("savingsGoals");

    const initialAmount = currentAmount || 0;
    const newGoal: Omit<SavingsGoal, "_id"> = {
      budgetId: new ObjectId(budgetId),
      name,
      targetAmount,
      currentAmount: initialAmount,
      deadline: deadline ? new Date(deadline) : undefined,
      priority,
      isCompleted: false,
      contributions: initialAmount > 0 ? [{
        date: new Date(),
        amount: initialAmount,
        type: "deposit" as const,
        note: "Initial deposit"
      }] : [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await savingsGoalsCollection.insertOne(
      newGoal as SavingsGoal
    );

    const createdGoal = await savingsGoalsCollection.findOne({
      _id: result.insertedId,
    });

    if (!createdGoal) {
      return NextResponse.json(
        { error: "Failed to create savings goal" },
        { status: 500 }
      );
    }

    const serializedGoal = {
      ...createdGoal,
      _id: createdGoal._id.toString(),
      budgetId: createdGoal.budgetId.toString(),
    };

    return NextResponse.json(serializedGoal, { status: 201 });
  } catch (error) {
    console.error("Error creating savings goal:", error);
    return NextResponse.json(
      { error: "Failed to create savings goal" },
      { status: 500 }
    );
  }
}
