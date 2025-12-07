"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useSavingsGoalMutations } from "@/hooks/useSavingsGoalMutations";

interface SavingsGoalFormProps {
  open: boolean;
  onClose: () => void;
  budgetId: string;
  currencySymbol: string;
  savingsGoal?: any;
}

export default function SavingsGoalForm({
  open,
  onClose,
  budgetId,
  currencySymbol,
  savingsGoal,
}: SavingsGoalFormProps) {
  const { createGoal, updateGoal } = useSavingsGoalMutations();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    targetAmount: "",
    currentAmount: "",
    deadline: undefined as Date | undefined,
    priority: "medium" as "low" | "medium" | "high",
  });

  useEffect(() => {
    if (savingsGoal) {
      setFormData({
        name: savingsGoal.name,
        targetAmount: savingsGoal.targetAmount.toString(),
        currentAmount: savingsGoal.currentAmount.toString(),
        deadline: savingsGoal.deadline
          ? new Date(savingsGoal.deadline)
          : undefined,
        priority: savingsGoal.priority,
      });
    } else {
      setFormData({
        name: "",
        targetAmount: "",
        currentAmount: "",
        deadline: undefined,
        priority: "medium",
      });
    }
  }, [savingsGoal, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = {
        name: formData.name,
        targetAmount: parseFloat(formData.targetAmount),
        currentAmount: parseFloat(formData.currentAmount) || 0,
        deadline: formData.deadline,
        priority: formData.priority,
      };

      if (savingsGoal) {
        await updateGoal(savingsGoal._id, data);
      } else {
        await createGoal({
          ...data,
          budgetId,
        });
      }

      onClose();
    } catch (error) {
      console.error("Failed to save goal:", error);
      alert("Failed to save savings goal. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {savingsGoal ? "Edit Savings Goal" : "Create Savings Goal"}
          </DialogTitle>
          <DialogDescription>
            {savingsGoal
              ? "Update your savings goal details."
              : "Set up a new savings goal and track your progress."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">Goal Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Emergency Fund, Vacation, New Car"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            {/* Target Amount */}
            <div className="grid gap-2">
              <Label htmlFor="targetAmount">Target Amount *</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-muted-foreground">
                  {currencySymbol}
                </span>
                <Input
                  id="targetAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="pl-8"
                  value={formData.targetAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, targetAmount: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            {/* Current Amount */}
            <div className="grid gap-2">
              <Label htmlFor="currentAmount">Current Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-muted-foreground">
                  {currencySymbol}
                </span>
                <Input
                  id="currentAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="pl-8"
                  value={formData.currentAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, currentAmount: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Priority */}
            <div className="grid gap-2">
              <Label htmlFor="priority">Priority *</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: "low" | "medium" | "high") =>
                  setFormData({ ...formData, priority: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Deadline */}
            <div className="grid gap-2">
              <Label>Deadline (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !formData.deadline && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.deadline ? (
                      format(formData.deadline, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-full min-w-[300px] p-0"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={formData.deadline}
                    defaultMonth={new Date()}
                    onSelect={(date) =>
                      setFormData({ ...formData, deadline: date })
                    }
                    className="rounded-lg border shadow-sm w-full"
                  />
                </PopoverContent>
              </Popover>
              {formData.deadline && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setFormData({ ...formData, deadline: undefined })
                  }
                >
                  Clear deadline
                </Button>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : savingsGoal
                ? "Update Goal"
                : "Create Goal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
