"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useRecurringTransactions } from "@/hooks/useRecurringTransactions";
import { useIncomeCategories, useExpenseCategories } from "@/hooks/useCategories";
import { RecurringTransactionForm } from "@/components/recurring/RecurringTransactionForm";
import { RecurringTransactionList } from "@/components/recurring/RecurringTransactionList";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { RecurringTransaction } from "@/types";

interface RecurringTransactionsManagementProps {
  budgetId: string;
}

export function RecurringTransactionsManagement({
  budgetId,
}: RecurringTransactionsManagementProps) {
  const { recurringTransactions, isLoading: isLoadingTransactions } = useRecurringTransactions(budgetId);
  const { categories: incomeCategories, isLoading: isLoadingIncome } = useIncomeCategories(budgetId);
  const { categories: expenseCategories, isLoading: isLoadingExpense } = useExpenseCategories(budgetId);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<RecurringTransaction | undefined>(undefined);

  const isLoading = isLoadingTransactions || isLoadingIncome || isLoadingExpense;

  const handleEdit = (transaction: RecurringTransaction) => {
    setEditingTransaction(transaction);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingTransaction(undefined);
  };

  const incomeTransactions = recurringTransactions.filter(
    (t) => t.type === "income"
  );
  const expenseTransactions = recurringTransactions.filter(
    (t) => t.type === "expense"
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading recurring transactions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Recurring Transactions</h1>
          <p className="text-muted-foreground mt-1">
            Manage recurring income and expenses that repeat automatically
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Recurring Transaction
        </Button>
      </div>

      <Tabs defaultValue="income" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="income">
            Income ({incomeTransactions.length})
          </TabsTrigger>
          <TabsTrigger value="expense">
            Expenses ({expenseTransactions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="income" className="mt-6">
          <RecurringTransactionList
            recurringTransactions={incomeTransactions}
            onEdit={handleEdit}
          />
        </TabsContent>

        <TabsContent value="expense" className="mt-6">
          <RecurringTransactionList
            recurringTransactions={expenseTransactions}
            onEdit={handleEdit}
          />
        </TabsContent>
      </Tabs>

      <RecurringTransactionForm
        budgetId={budgetId}
        incomeCategories={incomeCategories}
        expenseCategories={expenseCategories}
        recurringTransaction={editingTransaction}
        open={formOpen}
        onOpenChange={handleCloseForm}
      />
    </div>
  );
}
