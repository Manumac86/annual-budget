"use client";

import useSWR from "swr";
import type { SerializableIncomeCategory, SerializableExpenseCategory } from "@/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useIncomeCategories(budgetId: string | null) {
  const url = budgetId ? `/api/categories/income?budgetId=${budgetId}` : null;

  const { data, error, isLoading, mutate } = useSWR<{
    categories: SerializableIncomeCategory[];
  }>(url, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 5000,
  });

  return {
    categories: data?.categories ?? [],
    isLoading,
    isError: error,
    mutate,
  };
}

export function useExpenseCategories(budgetId: string | null) {
  const url = budgetId ? `/api/categories/expense?budgetId=${budgetId}` : null;

  const { data, error, isLoading, mutate } = useSWR<{
    categories: SerializableExpenseCategory[];
  }>(url, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 5000,
  });

  return {
    categories: data?.categories ?? [],
    isLoading,
    isError: error,
    mutate,
  };
}
