import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getCollection } from "@/lib/db";
import type { User, Budget } from "@/types";
import { MonthView } from "./MonthView";

interface MonthPageProps {
  params: Promise<{
    month: string;
  }>;
}

export default async function MonthPage({ params }: MonthPageProps) {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    redirect("/");
  }

  const { month } = await params;
  const monthNumber = parseInt(month);

  if (isNaN(monthNumber) || monthNumber < 1 || monthNumber > 12) {
    redirect("/dashboard");
  }

  // Get user settings
  const usersCollection = await getCollection<User>("users");
  const user = await usersCollection.findOne({ clerkId });

  if (!user || !user.settings) {
    redirect("/setup");
  }

  // Get user's budget for the year
  const budgetsCollection = await getCollection<Budget>("budgets");
  const budget = await budgetsCollection.findOne({
    clerkId,
    year: user.settings.year,
  });

  if (!budget) {
    redirect("/setup");
  }

  return (
    <MonthView
      month={monthNumber}
      year={user.settings.year}
      budgetId={budget._id.toString()}
      currencySymbol={user.settings.currencySymbol}
      rolloverEnabled={user.settings.rolloverEnabled}
    />
  );
}
