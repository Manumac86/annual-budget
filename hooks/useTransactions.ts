"use client";

import useSWR from "swr";
import type { Transaction } from "@/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useTransactions(
  budgetId: string | null,
  month?: number | null,
  year?: number
) {
  const params = new URLSearchParams();

  if (budgetId) {
    params.append("budgetId", budgetId);
  }

  if (month !== undefined && month !== null) {
    params.append("month", month.toString());
  }

  if (year !== undefined) {
    params.append("year", year.toString());
  }

  const url = budgetId ? `/api/transactions?${params.toString()}` : null;

  const { data, error, isLoading, mutate } = useSWR<{
    transactions: Transaction[];
  }>(url, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 2000,
  });

  return {
    transactions: data?.transactions ?? [],
    isLoading,
    isError: error,
    mutate,
  };
}
