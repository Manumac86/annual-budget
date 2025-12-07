import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getCollection } from "@/lib/db";
import { ObjectId } from "mongodb";
import type { Transaction, Budget } from "@/types";

// PATCH /api/transactions/[id] - Update a transaction
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

    // Get the transaction to verify ownership
    const transactionsCollection = await getCollection<Transaction>("transactions");
    const transaction = await transactionsCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    // Verify the budget belongs to the user
    const budgetsCollection = await getCollection<Budget>("budgets");
    const budget = await budgetsCollection.findOne({
      _id: transaction.budgetId,
      clerkId,
    });

    if (!budget) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Update the transaction
    const updateData: Partial<Transaction> = {};

    if (body.type !== undefined) updateData.type = body.type;
    if (body.categoryId !== undefined) updateData.categoryId = new ObjectId(body.categoryId);
    if (body.categoryName !== undefined) updateData.categoryName = body.categoryName;
    if (body.amount !== undefined) updateData.amount = Number(body.amount);
    if (body.description !== undefined) updateData.description = body.description;

    // Optional account linking
    if (body.accountId !== undefined) {
      updateData.accountId = body.accountId ? new ObjectId(body.accountId) : undefined;
    }
    if (body.accountName !== undefined) updateData.accountName = body.accountName;

    if (body.date !== undefined) {
      const date = new Date(body.date);
      updateData.date = date;
      updateData.month = date.getMonth() + 1;
      updateData.year = date.getFullYear();
    }

    const result = await transactionsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    const updatedTransaction = await transactionsCollection.findOne({
      _id: new ObjectId(id),
    });

    return NextResponse.json({ transaction: updatedTransaction });
  } catch (error) {
    console.error("Error updating transaction:", error);
    return NextResponse.json(
      { error: "Failed to update transaction" },
      { status: 500 }
    );
  }
}

// DELETE /api/transactions/[id] - Delete a transaction
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

    // Get the transaction to verify ownership
    const transactionsCollection = await getCollection<Transaction>("transactions");
    const transaction = await transactionsCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    // Verify the budget belongs to the user
    const budgetsCollection = await getCollection<Budget>("budgets");
    const budget = await budgetsCollection.findOne({
      _id: transaction.budgetId,
      clerkId,
    });

    if (!budget) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Delete the transaction
    const result = await transactionsCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return NextResponse.json(
      { error: "Failed to delete transaction" },
      { status: 500 }
    );
  }
}
