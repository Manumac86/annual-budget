"use client";

import { useState } from "react";
import { Plus, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useSavingsGoals } from "@/hooks/useSavingsGoals";
import { useSavingsGoalMutations } from "@/hooks/useSavingsGoalMutations";
import SavingsGoalForm from "@/components/savings/SavingsGoalForm";
import ContributionDialog from "@/components/savings/ContributionDialog";

interface SavingsPlannerViewProps {
  budgetId: string;
  currencySymbol: string;
}

export default function SavingsPlannerView({
  budgetId,
  currencySymbol,
}: SavingsPlannerViewProps) {
  const { goals, isLoading } = useSavingsGoals(budgetId);
  const { deleteGoal, updateGoal } = useSavingsGoalMutations();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any | null>(null);
  const [isContributionOpen, setIsContributionOpen] = useState(false);
  const [contributingGoal, setContributingGoal] = useState<any | null>(null);

  const handleEdit = (goal: any) => {
    setEditingGoal(goal);
    setIsFormOpen(true);
  };

  const handleContribute = (goal: any) => {
    setContributingGoal(goal);
    setIsContributionOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this savings goal?")) {
      try {
        await deleteGoal(id);
      } catch (error) {
        console.error("Failed to delete goal:", error);
      }
    }
  };

  const handleToggleComplete = async (goal: any) => {
    try {
      await updateGoal(goal._id, { isCompleted: !goal.isCompleted });
    } catch (error) {
      console.error("Failed to update goal:", error);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingGoal(null);
  };

  const handleContributionSubmit = async (
    goalId: string,
    newAmount: number,
    contributionAmount: number,
    type: "deposit" | "withdrawal"
  ) => {
    // Create the new contribution entry
    const contribution = {
      date: new Date(),
      amount: contributionAmount,
      type,
    };

    // Find the current goal to get existing contributions
    const currentGoal = goals?.find((g) => g._id === goalId);
    if (!currentGoal) return;

    // Update with new amount and append contribution
    await updateGoal(goalId, {
      currentAmount: newAmount,
      contributions: [...(currentGoal.contributions || []), contribution] as any,
    });
  };

  const handleContributionClose = () => {
    setIsContributionOpen(false);
    setContributingGoal(null);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "default";
    }
  };

  const activeGoals = goals?.filter((g) => !g.isCompleted) || [];
  const completedGoals = goals?.filter((g) => g.isCompleted) || [];

  const totalTarget = activeGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalCurrent = activeGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalProgress = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading savings goals...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Savings Planner</h1>
          <p className="text-muted-foreground">
            Track your savings goals and progress
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Goal
        </Button>
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Progress</CardTitle>
          <CardDescription>
            Your total savings progress across all active goals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Saved</span>
              <span className="font-medium">
                {currencySymbol}
                {totalCurrent.toFixed(2)} / {currencySymbol}
                {totalTarget.toFixed(2)}
              </span>
            </div>
            <Progress value={totalProgress} className="h-3" />
            <div className="text-right text-sm text-muted-foreground">
              {totalProgress.toFixed(1)}% Complete
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Goals */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Active Goals</h2>
        {activeGoals.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">
                No active savings goals. Create one to get started!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {activeGoals.map((goal) => {
              const progress =
                goal.targetAmount > 0
                  ? (goal.currentAmount / goal.targetAmount) * 100
                  : 0;
              const remaining = goal.targetAmount - goal.currentAmount;
              const daysLeft = goal.deadline
                ? Math.ceil(
                    (new Date(goal.deadline).getTime() - new Date().getTime()) /
                      (1000 * 60 * 60 * 24)
                  )
                : null;

              return (
                <Card key={goal._id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle>{goal.name}</CardTitle>
                        {goal.deadline && (
                          <CardDescription>
                            {daysLeft !== null && daysLeft > 0
                              ? `${daysLeft} days left`
                              : daysLeft === 0
                              ? "Due today"
                              : "Overdue"}
                          </CardDescription>
                        )}
                      </div>
                      <Badge variant={getPriorityColor(goal.priority) as any}>
                        {goal.priority}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">
                          {currencySymbol}
                          {goal.currentAmount.toFixed(2)} / {currencySymbol}
                          {goal.targetAmount.toFixed(2)}
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">
                          {progress.toFixed(1)}%
                        </span>
                        <span className="text-muted-foreground">
                          {currencySymbol}
                          {remaining.toFixed(2)} remaining
                        </span>
                      </div>
                    </div>

                    {/* Contribution History */}
                    {goal.contributions && goal.contributions.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Recent Contributions</h4>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {[...goal.contributions]
                            .reverse()
                            .slice(0, 5)
                            .map((contribution: any, idx: number) => (
                              <div
                                key={idx}
                                className="flex justify-between items-center text-xs p-2 rounded bg-muted"
                              >
                                <div className="flex items-center gap-2">
                                  <span
                                    className={
                                      contribution.type === "deposit"
                                        ? "text-green-600"
                                        : "text-red-600"
                                    }
                                  >
                                    {contribution.type === "deposit" ? "+" : "-"}
                                    {currencySymbol}
                                    {contribution.amount.toFixed(2)}
                                  </span>
                                  {contribution.note && (
                                    <span className="text-muted-foreground">
                                      ({contribution.note})
                                    </span>
                                  )}
                                </div>
                                <span className="text-muted-foreground">
                                  {new Date(contribution.date).toLocaleDateString()}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleContribute(goal)}
                        className="w-full"
                      >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Contribution
                      </Button>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(goal)}
                          className="flex-1"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleComplete(goal)}
                          className="flex-1"
                        >
                          Complete
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(goal._id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Completed Goals</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {completedGoals.map((goal) => (
              <Card key={goal._id} className="opacity-75">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle>{goal.name}</CardTitle>
                    <Badge variant="secondary">Completed</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Target</span>
                    <span className="font-medium">
                      {currencySymbol}
                      {goal.targetAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleComplete(goal)}
                      className="flex-1"
                    >
                      Reactivate
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(goal._id)}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Savings Goal Form Dialog */}
      <SavingsGoalForm
        open={isFormOpen}
        onClose={handleFormClose}
        budgetId={budgetId}
        currencySymbol={currencySymbol}
        savingsGoal={editingGoal}
      />

      {/* Contribution Dialog */}
      {contributingGoal && (
        <ContributionDialog
          open={isContributionOpen}
          onClose={handleContributionClose}
          goal={contributingGoal}
          currencySymbol={currencySymbol}
          onSubmit={handleContributionSubmit}
        />
      )}
    </div>
  );
}
