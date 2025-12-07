"use client";

import { useState } from "react";
import { Pencil, Trash2, Pause, Play } from "lucide-react";
import { useRecurringTransactionMutations } from "@/hooks/useRecurringTransactionMutations";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { RecurringTransaction } from "@/types";

interface RecurringTransactionListProps {
  recurringTransactions: RecurringTransaction[];
  onEdit: (recurringTransaction: RecurringTransaction) => void;
}

export function RecurringTransactionList({
  recurringTransactions,
  onEdit,
}: RecurringTransactionListProps) {
  const {
    deleteRecurringTransaction,
    pauseRecurringTransaction,
    resumeRecurringTransaction,
  } = useRecurringTransactionMutations();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] =
    useState<RecurringTransaction | null>(null);

  const handleDelete = async () => {
    if (!transactionToDelete) return;

    try {
      await deleteRecurringTransaction(transactionToDelete._id.toString());
      setDeleteDialogOpen(false);
      setTransactionToDelete(null);
    } catch (error) {
      console.error("Error deleting recurring transaction:", error);
      alert("Failed to delete recurring transaction");
    }
  };

  const handleToggleActive = async (transaction: RecurringTransaction) => {
    try {
      if (transaction.isActive) {
        await pauseRecurringTransaction(transaction._id.toString());
      } else {
        await resumeRecurringTransaction(transaction._id.toString());
      }
    } catch (error) {
      console.error("Error toggling recurring transaction:", error);
      alert("Failed to update recurring transaction");
    }
  };

  const formatFrequency = (frequency: string) => {
    const frequencies: Record<string, string> = {
      monthly: "Monthly",
      quarterly: "Quarterly",
      "semi-annually": "Semi-Annually",
      annually: "Annually",
    };
    return frequencies[frequency] || frequency;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (recurringTransactions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No recurring transactions yet.</p>
        <p className="text-sm mt-2">
          Create a recurring transaction to automatically generate monthly
          transactions.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {recurringTransactions.map((transaction) => (
          <div
            key={transaction._id.toString()}
            className={`p-4 rounded-lg border ${
              transaction.isActive
                ? "bg-card"
                : "bg-muted/50 opacity-60"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{transaction.description}</h3>
                  {!transaction.isActive && (
                    <span className="text-xs bg-muted px-2 py-0.5 rounded">
                      Paused
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {transaction.categoryName}
                </p>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span className="font-semibold">
                    ${transaction.amount.toFixed(2)}
                  </span>
                  <span className="text-muted-foreground">
                    {formatFrequency(transaction.frequency)}
                  </span>
                  {transaction.dayOfMonth && (
                    <span className="text-muted-foreground">
                      Day {transaction.dayOfMonth}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span>Start: {formatDate(transaction.startDate)}</span>
                  {transaction.endDate && (
                    <span>End: {formatDate(transaction.endDate)}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleActive(transaction)}
                  title={transaction.isActive ? "Pause" : "Resume"}
                >
                  {transaction.isActive ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(transaction)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setTransactionToDelete(transaction);
                    setDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Recurring Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this recurring transaction? This
              will not affect transactions that have already been created.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
