import { useSWRConfig } from "swr";

interface CreateRecurringTransactionData {
  budgetId: string;
  type: "income" | "expense";
  categoryId: string;
  categoryName: string;
  amount: number;
  description?: string;
  frequency: "daily" | "weekly" | "biweekly" | "monthly" | "yearly";
  startDate: Date;
  endDate?: Date | null;
  dayOfMonth?: number;
  isSubscription?: boolean;
}

interface UpdateRecurringTransactionData {
  amount?: number;
  description?: string;
  frequency?: "daily" | "weekly" | "biweekly" | "monthly" | "yearly";
  startDate?: Date;
  endDate?: Date | null;
  dayOfMonth?: number;
  isActive?: boolean;
}

export function useRecurringTransactionMutations() {
  const { mutate } = useSWRConfig();

  const createRecurringTransaction = async (
    data: CreateRecurringTransactionData
  ) => {
    const response = await fetch("/api/recurring-transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create recurring transaction");
    }

    const result = await response.json();

    // Invalidate recurring transactions cache
    mutate(
      (key) =>
        typeof key === "string" && key.startsWith("/api/recurring-transactions")
    );

    return result;
  };

  const updateRecurringTransaction = async (
    id: string,
    data: UpdateRecurringTransactionData
  ) => {
    const response = await fetch(`/api/recurring-transactions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update recurring transaction");
    }

    const result = await response.json();

    // Invalidate recurring transactions cache
    mutate(
      (key) =>
        typeof key === "string" && key.startsWith("/api/recurring-transactions")
    );

    return result;
  };

  const deleteRecurringTransaction = async (id: string) => {
    const response = await fetch(`/api/recurring-transactions/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete recurring transaction");
    }

    // Invalidate recurring transactions cache
    mutate(
      (key) =>
        typeof key === "string" && key.startsWith("/api/recurring-transactions")
    );

    return { success: true };
  };

  const pauseRecurringTransaction = async (id: string) => {
    return updateRecurringTransaction(id, { isActive: false });
  };

  const resumeRecurringTransaction = async (id: string) => {
    return updateRecurringTransaction(id, { isActive: true });
  };

  return {
    createRecurringTransaction,
    updateRecurringTransaction,
    deleteRecurringTransaction,
    pauseRecurringTransaction,
    resumeRecurringTransaction,
  };
}
