"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCategoryMutations } from "@/hooks/useCategoryMutations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import type { SerializableIncomeCategory, SerializableExpenseCategory } from "@/types";

const incomeCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  projectedAmount: z.number().min(0, "Amount must be positive"),
});

const expenseCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  projectedAmount: z.number().min(0, "Amount must be positive"),
  category: z.enum(["needs", "wants", "savings"]),
});

type IncomeCategoryFormData = z.infer<typeof incomeCategorySchema>;
type ExpenseCategoryFormData = z.infer<typeof expenseCategorySchema>;

interface CategoryEditFormProps {
  category: SerializableIncomeCategory | SerializableExpenseCategory;
  type: "income" | "expense";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  currencySymbol: string;
}

export function CategoryEditForm({
  category,
  type,
  open,
  onOpenChange,
  onSuccess,
  currencySymbol,
}: CategoryEditFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateIncomeCategory, updateExpenseCategory } = useCategoryMutations();

  const isExpenseCategory = (cat: any): cat is SerializableExpenseCategory => {
    return "category" in cat;
  };

  const form = useForm<IncomeCategoryFormData | ExpenseCategoryFormData>({
    resolver: zodResolver(
      type === "income" ? incomeCategorySchema : expenseCategorySchema
    ),
    defaultValues: {
      name: category.name,
      projectedAmount: category.projectedAmount,
      ...(isExpenseCategory(category) && {
        category: category.category,
      }),
    },
  });

  const onSubmit = async (
    data: IncomeCategoryFormData | ExpenseCategoryFormData
  ) => {
    setIsSubmitting(true);
    try {
      if (type === "income") {
        await updateIncomeCategory(category._id.toString(), {
          name: data.name,
          projectedAmount: data.projectedAmount,
        });
      } else {
        const expenseData = data as ExpenseCategoryFormData;
        await updateExpenseCategory(category._id.toString(), {
          name: expenseData.name,
          projectedAmount: expenseData.projectedAmount,
          category: expenseData.category,
        });
      }

      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("Error updating category:", error);
      alert(error.message || "Failed to update category");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit {type === "income" ? "Income" : "Expense"} Category</DialogTitle>
          <DialogDescription>
            Update the category name and projected amount.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Salary, Rent, Food" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="projectedAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Projected Amount</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-sm text-muted-foreground">
                        {currencySymbol}
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        className="pl-8"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {type === "expense" && (
              <FormField
                control={form.control}
                name={"category" as any}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="needs">Needs (50%)</SelectItem>
                        <SelectItem value="wants">Wants (30%)</SelectItem>
                        <SelectItem value="savings">Savings (20%)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Following the 50/30/20 budgeting rule
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
