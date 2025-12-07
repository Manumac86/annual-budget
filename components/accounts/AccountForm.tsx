"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAccountMutations } from "@/hooks/useAccountMutations";
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
import type { Account } from "@/types";

const accountSchema = z.object({
  name: z.string().min(1, "Account name is required"),
  type: z.enum(["checking", "savings", "credit", "investment", "other"]),
  balance: z.number(),
  currency: z.string().min(1, "Currency is required"),
});

type AccountFormData = z.infer<typeof accountSchema>;

interface AccountFormProps {
  budgetId: string;
  currencySymbol: string;
  account?: Account;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ACCOUNT_TYPES = [
  { value: "checking", label: "Checking Account" },
  { value: "savings", label: "Savings Account" },
  { value: "credit", label: "Credit Card / Debt" },
  { value: "investment", label: "Investment Account" },
  { value: "other", label: "Other" },
];

export function AccountForm({
  budgetId,
  currencySymbol,
  account,
  open,
  onOpenChange,
}: AccountFormProps) {
  const { createAccount, updateAccount } = useAccountMutations();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: account
      ? {
          name: account.name,
          type: account.type,
          balance: account.balance,
          currency: account.currency,
        }
      : {
          name: "",
          type: "checking",
          balance: 0,
          currency: currencySymbol,
        },
  });

  // Reset form when account changes or dialog opens
  useEffect(() => {
    if (open) {
      if (account) {
        form.reset({
          name: account.name,
          type: account.type,
          balance: account.balance,
          currency: account.currency,
        });
      } else {
        form.reset({
          name: "",
          type: "checking",
          balance: 0,
          currency: currencySymbol,
        });
      }
    }
  }, [account, open, form, currencySymbol]);

  const onSubmit = async (data: AccountFormData) => {
    try {
      setIsSubmitting(true);

      if (account) {
        await updateAccount(account._id.toString(), {
          name: data.name,
          type: data.type,
          balance: data.balance,
          currency: data.currency,
        });
      } else {
        await createAccount({
          budgetId,
          name: data.name,
          type: data.type,
          balance: data.balance,
          currency: data.currency,
        });
      }

      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving account:", error);
      alert(
        error instanceof Error ? error.message : "Failed to save account"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {account ? "Edit Account" : "Create Account"}
          </DialogTitle>
          <DialogDescription>
            {account
              ? "Update your account details."
              : "Add a new account to track your finances."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., BBVA Checking" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ACCOUNT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
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
              name="balance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Starting Balance</FormLabel>
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
                    Use negative values for debt accounts (credit cards, loans)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <FormControl>
                    <Input placeholder="€" {...field} disabled />
                  </FormControl>
                  <FormDescription>
                    Currency is inherited from your budget settings
                  </FormDescription>
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
                {isSubmitting ? "Saving..." : account ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
