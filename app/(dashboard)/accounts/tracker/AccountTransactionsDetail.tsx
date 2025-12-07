"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Account, Transaction, AccountTransaction } from "@/types";
import { useAccountTransactionMutations } from "@/hooks/useAccountTransactionMutations";

interface AccountTransactionsDetailProps {
  account: Account;
  transactions: Transaction[];
  accountTransactions: AccountTransaction[];
  currencySymbol: string;
}

export default function AccountTransactionsDetail({
  account,
  transactions,
  accountTransactions,
  currencySymbol,
}: AccountTransactionsDetailProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { deleteAccountTransaction } = useAccountTransactionMutations();

  const accountIdStr = account._id.toString();

  // Filter transactions for this account
  const accountTxns = transactions.filter(
    (t) => t.accountId?.toString() === accountIdStr
  );

  const accountSpecialTxns = accountTransactions.filter(
    (at) => at.accountId.toString() === accountIdStr
  );

  // Combine and sort all transactions by date
  const allTransactions = [
    ...accountTxns.map((t) => ({
      id: t._id.toString(),
      date: new Date(t.date),
      type: t.type,
      description: t.categoryName + (t.description ? ` - ${t.description}` : ""),
      amount: t.amount,
      txType: "regular" as const,
    })),
    ...accountSpecialTxns.map((at) => ({
      id: at._id.toString(),
      date: new Date(at.date),
      type: at.type,
      description:
        at.type === "transfer"
          ? `Transfer ${at.transferDirection === "out" ? "to" : "from"} ${
              at.toAccountName || "Unknown"
            }`
          : at.description || at.type,
      amount: at.amount,
      txType: "account" as const,
      transferDirection: at.transferDirection,
    })),
  ].sort((a, b) => a.date.getTime() - b.date.getTime());

  const handleDelete = async (id: string, txType: "regular" | "account") => {
    if (txType === "account") {
      if (confirm("Are you sure you want to delete this transaction?")) {
        try {
          await deleteAccountTransaction(id);
        } catch (error) {
          console.error("Failed to delete transaction:", error);
          alert("Failed to delete transaction");
        }
      }
    } else {
      alert("Use the main transactions page to delete regular income/expense transactions");
    }
  };

  if (allTransactions.length === 0) {
    return null;
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {account.name} - Transaction Details
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-2" />
                Hide Details
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-2" />
                Show Details ({allTransactions.length})
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allTransactions.map((txn) => {
                const isIncome = txn.type === "income";
                const isExpense = txn.type === "expense";
                const isTransferIn = txn.type === "transfer" && txn.transferDirection === "in";
                const isTransferOut = txn.type === "transfer" && txn.transferDirection === "out";
                const isInterest = txn.type === "interest";
                const isAdjustment = txn.type === "adjustment";

                let amountColor = "";
                if (isIncome || isTransferIn || isInterest) {
                  amountColor = "text-green-600";
                } else if (isExpense || isTransferOut) {
                  amountColor = "text-red-600";
                }

                const displayAmount =
                  isExpense || isTransferOut
                    ? -txn.amount
                    : txn.amount;

                return (
                  <TableRow key={txn.id}>
                    <TableCell>{txn.date.toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {txn.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{txn.description}</TableCell>
                    <TableCell className={`text-right ${amountColor}`}>
                      {displayAmount >= 0 ? "+" : ""}
                      {currencySymbol}
                      {Math.abs(displayAmount).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {txn.txType === "account" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(txn.id, txn.txType)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      )}
    </Card>
  );
}
