import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import type { User, Budget } from "@/types";
import SavingsPlannerView from "./SavingsPlannerView";

export default async function SavingsPlannerPage() {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    redirect("/sign-in");
  }

  const db = await getDb();

  // Fetch user
  const usersCollection = db.collection<User>("users");
  const user = await usersCollection.findOne({ clerkId });

  if (!user || !user.settings) {
    redirect("/setup");
  }

  // Fetch budget
  const budgetsCollection = db.collection<Budget>("budgets");
  const budget = await budgetsCollection.findOne({
    clerkId,
    year: user.settings.year,
  });

  if (!budget) {
    redirect("/setup");
  }

  return (
    <SavingsPlannerView
      budgetId={budget._id.toString()}
      currencySymbol={user.settings.currencySymbol}
    />
  );
}
