"use client";

import { useSWRConfig } from "swr";

export function useCategoryMutations() {
  const { mutate } = useSWRConfig();

  const updateIncomeCategory = async (
    id: string,
    payload: { name?: string; projectedAmount?: number }
  ) => {
    const res = await fetch(`/api/categories/income/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to update income category");
    }

    // Invalidate all income category caches
    mutate(
      (key) =>
        typeof key === "string" && key.startsWith("/api/categories/income")
    );

    return res.json();
  };

  const updateExpenseCategory = async (
    id: string,
    payload: {
      name?: string;
      projectedAmount?: number;
      category?: "needs" | "wants" | "savings";
    }
  ) => {
    const res = await fetch(`/api/categories/expense/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to update expense category");
    }

    // Invalidate all expense category caches
    mutate(
      (key) =>
        typeof key === "string" && key.startsWith("/api/categories/expense")
    );

    return res.json();
  };

  const reorderIncomeCategories = async (
    budgetId: string,
    categories: Array<{ id: string; order: number }>
  ) => {
    const res = await fetch("/api/categories/income/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ budgetId, categories }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to reorder income categories");
    }

    // Invalidate all income category caches
    mutate(
      (key) =>
        typeof key === "string" && key.startsWith("/api/categories/income")
    );

    return res.json();
  };

  const reorderExpenseCategories = async (
    budgetId: string,
    categories: Array<{ id: string; order: number }>
  ) => {
    const res = await fetch("/api/categories/expense/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ budgetId, categories }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to reorder expense categories");
    }

    // Invalidate all expense category caches
    mutate(
      (key) =>
        typeof key === "string" && key.startsWith("/api/categories/expense")
    );

    return res.json();
  };

  const archiveIncomeCategory = async (id: string) => {
    const res = await fetch(`/api/categories/income/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to archive income category");
    }

    // Invalidate all income category caches
    mutate(
      (key) =>
        typeof key === "string" && key.startsWith("/api/categories/income")
    );

    return res.json();
  };

  const archiveExpenseCategory = async (id: string) => {
    const res = await fetch(`/api/categories/expense/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to archive expense category");
    }

    // Invalidate all expense category caches
    mutate(
      (key) =>
        typeof key === "string" && key.startsWith("/api/categories/expense")
    );

    return res.json();
  };

  return {
    updateIncomeCategory,
    updateExpenseCategory,
    reorderIncomeCategories,
    reorderExpenseCategories,
    archiveIncomeCategory,
    archiveExpenseCategory,
  };
}
