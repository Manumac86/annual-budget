import { useSWRConfig } from "swr";
import type { SubscriptionCreate, SubscriptionUpdate } from "@/types";

export function useSubscriptionMutations() {
  const { mutate } = useSWRConfig();

  const createSubscription = async (data: SubscriptionCreate) => {
    const res = await fetch("/api/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Failed to create subscription");

    // Invalidate all subscriptions queries
    mutate(
      (key) =>
        typeof key === "string" && key.startsWith("/api/subscriptions?budgetId=")
    );

    return res.json();
  };

  const updateSubscription = async (id: string, data: SubscriptionUpdate) => {
    const res = await fetch(`/api/subscriptions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Failed to update subscription");

    // Invalidate all subscriptions queries
    mutate(
      (key) =>
        typeof key === "string" && key.startsWith("/api/subscriptions?budgetId=")
    );
    mutate(`/api/subscriptions/${id}`);

    return res.json();
  };

  const deleteSubscription = async (id: string) => {
    const res = await fetch(`/api/subscriptions/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("Failed to delete subscription");

    // Invalidate all subscriptions queries
    mutate(
      (key) =>
        typeof key === "string" && key.startsWith("/api/subscriptions?budgetId=")
    );

    return res.json();
  };

  return { createSubscription, updateSubscription, deleteSubscription };
}
