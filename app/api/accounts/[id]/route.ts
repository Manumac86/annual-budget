import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getCollection } from "@/lib/db";
import type { Account } from "@/types";
import { ObjectId } from "mongodb";

// PATCH /api/accounts/[id]
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

    const accountsCollection = await getCollection<Account>("accounts");
    const account = await accountsCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // Verify budget belongs to user
    const budgetsCollection = await getCollection("budgets");
    const budget = await budgetsCollection.findOne({
      _id: account.budgetId,
      clerkId,
    });

    if (!budget) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (body.name !== undefined) updateData.name = body.name;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.balance !== undefined) updateData.balance = parseFloat(body.balance);
    if (body.currency !== undefined) updateData.currency = body.currency;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    await accountsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    const updatedAccount = await accountsCollection.findOne({
      _id: new ObjectId(id),
    });

    return NextResponse.json({ account: updatedAccount });
  } catch (error) {
    console.error("Error updating account:", error);
    return NextResponse.json(
      { error: "Failed to update account" },
      { status: 500 }
    );
  }
}

// DELETE /api/accounts/[id]
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

    const accountsCollection = await getCollection<Account>("accounts");
    const account = await accountsCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // Verify budget belongs to user
    const budgetsCollection = await getCollection("budgets");
    const budget = await budgetsCollection.findOne({
      _id: account.budgetId,
      clerkId,
    });

    if (!budget) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await accountsCollection.deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}
