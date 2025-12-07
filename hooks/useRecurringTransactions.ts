import useSWR from "swr";
import type { RecurringTransaction } from "@/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useRecurringTransactions(budgetId: string | undefined) {
  const { data, error, mutate } = useSWR<{
    recurringTransactions: RecurringTransaction[];
  }>(
    budgetId ? `/api/recurring-transactions?budgetId=${budgetId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  return {
    recurringTransactions: data?.recurringTransactions ?? [],
    isLoading: !error && !data,
    error,
    mutate,
  };
}
