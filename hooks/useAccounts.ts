import useSWR from "swr";
import type { Account } from "@/types";

interface AccountsResponse {
  accounts: Account[];
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useAccounts(budgetId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<AccountsResponse>(
    budgetId ? `/api/accounts?budgetId=${budgetId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return {
    accounts: data?.accounts || [],
    isLoading,
    isError: error,
    error,
    mutate,
  };
}
