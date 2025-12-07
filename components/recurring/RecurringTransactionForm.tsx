"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRecurringTransactionMutations } from "@/hooks/useRecurringTransactionMutations";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import type {
  RecurringTransaction,
  SerializableIncomeCategory,
  SerializableExpenseCategory,
} from "@/types";

const recurringTransactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  categoryId: z.string().min(1, "Category is required"),
  amount: z.number().positive("Amount must be positive"),
  description: z.string().optional(),
  frequency: z.enum(["daily", "weekly", "biweekly", "monthly", "yearly"]),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  dayOfMonth: z.union([z.number().min(1).max(31), z.literal("")]).optional(),
  isSubscription: z.boolean().optional(),
});

type RecurringTransactionFormData = z.infer<typeof recurringTransactionSchema>;

interface RecurringTransactionFormProps {
  budgetId: string;
  incomeCategories: SerializableIncomeCategory[];
  expenseCategories: SerializableExpenseCategory[];
  recurringTransaction?: RecurringTransaction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RecurringTransactionForm({
  budgetId,
  incomeCategories,
  expenseCategories,
  recurringTransaction,
  open,
  onOpenChange,
}: RecurringTransactionFormProps) {
  const { createRecurringTransaction, updateRecurringTransaction } =
    useRecurringTransactionMutations();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RecurringTransactionFormData>({
    resolver: zodResolver(recurringTransactionSchema),
    defaultValues: recurringTransaction
      ? {
          type: recurringTransaction.type,
          categoryId: recurringTransaction.categoryId.toString(),
          amount: recurringTransaction.amount,
          description: recurringTransaction.description || "",
          frequency: recurringTransaction.frequency,
          startDate: new Date(recurringTransaction.startDate)
            .toISOString()
            .split("T")[0],
          endDate: recurringTransaction.endDate
            ? new Date(recurringTransaction.endDate).toISOString().split("T")[0]
            : "",
          dayOfMonth: recurringTransaction.dayOfMonth || "",
          isSubscription: recurringTransaction.isSubscription || false,
        }
      : {
          type: "expense",
          categoryId: "",
          amount: 0,
          description: "",
          frequency: "monthly",
          startDate: new Date().toISOString().split("T")[0],
          endDate: "",
          dayOfMonth: "",
          isSubscription: false,
        },
  });

  const type = form.watch("type");
  const categories = type === "income" ? incomeCategories : expenseCategories;

  const onSubmit = async (data: RecurringTransactionFormData) => {
    try {
      setIsSubmitting(true);

      const category = categories.find(
        (cat) => cat._id.toString() === data.categoryId
      );
      if (!category) {
        throw new Error("Category not found");
      }

      const formattedData = {
        ...data,
        amount: Number(data.amount),
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        dayOfMonth: data.dayOfMonth ? Number(data.dayOfMonth) : undefined,
      };

      if (recurringTransaction) {
        await updateRecurringTransaction(recurringTransaction._id.toString(), {
          amount: formattedData.amount,
          description: formattedData.description,
          frequency: formattedData.frequency,
          startDate: formattedData.startDate,
          endDate: formattedData.endDate,
          dayOfMonth: formattedData.dayOfMonth,
        });
      } else {
        await createRecurringTransaction({
          budgetId,
          type: formattedData.type,
          categoryId: formattedData.categoryId,
          categoryName: category.name,
          amount: formattedData.amount,
          description: formattedData.description,
          frequency: formattedData.frequency,
          startDate: formattedData.startDate,
          endDate: formattedData.endDate,
          dayOfMonth: formattedData.dayOfMonth,
          isSubscription: formattedData.isSubscription,
        });
      }

      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving recurring transaction:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to save recurring transaction"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {recurringTransaction
              ? "Edit Recurring Transaction"
              : "Create Recurring Transaction"}
          </DialogTitle>
          <DialogDescription>
            {recurringTransaction
              ? "Update the details of your recurring transaction."
              : "Set up a transaction that will automatically recur at the specified frequency."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {!recurringTransaction && (
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
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
            )}

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!!recurringTransaction}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category._id} value={category._id}>
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
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequency</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Biweekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dayOfMonth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Day of Month (optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max="31"
                      placeholder="1-31"
                      value={field.value || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value === "" ? "" : parseInt(value) || "");
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Specific day of the month for the transaction
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date (optional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormDescription>
                    Leave empty for ongoing recurring transaction
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isSubscription"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Mark as Subscription
                    </FormLabel>
                    <FormDescription>
                      This will show in the Subscriptions tracker
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : recurringTransaction
                  ? "Update"
                  : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
