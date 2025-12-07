"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ContributionDialogProps {
  open: boolean;
  onClose: () => void;
  goal: {
    _id: string;
    name: string;
    currentAmount: number;
    targetAmount: number;
  };
  currencySymbol: string;
  onSubmit: (goalId: string, newAmount: number, contributionAmount: number, type: "deposit" | "withdrawal") => Promise<void>;
}

export default function ContributionDialog({
  open,
  onClose,
  goal,
  currencySymbol,
  onSubmit,
}: ContributionDialogProps) {
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tab, setTab] = useState<"add" | "subtract">("add");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    setIsSubmitting(true);
    try {
      const contributionAmount = parseFloat(amount);
      const newAmount =
        tab === "add"
          ? goal.currentAmount + contributionAmount
          : Math.max(0, goal.currentAmount - contributionAmount);

      const type = tab === "add" ? "deposit" : "withdrawal";
      await onSubmit(goal._id, newAmount, contributionAmount, type);
      setAmount("");
      onClose();
    } catch (error) {
      console.error("Failed to update contribution:", error);
      alert("Failed to update contribution. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setAmount("");
    setTab("add");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Contribution</DialogTitle>
          <DialogDescription>
            Update your savings progress for "{goal?.name}"
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Current Amount Display */}
            <div className="rounded-lg bg-muted p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Current Amount
                </span>
                <span className="text-lg font-semibold">
                  {currencySymbol}
                  {goal?.currentAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-muted-foreground">Target</span>
                <span className="text-sm">
                  {currencySymbol}
                  {goal?.targetAmount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Tabs for Add/Subtract */}
            <Tabs value={tab} onValueChange={(v) => setTab(v as "add" | "subtract")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="add">Add Funds</TabsTrigger>
                <TabsTrigger value="subtract">Withdraw Funds</TabsTrigger>
              </TabsList>

              <TabsContent value="add" className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="add-amount">Amount to Add *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground">
                      {currencySymbol}
                    </span>
                    <Input
                      id="add-amount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="0.00"
                      className="pl-8"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                  </div>
                  {amount && parseFloat(amount) > 0 && (
                    <p className="text-sm text-muted-foreground">
                      New balance will be: {currencySymbol}
                      {(goal.currentAmount + parseFloat(amount)).toFixed(2)}
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="subtract" className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="subtract-amount">Amount to Withdraw *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground">
                      {currencySymbol}
                    </span>
                    <Input
                      id="subtract-amount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={goal?.currentAmount}
                      placeholder="0.00"
                      className="pl-8"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                  </div>
                  {amount && parseFloat(amount) > 0 && (
                    <p className="text-sm text-muted-foreground">
                      New balance will be: {currencySymbol}
                      {Math.max(
                        0,
                        goal.currentAmount - parseFloat(amount)
                      ).toFixed(2)}
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Balance"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
