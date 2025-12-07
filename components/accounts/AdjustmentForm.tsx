"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAccountTransactionMutations } from "@/hooks/useAccountTransactionMutations";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Account } from "@/types";

const adjustmentSchema = z.object({
  accountId: z.string().min(1, "Account is required"),
  amount: z.number(),
  date: z.date(),
  description: z.string().optional(),
});

type AdjustmentFormData = z.infer<typeof adjustmentSchema>;

interface AdjustmentFormProps {
  budgetId: string;
  accounts: Account[];
  currencySymbol: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMonth?: number;
  defaultYear?: number;
}

export function AdjustmentForm({
  budgetId,
  accounts,
  currencySymbol,
  open,
  onOpenChange,
  defaultMonth,
  defaultYear,
}: AdjustmentFormProps) {
  const { createAdjustment } = useAccountTransactionMutations();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get active accounts only
  const activeAccounts = accounts.filter((acc) => acc.isActive);

  const form = useForm<AdjustmentFormData>({
    resolver: zodResolver(adjustmentSchema),
    defaultValues: {
      accountId: "",
      amount: 0,
      date:
        defaultMonth && defaultYear
          ? new Date(defaultYear, defaultMonth - 1, 1)
          : new Date(),
      description: "",
    },
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        accountId: "",
        amount: 0,
        date:
          defaultMonth && defaultYear
            ? new Date(defaultYear, defaultMonth - 1, 1)
            : new Date(),
        description: "",
      });
    }
  }, [open, form, defaultMonth, defaultYear]);

  const onSubmit = async (data: AdjustmentFormData) => {
    try {
      setIsSubmitting(true);

      const account = accounts.find(
        (acc) => acc._id.toString() === data.accountId
      );

      if (!account) {
        alert("Invalid account selection");
        return;
      }

      await createAdjustment(
        data.accountId,
        account.name,
        data.amount,
        data.date,
        budgetId,
        data.description
      );

      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating adjustment:", error);
      alert(
        error instanceof Error ? error.message : "Failed to create adjustment"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Adjustment</DialogTitle>
          <DialogDescription>
            Record a balance adjustment or correction for an account
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="accountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {activeAccounts.map((account) => (
                        <SelectItem
                          key={account._id.toString()}
                          value={account._id.toString()}
                        >
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Positive to increase balance, negative to decrease balance
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        className="rounded-lg border shadow-sm w-full"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Balance correction, bank fee"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Adjustment"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
