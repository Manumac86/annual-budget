import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import type { User, Budget } from "@/types";
import AccountsView from "./AccountsView";

export default async function AccountsPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const db = await getDb();
  const usersCollection = db.collection<User>("users");
  const user = await usersCollection.findOne({ clerkId });
  if (!user || !user.settings) redirect("/setup");

  const budgetsCollection = db.collection<Budget>("budgets");
  const budget = await budgetsCollection.findOne({
    clerkId,
    year: user.settings.year,
  });
  if (!budget) redirect("/setup");

  return (
    <AccountsView
      budgetId={budget._id.toString()}
      currencySymbol={user.settings.currencySymbol}
    />
  );
}
