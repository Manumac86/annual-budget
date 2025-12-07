import { useSWRConfig } from "swr";

interface CreateAccountData {
  budgetId: string;
  name: string;
  type: "checking" | "savings" | "credit" | "investment" | "other";
  balance: number;
  currency: string;
}

interface UpdateAccountData {
  name?: string;
  type?: "checking" | "savings" | "credit" | "investment" | "other";
  balance?: number;
  currency?: string;
  isActive?: boolean;
}

export function useAccountMutations() {
  const { mutate } = useSWRConfig();

  const createAccount = async (data: CreateAccountData) => {
    const response = await fetch("/api/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create account");
    }

    const result = await response.json();

    // Invalidate accounts cache
    mutate((key) => typeof key === "string" && key.startsWith("/api/accounts"));

    return result;
  };

  const updateAccount = async (id: string, data: UpdateAccountData) => {
    const response = await fetch(`/api/accounts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update account");
    }

    const result = await response.json();

    // Invalidate accounts cache
    mutate((key) => typeof key === "string" && key.startsWith("/api/accounts"));

    return result;
  };

  const deleteAccount = async (id: string) => {
    const response = await fetch(`/api/accounts/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete account");
    }

    // Invalidate accounts cache
    mutate((key) => typeof key === "string" && key.startsWith("/api/accounts"));

    return { success: true };
  };

  return {
    createAccount,
    updateAccount,
    deleteAccount,
  };
}
