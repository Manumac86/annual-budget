import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ObjectId } from "mongodb";
import { getCollection } from "@/lib/db";
import { budgetCreateSchema } from "@/lib/validations";
import type { Budget, User } from "@/types";

// GET /api/budgets - Get all budgets for current user
export async function GET() {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from database
    const usersCollection = await getCollection<User>("users");
    const user = await usersCollection.findOne({ clerkId });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const budgetsCollection = await getCollection<Budget>("budgets");
    const budgets = await budgetsCollection
      .find({ userId: user._id })
      .sort({ year: -1 })
      .toArray();

    return NextResponse.json({ budgets });
  } catch (error) {
    console.error("Error fetching budgets:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/budgets - Create a new budget
export async function POST(request: Request) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from database
    const usersCollection = await getCollection<User>("users");
    const user = await usersCollection.findOne({ clerkId });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();

    // Validate input
    const validatedData = budgetCreateSchema.parse(body);

    const budgetsCollection = await getCollection<Budget>("budgets");

    // Check if budget for this year already exists
    const existingBudget = await budgetsCollection.findOne({
      userId: user._id,
      year: validatedData.year,
    });

    if (existingBudget) {
      return NextResponse.json(
        { error: "Budget for this year already exists" },
        { status: 409 }
      );
    }

    // Create new budget
    const newBudget: Omit<Budget, "_id"> = {
      userId: user._id,
      clerkId,
      year: validatedData.year,
      name: validatedData.name,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await budgetsCollection.insertOne(newBudget as Budget);
    const createdBudget = await budgetsCollection.findOne({
      _id: result.insertedId,
    });

    return NextResponse.json({ budget: createdBudget }, { status: 201 });
  } catch (error) {
    console.error("Error creating budget:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
