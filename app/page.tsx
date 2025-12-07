import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const { userId } = await auth();

  // If user is signed in, redirect to dashboard
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-5xl font-bold tracking-tight mb-6">
          Annual Budget
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Take control of your finances with our comprehensive budgeting tool.
          Track income, expenses, and savings goals all in one place.
        </p>

        <div className="flex gap-4 justify-center">
          <SignInButton mode="modal">
            <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
              Sign In
            </button>
          </SignInButton>

          <SignUpButton mode="modal">
            <button className="px-6 py-3 border border-border rounded-lg font-medium hover:bg-muted transition-colors">
              Get Started
            </button>
          </SignUpButton>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-lg bg-card border">
            <h3 className="font-semibold mb-2">Track Everything</h3>
            <p className="text-sm text-muted-foreground">
              Monitor your income, expenses, and savings across all categories
            </p>
          </div>
          <div className="p-6 rounded-lg bg-card border">
            <h3 className="font-semibold mb-2">Monthly Insights</h3>
            <p className="text-sm text-muted-foreground">
              Get detailed monthly breakdowns and year-over-year comparisons
            </p>
          </div>
          <div className="p-6 rounded-lg bg-card border">
            <h3 className="font-semibold mb-2">50/30/20 Rule</h3>
            <p className="text-sm text-muted-foreground">
              Automatically calculate and track the 50/30/20 budgeting method
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
