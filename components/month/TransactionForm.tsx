"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTransactionMutations } from "@/hooks/useTransactionMutations";
import { useAccounts } from "@/hooks/useAccounts";
import type { SerializableIncomeCategory, SerializableExpenseCategory, Transaction } from "@/types";
import { useEffect } from "react";

const transactionFormSchema = z.object({
  type: z.enum(["income", "expense"]),
  categoryId: z.string().min(1, "Category is required"),
  amount: z.number().positive("Amount must be positive"),
  description: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  accountId: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionFormSchema>;

interface TransactionFormProps {
  budgetId: string;
  month: number;
  year: number;
  incomeCategories: SerializableIncomeCategory[];
  expenseCategories: SerializableExpenseCategory[];
  transaction?: Transaction | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TransactionForm({
  budgetId,
  month,
  year,
  incomeCategories,
  expenseCategories,
  transaction,
  onSuccess,
  onCancel,
}: TransactionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createTransaction, updateTransaction } = useTransactionMutations();
  const { accounts } = useAccounts(budgetId);

  // Get active accounts only
  const activeAccounts = accounts.filter((acc) => acc.isActive);

  // Default date to first day of the month
  const defaultDate = `${year}-${month.toString().padStart(2, "0")}-01`;

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: transaction
      ? {
          type: transaction.type,
          categoryId: transaction.categoryId.toString(),
          amount: transaction.amount,
          description: transaction.description || "",
          date: new Date(transaction.date).toISOString().split("T")[0],
          accountId: transaction.accountId?.toString() || "NONE",
        }
      : {
          type: "expense",
          categoryId: "",
          amount: 0,
          description: "",
          date: defaultDate,
          accountId: "NONE",
        },
  });

  // Reset form when transaction changes
  useEffect(() => {
    if (transaction) {
      form.reset({
        type: transaction.type,
        categoryId: transaction.categoryId.toString(),
        amount: transaction.amount,
        description: transaction.description || "",
        date: new Date(transaction.date).toISOString().split("T")[0],
        accountId: transaction.accountId?.toString() || "NONE",
      });
    } else {
      form.reset({
        type: "expense",
        categoryId: "",
        amount: 0,
        description: "",
        date: defaultDate,
        accountId: "NONE",
      });
    }
  }, [transaction, form, defaultDate]);

  const transactionType = form.watch("type");

  const categories =
    transactionType === "income" ? incomeCategories : expenseCategories;

  const onSubmit = async (data: TransactionFormData) => {
    setIsSubmitting(true);

    try {
      const selectedCategory = categories.find(
        (c) => c._id.toString() === data.categoryId
      );

      if (!selectedCategory) {
        throw new Error("Category not found");
      }

      // Get account name if account is selected (and not "NONE")
      const hasAccount = data.accountId && data.accountId !== "NONE";
      const selectedAccount = hasAccount
        ? activeAccounts.find((acc) => acc._id.toString() === data.accountId)
        : null;

      if (transaction) {
        // Update existing transaction
        await updateTransaction(transaction._id.toString(), {
          amount: data.amount,
          description: data.description,
          date: new Date(data.date),
          accountId: hasAccount ? data.accountId : undefined,
          accountName: selectedAccount?.name,
        });
      } else {
        // Create new transaction
        await createTransaction({
          budgetId,
          type: data.type,
          categoryId: data.categoryId,
          categoryName: selectedCategory.name,
          amount: data.amount,
          description: data.description,
          date: new Date(data.date),
          isRecurring: false,
          accountId: hasAccount ? data.accountId : undefined,
          accountName: selectedAccount?.name,
        });
      }

      form.reset({
        type: "expense",
        categoryId: "",
        amount: 0,
        description: "",
        date: defaultDate,
        accountId: "NONE",
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Error saving transaction:", error);
      alert(error.message || "Failed to save transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{transaction ? "Edit Transaction" : "Add Transaction"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!!transaction}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem
                          key={category._id.toString()}
                          value={category._id.toString()}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="accountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account (Optional)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || "NONE"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="None - No account linked" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="NONE">None - No account linked</SelectItem>
                      {activeAccounts.map((account) => (
                        <SelectItem
                          key={account._id.toString()}
                          value={account._id.toString()}
                        >
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add notes..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2">
              {transaction && onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? transaction
                    ? "Updating..."
                    : "Adding..."
                  : transaction
                  ? "Update Transaction"
                  : "Add Transaction"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
