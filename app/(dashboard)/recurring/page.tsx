import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getCollection } from "@/lib/db";
import { RecurringTransactionsManagement } from "./RecurringTransactionsManagement";
import type { Budget } from "@/types";

export default async function RecurringTransactionsPage() {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    redirect("/");
  }

  // Get the user's budget
  const budgetsCollection = await getCollection<Budget>("budgets");
  const budget = await budgetsCollection.findOne({ clerkId });

  if (!budget) {
    redirect("/dashboard");
  }

  return <RecurringTransactionsManagement budgetId={budget._id.toString()} />;
}
