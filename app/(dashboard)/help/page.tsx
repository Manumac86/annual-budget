import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BookOpen,
  Calendar,
  CreditCard,
  Home,
  PieChart,
  PiggyBank,
  Repeat,
  Settings,
  TrendingUp,
  Wallet,
  BarChart3,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Help & Instructions | BudgetFlow",
  description:
    "Learn how to use BudgetFlow to manage your annual budget effectively",
};

export default function HelpPage() {
  const features = [
    {
      icon: Settings,
      title: "Setup",
      description: "Configure your budget settings",
      steps: [
        "Select your country and currency",
        "Choose your budget starting month and year",
        "Enable or disable rollover (carry over balances)",
        "Add income categories (salary, freelance, etc.)",
        "Add expense categories and classify them as Needs (50%), Wants (30%), or Savings (20%)",
        "Set projected amounts for each category",
      ],
    },
    {
      icon: Home,
      title: "Dashboard",
      description: "Your annual budget overview",
      steps: [
        "View all 12 months at a glance",
        "See income vs expenses for each month",
        "Track your balance across the year",
        "Monitor upcoming recurring transactions",
        "Check upcoming income sources",
        "Click on any month to view details",
      ],
    },
    {
      icon: Calendar,
      title: "Monthly View",
      description: "Manage transactions month by month",
      steps: [
        "Add income transactions by category",
        "Add expense transactions by category",
        "Link transactions to accounts (optional)",
        "View projected vs actual amounts",
        "See rollover balance from previous month",
        "Track income and expense breakdowns with charts",
        "Edit or delete transactions as needed",
      ],
    },
    {
      icon: Repeat,
      title: "Recurring Transactions",
      description: "Automate repeating income and expenses",
      steps: [
        "Create recurring transactions for regular bills",
        "Set frequency: daily, weekly, biweekly, monthly, or yearly",
        "Choose start and end dates",
        "Mark as subscription for easy tracking",
        "Set as active or inactive",
        "Recurring transactions automatically appear in monthly views",
      ],
    },
    {
      icon: Calendar,
      title: "Calendar View",
      description: "Visualize transactions by date",
      steps: [
        "See all transactions on a monthly calendar",
        "View daily transaction totals",
        "Check weekly totals showing remaining balance for variable expenses",
        "Track income, bills, debts, and savings throughout the month",
        "Identify spending patterns and plan ahead",
        "Navigate between months easily",
      ],
    },
    {
      icon: PieChart,
      title: "50/30/20 Budget Rule",
      description: "Follow the balanced budgeting method",
      steps: [
        "50% for Needs (essentials like rent, groceries)",
        "30% for Wants (entertainment, dining out)",
        "20% for Savings (emergency fund, investments)",
        "Track monthly performance against the rule",
        "View projected vs actual for each category",
        "See annual trends and improvements",
      ],
    },
    {
      icon: BarChart3,
      title: "Breakdown",
      description: "Detailed expense analysis",
      steps: [
        "View comprehensive expense breakdown by category",
        "See monthly spending patterns",
        "Compare categories across months",
        "Identify areas for improvement",
        "Track spending trends over time",
      ],
    },
    {
      icon: PiggyBank,
      title: "Savings Planner",
      description: "Set and track savings goals",
      steps: [
        "Create savings goals with target amounts",
        "Set deadlines for your goals",
        "Assign priority levels (low, medium, high)",
        "Add deposits to track progress",
        "Withdraw when needed",
        "View progress charts and completion status",
      ],
    },
    {
      icon: CreditCard,
      title: "Subscriptions",
      description: "Monitor all your subscriptions",
      steps: [
        "View all active subscriptions in one place",
        "See next billing dates",
        "Track monthly and yearly costs",
        "Identify subscription frequency",
        "Manage or cancel subscriptions",
        "Subscriptions are auto-filtered from recurring transactions",
      ],
    },
    {
      icon: Wallet,
      title: "Accounts",
      description: "Manage your financial accounts",
      steps: [
        "Add bank accounts, credit cards, investments",
        "Set initial balances",
        "Track account types: checking, savings, credit, investment",
        "Link transactions to accounts",
        "View account tracker for monthly activity",
        "Monitor IN/OUT flows, transfers, and interest",
      ],
    },
    {
      icon: TrendingUp,
      title: "Account Tracker",
      description: "Monthly account activity tracking",
      steps: [
        "View all account balances by month",
        "See IN (income) and OUT (expenses) for each account",
        "Track transfers between accounts",
        "Record interest earned or charged",
        "Make balance adjustments when needed",
        "View cumulative balances month over month",
      ],
    },
    {
      icon: TrendingUp,
      title: "Net Worth Tracker (Comming Soon)",
      description: "Track your complete financial picture",
      steps: [
        "Enter your assets: Cash, Investments, Real Estate, and Other assets",
        "Enter your liabilities: Credit cards, Loans, Mortgages, and Other debts",
        "View your net worth calculation (Assets - Liabilities)",
        "Track changes over time with historical entries",
        "Visualize your wealth growth with trend charts",
        "Monitor your financial progress month by month",
      ],
    },
  ];

  const faqs = [
    {
      question: "How do I get started with BudgetFlow?",
      answer:
        "Start by visiting the Setup page to configure your budget. Add your income and expense categories, set projected amounts, and choose your preferences. Then navigate to the Dashboard to begin tracking your finances.",
    },
    {
      question: "What is the 50/30/20 rule?",
      answer:
        "The 50/30/20 rule is a budgeting method where you allocate 50% of your income to needs (essentials), 30% to wants (lifestyle), and 20% to savings (financial goals). BudgetFlow automatically tracks your spending against these categories.",
    },
    {
      question: "How do recurring transactions work?",
      answer:
        "Recurring transactions are automatically added to your monthly views based on their frequency. For example, a monthly subscription will appear in each month, while a biweekly paycheck appears twice per month. You can manage all recurring transactions from the Recurring page.",
    },
    {
      question: "What is rollover?",
      answer:
        "Rollover carries your balance from one month to the next. If enabled in Setup, any surplus or deficit from the previous month will be added to the current month's starting balance, giving you an accurate running total.",
    },
    {
      question: "How do I transfer money between accounts?",
      answer:
        "In the Account Tracker page, use the 'Transfer' button to move money between accounts. This creates a dual transaction - money out of one account and into another - keeping your balances accurate.",
    },
    {
      question: "Can I link transactions to specific accounts?",
      answer:
        "Yes! When creating or editing a transaction in the Monthly View, you can select which account the transaction belongs to. This helps track which account money is coming from or going to.",
    },
    {
      question: "How do I track my savings goals?",
      answer:
        "Use the Savings Planner to create goals with target amounts and deadlines. Add deposits when you save money toward the goal, and track your progress with visual charts. You can set priority levels to focus on what matters most.",
    },
    {
      question: "What's the difference between Needs, Wants, and Savings?",
      answer:
        "Needs are essential expenses you can't avoid (rent, groceries, utilities). Wants are lifestyle choices (dining out, entertainment). Savings are for your future (emergency fund, investments, debt payoff). Classify your expense categories during Setup.",
    },
    {
      question: "How do I view my subscription costs?",
      answer:
        "Go to the Subscriptions page to see all recurring transactions marked as subscriptions. You'll see next billing dates, frequencies, and total monthly/yearly costs. This helps identify subscription creep and unnecessary expenses.",
    },
    {
      question: "Can I adjust account balances manually?",
      answer:
        "Yes! In the Account Tracker, use the 'Adjustment' button to manually correct any account balance. This is useful for reconciling with bank statements or fixing entry errors.",
    },
    {
      question: "How do I handle credit card payments and debt repayments?",
      answer:
        "For debt reduction payments (reducing your credit card or loan balance), add the transaction in the Monthly View under 'Out', select the debt category, and choose the account you're paying from. However, if you use your credit card as an account for everyday spending, any payment above the debt repayment should be entered as a Transfer in the Account Tracker. Select 'Transfer' as the transaction type, choose the account you're paying from in the 'From' column, and the credit card in the 'To' column. Important: Recurring transactions for debt should only be used for payments that reduce your debt, not for credit cards used as spending accounts.",
    },
    {
      question:
        "What's the difference between a recurring transaction and a one-time transaction?",
      answer:
        "Recurring transactions repeat automatically based on their frequency (daily, weekly, monthly, etc.) and appear in each monthly budget. One-time transactions are added manually in the Monthly View for specific months. If you have a one-time future expense you want on your calendar, you can add it to Recurring Transactions with frequency set to 'Once'.",
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">
            Help & Instructions
          </h1>
        </div>
        <p className="text-muted-foreground">
          Learn how to use BudgetFlow to take control of your annual budget
        </p>
      </div>

      {/* Quick Start Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Quick Start Guide
          </CardTitle>
          <CardDescription>Get up and running in minutes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                1
              </div>
              <div>
                <h4 className="font-semibold">Complete Setup</h4>
                <p className="text-sm text-muted-foreground">
                  Visit the Setup page to configure your country, currency, and
                  budget categories
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                2
              </div>
              <div>
                <h4 className="font-semibold">Add Recurring Transactions</h4>
                <p className="text-sm text-muted-foreground">
                  Set up your regular income and expenses to automate tracking
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                3
              </div>
              <div>
                <h4 className="font-semibold">Track Monthly Transactions</h4>
                <p className="text-sm text-muted-foreground">
                  Add one-time income and expenses in the Monthly View as they
                  occur
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                4
              </div>
              <div>
                <h4 className="font-semibold">Monitor Your Progress</h4>
                <p className="text-sm text-muted-foreground">
                  Use the Dashboard to review your annual budget and track your
                  financial health
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Guides */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Feature Guides</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-primary" />
                    {feature.title}
                  </CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-2 text-sm">
                    {feature.steps.map((step, stepIdx) => (
                      <li key={stepIdx} className="flex gap-2">
                        <span className="text-muted-foreground">
                          {stepIdx + 1}.
                        </span>
                        <span className="text-muted-foreground">{step}</span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">
          Frequently Asked Questions
        </h2>
        <Card>
          <CardContent className="pt-6">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, idx) => (
                <AccordionItem key={idx} value={`item-${idx}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>

      {/* Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle>Best Practices</CardTitle>
          <CardDescription>
            Tips for effective budget management
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
            <p className="text-sm text-muted-foreground">
              <strong>Review weekly:</strong> Check your budget at least once a
              week to stay on track
            </p>
          </div>
          <div className="flex gap-2">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
            <p className="text-sm text-muted-foreground">
              <strong>Be realistic:</strong> Set achievable projections based on
              your actual spending history
            </p>
          </div>
          <div className="flex gap-2">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
            <p className="text-sm text-muted-foreground">
              <strong>Use categories:</strong> Properly categorize all
              transactions for accurate insights
            </p>
          </div>
          <div className="flex gap-2">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
            <p className="text-sm text-muted-foreground">
              <strong>Track everything:</strong> Even small expenses add up -
              record all transactions
            </p>
          </div>
          <div className="flex gap-2">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
            <p className="text-sm text-muted-foreground">
              <strong>Plan ahead:</strong> Use recurring transactions for known
              future expenses
            </p>
          </div>
          <div className="flex gap-2">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
            <p className="text-sm text-muted-foreground">
              <strong>Emergency fund:</strong> Aim for 3-6 months of expenses in
              savings
            </p>
          </div>
          <div className="flex gap-2">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
            <p className="text-sm text-muted-foreground">
              <strong>Adjust as needed:</strong> Life changes - update your
              budget to reflect your current situation
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Support Section */}
      <Card>
        <CardHeader>
          <CardTitle>Need More Help?</CardTitle>
          <CardDescription>We're here to support you</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong>
              <Link href="mailto:contact@collybrix.com">Contact Us</Link>
            </strong>
          </p>
          <p className="pt-2">
            BudgetFlow is a product of Collybrix Aceleradora S.L., committed to
            helping you achieve financial wellness.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
