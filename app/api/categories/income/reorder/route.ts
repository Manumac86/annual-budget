import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getCollection } from "@/lib/db";
import { ObjectId } from "mongodb";
import type { IncomeCategory } from "@/types";

// PATCH /api/categories/income/reorder
export async function PATCH(request: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { budgetId, categories } = body;

    if (!budgetId || !categories || !Array.isArray(categories)) {
      return NextResponse.json(
        { error: "budgetId and categories array are required" },
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const collection = await getCollection<IncomeCategory>("incomeCategories");

    // Update order for each category
    const updatePromises = categories.map((cat: { id: string; order: number }) =>
      collection.updateOne(
        { _id: new ObjectId(cat.id), budgetId: new ObjectId(budgetId) },
        { $set: { order: cat.order, updatedAt: new Date() } }
      )
    );

    await Promise.all(updatePromises);

    // Fetch updated categories
    const updatedCategories = await collection
      .find({ budgetId: new ObjectId(budgetId) })
      .sort({ order: 1 })
      .toArray();

    return NextResponse.json({ categories: updatedCategories });
  } catch (error) {
    console.error("Error reordering income categories:", error);
    return NextResponse.json(
      { error: "Failed to reorder categories" },
      { status: 500 }
    );
  }
}
