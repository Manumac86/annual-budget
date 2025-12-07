"use client";

import { useState } from "react";
import { Plus, Calendar, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRecurringTransactions } from "@/hooks/useRecurringTransactions";
import { useRecurringTransactionMutations } from "@/hooks/useRecurringTransactionMutations";
import { useIncomeCategories, useExpenseCategories } from "@/hooks/useCategories";
import { RecurringTransactionForm } from "@/components/recurring/RecurringTransactionForm";
import { format, differenceInDays, addMonths, addYears, addWeeks, addDays } from "date-fns";

interface SubscriptionsViewProps {
  budgetId: string;
  currencySymbol: string;
}

export default function SubscriptionsView({
  budgetId,
  currencySymbol,
}: SubscriptionsViewProps) {
  const { recurringTransactions, isLoading } = useRecurringTransactions(budgetId);
  const { categories: incomeCategories } = useIncomeCategories(budgetId);
  const { categories: expenseCategories } = useExpenseCategories(budgetId);
  const { deleteRecurringTransaction, updateRecurringTransaction } =
    useRecurringTransactionMutations();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<any | null>(null);

  // Filter to only show recurring transactions marked as subscriptions
  const subscriptions = recurringTransactions?.filter((rt) => rt.isSubscription === true) || [];

  const handleEdit = (subscription: any) => {
    setEditingSubscription(subscription);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this subscription?")) {
      try {
        await deleteRecurringTransaction(id);
      } catch (error) {
        console.error("Failed to delete subscription:", error);
      }
    }
  };

  const handleToggleActive = async (subscription: any) => {
    try {
      await updateRecurringTransaction(subscription._id, {
        isActive: !subscription.isActive,
      });
    } catch (error) {
      console.error("Failed to toggle subscription:", error);
    }
  };

  const handleFormOpenChange = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) {
      setEditingSubscription(null);
    }
  };

  // Calculate next billing date for each subscription
  const getNextBillingDate = (subscription: any) => {
    const start = new Date(subscription.startDate);
    const now = new Date();

    if (subscription.endDate && new Date(subscription.endDate) < now) {
      return new Date(subscription.endDate);
    }

    let next = new Date(start);

    while (next < now) {
      switch (subscription.frequency) {
        case "daily":
          next = addDays(next, 1);
          break;
        case "weekly":
          next = addWeeks(next, 1);
          break;
        case "biweekly":
          next = addWeeks(next, 2);
          break;
        case "monthly":
          next = addMonths(next, 1);
          break;
        case "yearly":
          next = addYears(next, 1);
          break;
      }
    }

    return next;
  };

  const activeSubscriptions = subscriptions.filter((s) => s.isActive);
  const inactiveSubscriptions = subscriptions.filter((s) => !s.isActive);

  // Calculate monthly and yearly totals
  const monthlyTotal = activeSubscriptions.reduce((sum, sub) => {
    if (sub.frequency === "monthly") return sum + sub.amount;
    if (sub.frequency === "yearly") return sum + sub.amount / 12;
    if (sub.frequency === "weekly") return sum + (sub.amount * 52) / 12;
    if (sub.frequency === "biweekly") return sum + (sub.amount * 26) / 12;
    if (sub.frequency === "daily") return sum + (sub.amount * 365) / 12;
    return sum;
  }, 0);

  const yearlyTotal = activeSubscriptions.reduce((sum, sub) => {
    if (sub.frequency === "monthly") return sum + sub.amount * 12;
    if (sub.frequency === "yearly") return sum + sub.amount;
    if (sub.frequency === "weekly") return sum + sub.amount * 52;
    if (sub.frequency === "biweekly") return sum + sub.amount * 26;
    if (sub.frequency === "daily") return sum + sub.amount * 365;
    return sum;
  }, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading subscriptions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Subscriptions Tracker</h1>
          <p className="text-muted-foreground">
            Track your recurring expense subscriptions
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Subscription
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currencySymbol}
              {monthlyTotal.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {activeSubscriptions.length} subscriptions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yearly Cost</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currencySymbol}
              {yearlyTotal.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Annual subscription cost
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Subscriptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSubscriptions.length}</div>
            <p className="text-xs text-muted-foreground">
              {inactiveSubscriptions.length} inactive
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Subscriptions */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Active Subscriptions</h2>
        {activeSubscriptions.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">
                No active subscriptions. Add one to get started!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {activeSubscriptions.map((subscription) => {
              const nextBilling = getNextBillingDate(subscription);
              const daysUntilNext = differenceInDays(nextBilling, new Date());
              const subscriptionId = typeof subscription._id === 'string' ? subscription._id : subscription._id.toString();

              return (
                <Card key={subscriptionId}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle>{subscription.description || subscription.categoryName}</CardTitle>
                        <CardDescription>{subscription.categoryName}</CardDescription>
                      </div>
                      <Badge>
                        {subscription.frequency}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Amount</span>
                        <span className="font-medium">
                          {currencySymbol}
                          {subscription.amount.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Next Billing</span>
                        <span className="font-medium">
                          {format(nextBilling, "MMM d, yyyy")}
                        </span>
                      </div>
                      {daysUntilNext <= 7 && daysUntilNext >= 0 && (
                        <div className="flex items-center gap-2 text-sm text-orange-600">
                          <Calendar className="h-3 w-3" />
                          Due in {daysUntilNext} {daysUntilNext === 1 ? "day" : "days"}
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Annual Cost</span>
                        <span className="font-medium">
                          {currencySymbol}
                          {(subscription.frequency === "yearly"
                            ? subscription.amount
                            : subscription.frequency === "monthly"
                            ? subscription.amount * 12
                            : subscription.frequency === "weekly"
                            ? subscription.amount * 52
                            : subscription.frequency === "biweekly"
                            ? subscription.amount * 26
                            : subscription.amount * 365
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(subscription)}
                        className="flex-1"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(subscription)}
                        className="flex-1"
                      >
                        Deactivate
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(subscriptionId)}
                      >
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Inactive Subscriptions */}
      {inactiveSubscriptions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Inactive Subscriptions</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {inactiveSubscriptions.map((subscription) => {
              const subscriptionId = typeof subscription._id === 'string' ? subscription._id : subscription._id.toString();
              return (
              <Card key={subscriptionId} className="opacity-60">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle>{subscription.description || subscription.categoryName}</CardTitle>
                      <CardDescription>{subscription.categoryName}</CardDescription>
                    </div>
                    <Badge variant="outline">Inactive</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-medium">
                      {currencySymbol}
                      {subscription.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(subscription)}
                      className="flex-1"
                    >
                      Reactivate
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(subscriptionId)}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
            })}
          </div>
        </div>
      )}

      {/* Recurring Transaction Form Dialog */}
      {incomeCategories && expenseCategories && (
        <RecurringTransactionForm
          open={isFormOpen}
          onOpenChange={handleFormOpenChange}
          budgetId={budgetId}
          incomeCategories={incomeCategories}
          expenseCategories={expenseCategories}
          recurringTransaction={editingSubscription}
        />
      )}
    </div>
  );
}
