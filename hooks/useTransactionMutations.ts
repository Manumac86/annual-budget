"use client";

import { useSWRConfig } from "swr";
import type { TransactionCreateInput } from "@/lib/validations";
import type { TransactionUpdate } from "@/types";

export function useTransactionMutations() {
  const { mutate } = useSWRConfig();

  const createTransaction = async (data: TransactionCreateInput) => {
    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to create transaction");
    }

    // Invalidate all transaction caches
    mutate(
      (key) => typeof key === "string" && key.startsWith("/api/transactions")
    );

    return res.json();
  };

  const updateTransaction = async (
    id: string,
    payload: TransactionUpdate
  ) => {
    const res = await fetch(`/api/transactions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to update transaction");
    }

    // Invalidate all transaction caches
    mutate(
      (key) => typeof key === "string" && key.startsWith("/api/transactions")
    );

    return res.json();
  };

  const deleteTransaction = async (id: string) => {
    const res = await fetch(`/api/transactions/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to delete transaction");
    }

    // Invalidate all transaction caches
    mutate(
      (key) => typeof key === "string" && key.startsWith("/api/transactions")
    );

    return res.json();
  };

  return { createTransaction, updateTransaction, deleteTransaction };
}
