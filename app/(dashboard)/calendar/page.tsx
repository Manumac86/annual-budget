import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getCollection } from "@/lib/db";
import type { User, Budget } from "@/types";
import { CalendarView } from "./CalendarView";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    redirect("/");
  }

  // Check if user exists in database
  const usersCollection = await getCollection<User>("users");
  const user = await usersCollection.findOne({ clerkId });

  // If user doesn't exist or hasn't completed setup, redirect to setup
  if (!user || !user.settings) {
    redirect("/setup");
  }

  // Get the user's budget
  const budgetsCollection = await getCollection<Budget>("budgets");
  const budget = await budgetsCollection.findOne({
    clerkId,
    year: user.settings.year,
  });

  if (!budget) {
    redirect("/setup");
  }

  return (
    <CalendarView
      budgetId={budget._id.toString()}
      currencySymbol={user.settings.currencySymbol}
      year={user.settings.year}
    />
  );
}
