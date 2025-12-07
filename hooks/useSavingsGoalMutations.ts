import { useSWRConfig } from "swr";
import type { SavingsGoalCreate, SavingsGoalUpdate } from "@/types";

export function useSavingsGoalMutations() {
  const { mutate } = useSWRConfig();

  const createGoal = async (data: SavingsGoalCreate) => {
    const res = await fetch("/api/savings/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Failed to create goal");

    // Invalidate all goals queries
    mutate(
      (key) =>
        typeof key === "string" && key.startsWith("/api/savings/goals?budgetId=")
    );

    return res.json();
  };

  const updateGoal = async (id: string, data: SavingsGoalUpdate) => {
    const res = await fetch(`/api/savings/goals/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Failed to update goal");

    // Invalidate all goals queries
    mutate(
      (key) =>
        typeof key === "string" && key.startsWith("/api/savings/goals?budgetId=")
    );
    mutate(`/api/savings/goals/${id}`);

    return res.json();
  };

  const deleteGoal = async (id: string) => {
    const res = await fetch(`/api/savings/goals/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("Failed to delete goal");

    // Invalidate all goals queries
    mutate(
      (key) =>
        typeof key === "string" && key.startsWith("/api/savings/goals?budgetId=")
    );

    return res.json();
  };

  return { createGoal, updateGoal, deleteGoal };
}
