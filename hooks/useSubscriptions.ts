import useSWR from "swr";
import type { Subscription } from "@/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface SerializableSubscription extends Omit<Subscription, "_id" | "budgetId"> {
  _id: string;
  budgetId: string;
}

export function useSubscriptions(budgetId: string | null) {
  const url = budgetId ? `/api/subscriptions?budgetId=${budgetId}` : null;

  const { data, error, isLoading, mutate } = useSWR<SerializableSubscription[]>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
  );

  return {
    subscriptions: data,
    isLoading,
    isError: error,
    mutate,
  };
}
