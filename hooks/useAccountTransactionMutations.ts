import { useSWRConfig } from "swr";

interface CreateAccountTransactionData {
  budgetId: string;
  accountId: string;
  accountName: string;
  type: "transfer" | "interest" | "adjustment";
  amount: number;
  date: Date;
  description?: string;
  // For transfers
  toAccountId?: string;
  toAccountName?: string;
}

export function useAccountTransactionMutations() {
  const { mutate } = useSWRConfig();

  const createAccountTransaction = async (data: CreateAccountTransactionData) => {
    const response = await fetch("/api/account-transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create account transaction");
    }

    const result = await response.json();

    // Invalidate account transactions cache
    mutate(
      (key) =>
        typeof key === "string" && key.startsWith("/api/account-transactions")
    );

    // Also invalidate accounts cache (balances may have changed)
    mutate((key) => typeof key === "string" && key.startsWith("/api/accounts"));

    return result;
  };

  const deleteAccountTransaction = async (id: string) => {
    const response = await fetch(`/api/account-transactions/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete account transaction");
    }

    // Invalidate account transactions cache
    mutate(
      (key) =>
        typeof key === "string" && key.startsWith("/api/account-transactions")
    );

    // Also invalidate accounts cache (balances may have changed)
    mutate((key) => typeof key === "string" && key.startsWith("/api/accounts"));

    return { success: true };
  };

  // Helper function to create a transfer (convenience method)
  const createTransfer = async (
    fromAccountId: string,
    fromAccountName: string,
    toAccountId: string,
    toAccountName: string,
    amount: number,
    date: Date,
    budgetId: string,
    description?: string
  ) => {
    return createAccountTransaction({
      budgetId,
      accountId: fromAccountId,
      accountName: fromAccountName,
      type: "transfer",
      amount,
      date,
      description,
      toAccountId,
      toAccountName,
    });
  };

  // Helper function to create interest (convenience method)
  const createInterest = async (
    accountId: string,
    accountName: string,
    amount: number,
    date: Date,
    budgetId: string,
    description?: string
  ) => {
    return createAccountTransaction({
      budgetId,
      accountId,
      accountName,
      type: "interest",
      amount,
      date,
      description,
    });
  };

  // Helper function to create adjustment (convenience method)
  const createAdjustment = async (
    accountId: string,
    accountName: string,
    amount: number,
    date: Date,
    budgetId: string,
    description?: string
  ) => {
    return createAccountTransaction({
      budgetId,
      accountId,
      accountName,
      type: "adjustment",
      amount,
      date,
      description,
    });
  };

  return {
    createAccountTransaction,
    deleteAccountTransaction,
    createTransfer,
    createInterest,
    createAdjustment,
  };
}
