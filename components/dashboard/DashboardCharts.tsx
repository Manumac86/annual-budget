"use client";

import useSWR from "swr";
import { AnnualChart } from "./AnnualChart";
import { Loader2 } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface DashboardChartsProps {
  budgetId: string;
  year: number;
  currencySymbol: string;
}

export function DashboardCharts({
  budgetId,
  year,
  currencySymbol,
}: DashboardChartsProps) {
  const { data, isLoading, error } = useSWR(
    `/api/dashboard/annual-data?budgetId=${budgetId}&year=${year}`,
    fetcher
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 col-span-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="col-span-full text-center py-12 text-muted-foreground">
        Failed to load chart data
      </div>
    );
  }

  return <AnnualChart data={data.data} currencySymbol={currencySymbol} />;
}
