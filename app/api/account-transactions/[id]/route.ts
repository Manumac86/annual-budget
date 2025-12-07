import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getCollection } from "@/lib/db";
import type { AccountTransaction, Budget } from "@/types";
import { ObjectId } from "mongodb";

// DELETE /api/account-transactions/[id]
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

    const accountTransactionsCollection = await getCollection<AccountTransaction>(
      "accountTransactions"
    );

    // Get the transaction to verify ownership
    const transaction = await accountTransactionsCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Account transaction not found" },
        { status: 404 }
      );
    }

    // Verify budget belongs to user
    const budgetsCollection = await getCollection<Budget>("budgets");
    const budget = await budgetsCollection.findOne({
      _id: transaction.budgetId,
      clerkId,
    });

    if (!budget) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // If this is a transfer, delete BOTH sides of the transfer
    if (transaction.type === "transfer" && transaction.transferId) {
      const result = await accountTransactionsCollection.deleteMany({
        transferId: transaction.transferId,
      });

      return NextResponse.json({
        success: true,
        deletedCount: result.deletedCount,
        message:
          result.deletedCount === 2
            ? "Transfer deleted (both sides removed)"
            : "Transfer partially deleted",
      });
    } else {
      // Delete single transaction (interest or adjustment)
      const result = await accountTransactionsCollection.deleteOne({
        _id: new ObjectId(id),
      });

      if (result.deletedCount === 0) {
        return NextResponse.json(
          { error: "Account transaction not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true });
    }
  } catch (error) {
    console.error("Error deleting account transaction:", error);
    return NextResponse.json(
      { error: "Failed to delete account transaction" },
      { status: 500 }
    );
  }
}
