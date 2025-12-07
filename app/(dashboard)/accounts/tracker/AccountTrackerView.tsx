"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, ArrowLeftRight, TrendingUp, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAccounts } from "@/hooks/useAccounts";
import { useTransactions } from "@/hooks/useTransactions";
import { useAccountTransactions } from "@/hooks/useAccountTransactions";
import AccountMonthlyTable from "./AccountMonthlyTable";
import AccountTransactionsDetail from "./AccountTransactionsDetail";
import { TransferForm } from "@/components/accounts/TransferForm";
import { InterestForm } from "@/components/accounts/InterestForm";
import { AdjustmentForm } from "@/components/accounts/AdjustmentForm";

interface AccountTrackerViewProps {
  budgetId: string;
  currencySymbol: string;
  year: number;
}

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

export default function AccountTrackerView({
  budgetId,
  currencySymbol,
  year,
}: AccountTrackerViewProps) {
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [isTransferFormOpen, setIsTransferFormOpen] = useState(false);
  const [isInterestFormOpen, setIsInterestFormOpen] = useState(false);
  const [isAdjustmentFormOpen, setIsAdjustmentFormOpen] = useState(false);

  const { accounts, isLoading: accountsLoading } = useAccounts(budgetId);

  // Fetch ALL transactions and account transactions for the entire year
  // to properly calculate cumulative balances
  const { transactions: allYearTransactions, isLoading: transactionsLoading } = useTransactions(
    budgetId,
    null, // null = fetch all months
    year
  );
  const { accountTransactions: allYearAccountTransactions, isLoading: accountTransactionsLoading } = useAccountTransactions(
    budgetId,
    null, // null = fetch all accounts
    null, // null = fetch all months
    year
  );

  // Filter to current month for display in detail views
  const currentMonthTransactions = allYearTransactions.filter(
    (t) => t.month === selectedMonth
  );
  const currentMonthAccountTransactions = allYearAccountTransactions.filter(
    (at) => at.month === selectedMonth
  );

  const handlePreviousMonth = () => {
    setSelectedMonth((prev) => (prev === 1 ? 12 : prev - 1));
  };

  const handleNextMonth = () => {
    setSelectedMonth((prev) => (prev === 12 ? 1 : prev + 1));
  };

  const isLoading = accountsLoading || transactionsLoading || accountTransactionsLoading;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Account Tracker</h1>
          <p className="text-muted-foreground">
            Track monthly account activity and balances
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsTransferFormOpen(true)}>
            <ArrowLeftRight className="h-4 w-4 mr-2" />
            Transfer
          </Button>
          <Button variant="outline" onClick={() => setIsInterestFormOpen(true)}>
            <TrendingUp className="h-4 w-4 mr-2" />
            Interest
          </Button>
          <Button variant="outline" onClick={() => setIsAdjustmentFormOpen(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Adjustment
          </Button>
        </div>
      </div>

      {/* Month Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Month</CardTitle>
          <CardDescription>View account activity for a specific month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePreviousMonth}
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Select
              value={selectedMonth.toString()}
              onValueChange={(value) => setSelectedMonth(parseInt(value))}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((month) => (
                  <SelectItem key={month.value} value={month.value.toString()}>
                    {month.label} {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              onClick={handleNextMonth}
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Account Table */}
      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading account data...</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <AccountMonthlyTable
            accounts={accounts}
            transactions={allYearTransactions}
            accountTransactions={allYearAccountTransactions}
            currencySymbol={currencySymbol}
            month={selectedMonth}
            year={year}
          />

          {/* Detail views for each account */}
          {accounts.map((account) => (
            <AccountTransactionsDetail
              key={account._id.toString()}
              account={account}
              transactions={currentMonthTransactions}
              accountTransactions={currentMonthAccountTransactions}
              currencySymbol={currencySymbol}
            />
          ))}
        </>
      )}

      {/* Transaction Forms */}
      <TransferForm
        budgetId={budgetId}
        accounts={accounts}
        currencySymbol={currencySymbol}
        open={isTransferFormOpen}
        onOpenChange={setIsTransferFormOpen}
        defaultMonth={selectedMonth}
        defaultYear={year}
      />

      <InterestForm
        budgetId={budgetId}
        accounts={accounts}
        currencySymbol={currencySymbol}
        open={isInterestFormOpen}
        onOpenChange={setIsInterestFormOpen}
        defaultMonth={selectedMonth}
        defaultYear={year}
      />

      <AdjustmentForm
        budgetId={budgetId}
        accounts={accounts}
        currencySymbol={currencySymbol}
        open={isAdjustmentFormOpen}
        onOpenChange={setIsAdjustmentFormOpen}
        defaultMonth={selectedMonth}
        defaultYear={year}
      />
    </div>
  );
}
