import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";
import { ObjectId } from "mongodb";
import type { SavingsGoal, SavingsGoalUpdate } from "@/types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid goal ID" }, { status: 400 });
    }

    const db = await getDb();
    const savingsGoalsCollection = db.collection<SavingsGoal>("savingsGoals");

    const goal = await savingsGoalsCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    const serializedGoal = {
      ...goal,
      _id: goal._id.toString(),
      budgetId: goal.budgetId.toString(),
    };

    return NextResponse.json(serializedGoal);
  } catch (error) {
    console.error("Error fetching savings goal:", error);
    return NextResponse.json(
      { error: "Failed to fetch savings goal" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid goal ID" }, { status: 400 });
    }

    const body: SavingsGoalUpdate = await request.json();

    const db = await getDb();
    const savingsGoalsCollection = db.collection<SavingsGoal>("savingsGoals");

    const updateData: any = {
      ...body,
      updatedAt: new Date(),
    };

    if (body.deadline) {
      updateData.deadline = new Date(body.deadline);
    }

    const result = await savingsGoalsCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    const serializedGoal = {
      ...result,
      _id: result._id.toString(),
      budgetId: result.budgetId.toString(),
    };

    return NextResponse.json(serializedGoal);
  } catch (error) {
    console.error("Error updating savings goal:", error);
    return NextResponse.json(
      { error: "Failed to update savings goal" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid goal ID" }, { status: 400 });
    }

    const db = await getDb();
    const savingsGoalsCollection = db.collection<SavingsGoal>("savingsGoals");

    const result = await savingsGoalsCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting savings goal:", error);
    return NextResponse.json(
      { error: "Failed to delete savings goal" },
      { status: 500 }
    );
  }
}
