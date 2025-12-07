import useSWR from "swr";
import type { AccountTransaction } from "@/types";

interface AccountTransactionsResponse {
  accountTransactions: AccountTransaction[];
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useAccountTransactions(
  budgetId: string | null,
  accountId?: string | null,
  month?: number | null,
  year?: number | null
) {
  // Build query parameters
  const params = new URLSearchParams();
  if (budgetId) params.append("budgetId", budgetId);
  if (accountId) params.append("accountId", accountId);
  if (month) params.append("month", month.toString());
  if (year) params.append("year", year.toString());

  const queryString = params.toString();
  const url = budgetId ? `/api/account-transactions?${queryString}` : null;

  const { data, error, isLoading, mutate } = useSWR<AccountTransactionsResponse>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return {
    accountTransactions: data?.accountTransactions || [],
    isLoading,
    isError: error,
    error,
    mutate,
  };
}
