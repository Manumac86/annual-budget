"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTransactionMutations } from "@/hooks/useTransactionMutations";
import { Pencil, Trash2 } from "lucide-react";
import type { Transaction } from "@/types";

interface TransactionListProps {
  transactions: Transaction[];
  currencySymbol: string;
  onEdit?: (transaction: Transaction) => void;
}

export function TransactionList({
  transactions,
  currencySymbol,
  onEdit,
}: TransactionListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { deleteTransaction } = useTransactionMutations();

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this transaction?")) {
      return;
    }

    setDeletingId(id);

    try {
      await deleteTransaction(id);
    } catch (error: any) {
      console.error("Error deleting transaction:", error);
      alert(error.message || "Failed to delete transaction");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatAmount = (amount: number) => {
    return `${currencySymbol}${amount.toFixed(2)}`;
  };

  // Group transactions by date
  const groupedTransactions = transactions.reduce(
    (acc, transaction) => {
      const dateKey = formatDate(transaction.date);
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(transaction);
      return acc;
    },
    {} as Record<string, Transaction[]>
  );

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No transactions yet. Add your first transaction above.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transactions ({transactions.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(groupedTransactions).map(([date, txs]) => (
            <div key={date}>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                {date}
              </h3>
              <div className="space-y-2">
                {txs.map((transaction) => (
                  <div
                    key={transaction._id.toString()}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {transaction.categoryName}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            transaction.type === "income"
                              ? "bg-chart-1/10 text-chart-1"
                              : "bg-chart-5/10 text-chart-5"
                          }`}
                        >
                          {transaction.type}
                        </span>
                      </div>
                      {transaction.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {transaction.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`font-semibold ${
                          transaction.type === "income"
                            ? "text-chart-1"
                            : "text-chart-5"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {formatAmount(transaction.amount)}
                      </span>
                      <div className="flex items-center gap-2">
                        {onEdit && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(transaction)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            handleDelete(transaction._id.toString())
                          }
                          disabled={deletingId === transaction._id.toString()}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
