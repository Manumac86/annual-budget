"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mutate } from "swr";

interface GenerateRecurringButtonProps {
  budgetId: string;
  month: number;
  year: number;
}

export function GenerateRecurringButton({
  budgetId,
  month,
  year,
}: GenerateRecurringButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);

    try {
      const response = await fetch(
        `/api/recurring-transactions/generate?budgetId=${budgetId}&year=${year}&month=${month}`,
        { method: "POST" }
      );

      if (!response.ok) {
        throw new Error("Failed to generate transactions");
      }

      const result = await response.json();

      // Invalidate transactions cache to refresh the list
      mutate(
        (key) =>
          typeof key === "string" && key.startsWith("/api/transactions")
      );

      // Show success message
      if (result.generated > 0) {
        alert(`Generated ${result.generated} recurring transactions!`);
      } else {
        alert("No new recurring transactions to generate.");
      }
    } catch (error) {
      console.error("Error generating transactions:", error);
      alert("Failed to generate recurring transactions");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={handleGenerate}
      disabled={isGenerating}
      variant="outline"
      size="sm"
    >
      <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? "animate-spin" : ""}`} />
      {isGenerating ? "Generating..." : "Generate Recurring"}
    </Button>
  );
}
