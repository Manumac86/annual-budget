import useSWR from "swr";
import type { SavingsGoal } from "@/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface SerializableSavingsGoal extends Omit<SavingsGoal, "_id" | "budgetId"> {
  _id: string;
  budgetId: string;
}

export function useSavingsGoals(budgetId: string | null) {
  const url = budgetId ? `/api/savings/goals?budgetId=${budgetId}` : null;

  const { data, error, isLoading, mutate } = useSWR<SerializableSavingsGoal[]>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
  );

  return {
    goals: data,
    isLoading,
    isError: error,
    mutate,
  };
}
