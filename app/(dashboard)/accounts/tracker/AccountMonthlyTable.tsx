"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Account, Transaction, AccountTransaction } from "@/types";

interface AccountMonthlyTableProps {
  accounts: Account[];
  transactions: Transaction[];
  accountTransactions: AccountTransaction[];
  currencySymbol: string;
  month: number;
  year: number;
}

interface MonthlyAccountSummary {
  account: Account;
  startBalance: number;
  incoming: number;
  outgoing: number;
  netTransfers: number;
  interest: number;
  adjustments: number;
  endBalance: number;
}

export default function AccountMonthlyTable({
  accounts,
  transactions,
  accountTransactions,
  currencySymbol,
  month,
  year,
}: AccountMonthlyTableProps) {
  // Helper function to calculate activity for a given month/year
  const calculateMonthActivity = (
    accountIdStr: string,
    targetMonth: number,
    targetYear: number,
    allTransactions: Transaction[],
    allAccountTransactions: AccountTransaction[]
  ) => {
    // Filter transactions for this account and month
    const monthTransactions = allTransactions.filter(
      (t) =>
        t.accountId?.toString() === accountIdStr &&
        t.month === targetMonth &&
        t.year === targetYear
    );

    const monthAccountTxns = allAccountTransactions.filter(
      (at) =>
        at.accountId.toString() === accountIdStr &&
        at.month === targetMonth &&
        at.year === targetYear
    );

    const income = monthTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = monthTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const transfersOut = monthAccountTxns
      .filter((at) => at.type === "transfer" && at.transferDirection === "out")
      .reduce((sum, at) => sum + at.amount, 0);

    const transfersIn = monthAccountTxns
      .filter((at) => at.type === "transfer" && at.transferDirection === "in")
      .reduce((sum, at) => sum + at.amount, 0);

    const interest = monthAccountTxns
      .filter((at) => at.type === "interest")
      .reduce((sum, at) => sum + at.amount, 0);

    const adjustments = monthAccountTxns
      .filter((at) => at.type === "adjustment")
      .reduce((sum, at) => sum + at.amount, 0);

    return {
      income,
      expenses,
      netTransfers: transfersIn - transfersOut,
      interest,
      adjustments,
    };
  };

  // Calculate monthly summaries for each account
  const monthlySummaries: MonthlyAccountSummary[] = accounts.map((account) => {
    const accountIdStr = account._id.toString();

    // Current month activity
    const currentActivity = calculateMonthActivity(
      accountIdStr,
      month,
      year,
      transactions,
      accountTransactions
    );

    // Calculate start balance by summing all previous months' activity
    // Start with the account's initial balance
    let startBalance = account.balance;

    // Add all activity from January of current year up to (but not including) current month
    for (let m = 1; m < month; m++) {
      const prevActivity = calculateMonthActivity(
        accountIdStr,
        m,
        year,
        transactions,
        accountTransactions
      );
      startBalance +=
        prevActivity.income -
        prevActivity.expenses +
        prevActivity.netTransfers +
        prevActivity.interest +
        prevActivity.adjustments;
    }

    // Calculate end balance
    const endBalance =
      startBalance +
      currentActivity.income -
      currentActivity.expenses +
      currentActivity.netTransfers +
      currentActivity.interest +
      currentActivity.adjustments;

    return {
      account,
      startBalance,
      incoming: currentActivity.income,
      outgoing: currentActivity.expenses,
      netTransfers: currentActivity.netTransfers,
      interest: currentActivity.interest,
      adjustments: currentActivity.adjustments,
      endBalance,
    };
  });

  // Calculate totals row
  const totals = monthlySummaries.reduce(
    (acc, summary) => ({
      startBalance: acc.startBalance + summary.startBalance,
      incoming: acc.incoming + summary.incoming,
      outgoing: acc.outgoing + summary.outgoing,
      netTransfers: acc.netTransfers + summary.netTransfers,
      interest: acc.interest + summary.interest,
      adjustments: acc.adjustments + summary.adjustments,
      endBalance: acc.endBalance + summary.endBalance,
    }),
    {
      startBalance: 0,
      incoming: 0,
      outgoing: 0,
      netTransfers: 0,
      interest: 0,
      adjustments: 0,
      endBalance: 0,
    }
  );

  const formatCurrency = (amount: number) => {
    const isNegative = amount < 0;
    const absAmount = Math.abs(amount);
    return `${isNegative ? "-" : ""}${currencySymbol}${absAmount.toFixed(2)}`;
  };

  const getCellColor = (amount: number) => {
    if (amount > 0) return "text-green-600";
    if (amount < 0) return "text-red-600";
    return "";
  };

  if (accounts.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">
            No accounts found. Create an account to start tracking.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Account Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold">Account</TableHead>
                <TableHead className="font-bold">Type</TableHead>
                <TableHead className="text-right font-bold">Start Balance</TableHead>
                <TableHead className="text-right font-bold">IN</TableHead>
                <TableHead className="text-right font-bold">OUT</TableHead>
                <TableHead className="text-right font-bold">Transfers</TableHead>
                <TableHead className="text-right font-bold">Interest</TableHead>
                <TableHead className="text-right font-bold">Adjustment</TableHead>
                <TableHead className="text-right font-bold">Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthlySummaries.map((summary) => (
                <TableRow key={summary.account._id.toString()}>
                  <TableCell className="font-medium">{summary.account.name}</TableCell>
                  <TableCell className="capitalize">{summary.account.type}</TableCell>
                  <TableCell className={`text-right ${getCellColor(summary.startBalance)}`}>
                    {formatCurrency(summary.startBalance)}
                  </TableCell>
                  <TableCell className={`text-right ${getCellColor(summary.incoming)}`}>
                    {formatCurrency(summary.incoming)}
                  </TableCell>
                  <TableCell className={`text-right ${getCellColor(summary.outgoing)}`}>
                    {formatCurrency(summary.outgoing)}
                  </TableCell>
                  <TableCell className={`text-right ${getCellColor(summary.netTransfers)}`}>
                    {formatCurrency(summary.netTransfers)}
                  </TableCell>
                  <TableCell className={`text-right ${getCellColor(summary.interest)}`}>
                    {formatCurrency(summary.interest)}
                  </TableCell>
                  <TableCell className={`text-right ${getCellColor(summary.adjustments)}`}>
                    {formatCurrency(summary.adjustments)}
                  </TableCell>
                  <TableCell className={`text-right font-semibold ${getCellColor(summary.endBalance)}`}>
                    {formatCurrency(summary.endBalance)}
                  </TableCell>
                </TableRow>
              ))}
              {/* Totals Row */}
              <TableRow className="border-t-2 border-primary/20 bg-muted/50 font-bold">
                <TableCell colSpan={2} className="font-bold">TOTAL</TableCell>
                <TableCell className={`text-right ${getCellColor(totals.startBalance)}`}>
                  {formatCurrency(totals.startBalance)}
                </TableCell>
                <TableCell className={`text-right ${getCellColor(totals.incoming)}`}>
                  {formatCurrency(totals.incoming)}
                </TableCell>
                <TableCell className={`text-right ${getCellColor(totals.outgoing)}`}>
                  {formatCurrency(totals.outgoing)}
                </TableCell>
                <TableCell className={`text-right ${getCellColor(totals.netTransfers)}`}>
                  {formatCurrency(totals.netTransfers)}
                </TableCell>
                <TableCell className={`text-right ${getCellColor(totals.interest)}`}>
                  {formatCurrency(totals.interest)}
                </TableCell>
                <TableCell className={`text-right ${getCellColor(totals.adjustments)}`}>
                  {formatCurrency(totals.adjustments)}
                </TableCell>
                <TableCell className={`text-right ${getCellColor(totals.endBalance)}`}>
                  {formatCurrency(totals.endBalance)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
