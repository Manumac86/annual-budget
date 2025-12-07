"use client";

import { useState } from "react";
import { useIncomeCategories, useExpenseCategories } from "@/hooks/useCategories";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoryList } from "@/components/categories/CategoryList";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const incomeCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  projectedAmount: z.number().min(0, "Amount must be positive"),
});

const expenseCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  projectedAmount: z.number().min(0, "Amount must be positive"),
  category: z.enum(["needs", "wants", "savings"]),
});

type IncomeCategoryForm = z.infer<typeof incomeCategorySchema>;
type ExpenseCategoryForm = z.infer<typeof expenseCategorySchema>;

interface CategoriesManagementProps {
  budgetId: string;
  currencySymbol: string;
}

export function CategoriesManagement({ budgetId, currencySymbol }: CategoriesManagementProps) {
  const { categories: incomeCategories, isLoading: incomeLoading, mutate: mutateIncome } = useIncomeCategories(budgetId);
  const { categories: expenseCategories, isLoading: expenseLoading, mutate: mutateExpense } = useExpenseCategories(budgetId);

  const [showAddIncome, setShowAddIncome] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const incomeForm = useForm<IncomeCategoryForm>({
    resolver: zodResolver(incomeCategorySchema),
    defaultValues: {
      name: "",
      projectedAmount: 0,
    },
  });

  const expenseForm = useForm<ExpenseCategoryForm>({
    resolver: zodResolver(expenseCategorySchema),
    defaultValues: {
      name: "",
      projectedAmount: 0,
      category: "needs",
    },
  });

  const handleAddIncome = async (data: IncomeCategoryForm) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/categories/income", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          budgetId,
          name: data.name,
          projectedAmount: data.projectedAmount,
          order: incomeCategories.length || 0,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create income category");
      }

      incomeForm.reset();
      setShowAddIncome(false);
      mutateIncome();
    } catch (error: any) {
      console.error("Error creating income category:", error);
      alert(error.message || "Failed to create income category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddExpense = async (data: ExpenseCategoryForm) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/categories/expense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          budgetId,
          name: data.name,
          projectedAmount: data.projectedAmount,
          category: data.category,
          order: expenseCategories.length || 0,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create expense category");
      }

      expenseForm.reset();
      setShowAddExpense(false);
      mutateExpense();
    } catch (error: any) {
      console.error("Error creating expense category:", error);
      alert(error.message || "Failed to create expense category");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Manage Categories</h1>
        <p className="text-muted-foreground">
          Edit, reorder, or archive your income and expense categories
        </p>
      </div>

      <Tabs defaultValue="income" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="income">Income Categories</TabsTrigger>
          <TabsTrigger value="expense">Expense Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="income" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Income Categories</CardTitle>
                  <CardDescription>
                    Manage your income sources and projected amounts
                  </CardDescription>
                </div>
                <Button onClick={() => setShowAddIncome(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {incomeLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <CategoryList
                  categories={incomeCategories || []}
                  type="income"
                  budgetId={budgetId}
                  currencySymbol={currencySymbol}
                  onUpdate={() => mutateIncome()}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expense" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Expense Categories</CardTitle>
                  <CardDescription>
                    Manage your expense categories following the 50/30/20 rule
                  </CardDescription>
                </div>
                <Button onClick={() => setShowAddExpense(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {expenseLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <CategoryList
                  categories={expenseCategories || []}
                  type="expense"
                  budgetId={budgetId}
                  currencySymbol={currencySymbol}
                  onUpdate={() => mutateExpense()}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Income Category Dialog */}
      <Dialog open={showAddIncome} onOpenChange={setShowAddIncome}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Income Category</DialogTitle>
            <DialogDescription>
              Create a new income category for your budget
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={incomeForm.handleSubmit(handleAddIncome)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="income-name">Category Name</Label>
              <Input
                id="income-name"
                {...incomeForm.register("name")}
                placeholder="e.g., Salary, Freelance"
              />
              {incomeForm.formState.errors.name && (
                <p className="text-sm text-red-600">
                  {incomeForm.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="income-amount">Projected Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm text-muted-foreground">
                  {currencySymbol}
                </span>
                <Input
                  id="income-amount"
                  type="number"
                  step="0.01"
                  className="pl-8"
                  {...incomeForm.register("projectedAmount", {
                    valueAsNumber: true,
                  })}
                  placeholder="0.00"
                />
              </div>
              {incomeForm.formState.errors.projectedAmount && (
                <p className="text-sm text-red-600">
                  {incomeForm.formState.errors.projectedAmount.message}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddIncome(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Expense Category Dialog */}
      <Dialog open={showAddExpense} onOpenChange={setShowAddExpense}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Expense Category</DialogTitle>
            <DialogDescription>
              Create a new expense category for your budget
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={expenseForm.handleSubmit(handleAddExpense)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="expense-name">Category Name</Label>
              <Input
                id="expense-name"
                {...expenseForm.register("name")}
                placeholder="e.g., Rent, Groceries"
              />
              {expenseForm.formState.errors.name && (
                <p className="text-sm text-red-600">
                  {expenseForm.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="expense-amount">Projected Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm text-muted-foreground">
                  {currencySymbol}
                </span>
                <Input
                  id="expense-amount"
                  type="number"
                  step="0.01"
                  className="pl-8"
                  {...expenseForm.register("projectedAmount", {
                    valueAsNumber: true,
                  })}
                  placeholder="0.00"
                />
              </div>
              {expenseForm.formState.errors.projectedAmount && (
                <p className="text-sm text-red-600">
                  {expenseForm.formState.errors.projectedAmount.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="expense-category">Category Type</Label>
              <Select
                value={expenseForm.watch("category")}
                onValueChange={(value) =>
                  expenseForm.setValue("category", value as any)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="needs">Needs (50%)</SelectItem>
                  <SelectItem value="wants">Wants (30%)</SelectItem>
                  <SelectItem value="savings">Savings (20%)</SelectItem>
                </SelectContent>
              </Select>
              {expenseForm.formState.errors.category && (
                <p className="text-sm text-red-600">
                  {expenseForm.formState.errors.category.message}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddExpense(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
