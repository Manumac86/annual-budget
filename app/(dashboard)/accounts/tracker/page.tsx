import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import type { User, Budget } from "@/types";
import AccountTrackerView from "./AccountTrackerView";

export default async function AccountTrackerPage() {
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
    <AccountTrackerView
      budgetId={budget._id.toString()}
      currencySymbol={user.settings.currencySymbol}
      year={user.settings.year}
    />
  );
}
