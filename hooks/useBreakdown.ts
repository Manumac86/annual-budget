import useSWR from "swr";

interface CategoryBreakdown {
  _id: string;
  name: string;
  projected: number;
  actual: number;
  difference: number;
  percentageOfProjected: number;
}

interface ExpenseCategoryBreakdown extends CategoryBreakdown {
  category: "needs" | "wants" | "savings";
}

interface BreakdownData {
  incomeBreakdown: CategoryBreakdown[];
  expenseBreakdown: ExpenseCategoryBreakdown[];
  totals: {
    income: {
      projected: number;
      actual: number;
    };
    expense: {
      projected: number;
      actual: number;
    };
    balance: {
      projected: number;
      actual: number;
    };
  };
  ruleBreakdown: {
    needs: {
      projected: number;
      actual: number;
    };
    wants: {
      projected: number;
      actual: number;
    };
    savings: {
      projected: number;
      actual: number;
    };
  };
}

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  });

export function useBreakdown(
  budgetId: string | null,
  month: number,
  year: number
) {
  const url =
    budgetId
      ? `/api/breakdown?budgetId=${budgetId}&month=${month}&year=${year}`
      : null;

  const { data, error, isLoading, mutate } = useSWR<BreakdownData>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
  );

  return {
    breakdown: data,
    isLoading,
    isError: error,
    mutate,
  };
}
