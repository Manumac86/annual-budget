import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getCollection } from "@/lib/db";
import { ObjectId } from "mongodb";
import type { ExpenseCategory } from "@/types";

// PATCH /api/categories/expense/[id]
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, projectedAmount, category } = body;

    if (!name && projectedAmount === undefined && !category) {
      return NextResponse.json(
        { error: "At least one field (name, projectedAmount, or category) is required" },
        { status: 400 }
      );
    }

    const collection = await getCollection<ExpenseCategory>("expenseCategories");

    // Get the category to verify ownership via budget
    const expenseCategory = await collection.findOne({ _id: new ObjectId(id) });
    if (!expenseCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Verify budget belongs to user
    const budgetsCollection = await getCollection("budgets");
    const budget = await budgetsCollection.findOne({
      _id: new ObjectId(expenseCategory.budgetId),
      clerkId,
    });

    if (!budget) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Build update object
    const updateData: any = { updatedAt: new Date() };
    if (name) updateData.name = name;
    if (projectedAmount !== undefined) updateData.projectedAmount = projectedAmount;
    if (category) updateData.category = category;

    // Update category
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json(
        { error: "Failed to update category" },
        { status: 500 }
      );
    }

    return NextResponse.json({ category: result });
  } catch (error) {
    console.error("Error updating expense category:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/expense/[id] (soft delete/archive)
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

    const collection = await getCollection<ExpenseCategory>("expenseCategories");

    // Get the category to verify ownership
    const expenseCategory = await collection.findOne({ _id: new ObjectId(id) });
    if (!expenseCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Verify budget belongs to user
    const budgetsCollection = await getCollection("budgets");
    const budget = await budgetsCollection.findOne({
      _id: new ObjectId(expenseCategory.budgetId),
      clerkId,
    });

    if (!budget) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Soft delete by setting archived flag
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          archived: true,
          archivedAt: new Date(),
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json(
        { error: "Failed to archive category" },
        { status: 500 }
      );
    }

    return NextResponse.json({ category: result });
  } catch (error) {
    console.error("Error archiving expense category:", error);
    return NextResponse.json(
      { error: "Failed to archive category" },
      { status: 500 }
    );
  }
}
