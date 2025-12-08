"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { setupFormSchema, type SetupFormInput } from "@/lib/validations";
import { getAllCountries, getCurrencyByCountry } from "@/utils/currency";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

const EXPENSE_CATEGORIES = [
  { value: "needs", label: "Needs (50%)" },
  { value: "wants", label: "Wants (30%)" },
  { value: "savings", label: "Savings (20%)" },
] as const;

export default function SetupPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<SetupFormInput>({
    resolver: zodResolver(setupFormSchema),
    defaultValues: {
      country: "United States",
      currency: "USD",
      currencySymbol: "$",
      startingMonth: 1,
      year: new Date().getFullYear(),
      rolloverEnabled: true,
      budgetName: `${new Date().getFullYear()} Budget`,
      incomeCategories: [{ name: "", projectedAmount: 0 }],
      expenseCategories: [{ name: "", projectedAmount: 0, category: "needs" }],
    },
  });

  const {
    fields: incomeFields,
    append: appendIncome,
    remove: removeIncome,
  } = useFieldArray({
    control: form.control,
    name: "incomeCategories",
  });

  const {
    fields: expenseFields,
    append: appendExpense,
    remove: removeExpense,
  } = useFieldArray({
    control: form.control,
    name: "expenseCategories",
  });

  const handleCountryChange = (country: string) => {
    const { currency, symbol } = getCurrencyByCountry(country);
    form.setValue("country", country);
    form.setValue("currency", currency);
    form.setValue("currencySymbol", symbol);
  };

  const onSubmit = async (data: SetupFormInput) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Create/update user with settings
      const userResponse = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: {
            country: data.country,
            currency: data.currency,
            currencySymbol: data.currencySymbol,
            startingMonth: data.startingMonth,
            year: data.year,
            rolloverEnabled: data.rolloverEnabled,
          },
        }),
      });

      if (!userResponse.ok) {
        throw new Error("Failed to save user settings");
      }

      // 2. Create budget
      const budgetResponse = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year: data.year,
          name: data.budgetName,
        }),
      });

      if (!budgetResponse.ok) {
        throw new Error("Failed to create budget");
      }

      const { budget } = await budgetResponse.json();

      // 3. Create income categories
      for (let i = 0; i < data.incomeCategories.length; i++) {
        const category = data.incomeCategories[i];
        await fetch("/api/categories/income", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            budgetId: budget._id,
            name: category.name,
            projectedAmount: category.projectedAmount,
            order: i,
          }),
        });
      }

      // 4. Create expense categories
      for (let i = 0; i < data.expenseCategories.length; i++) {
        const category = data.expenseCategories[i];
        await fetch("/api/categories/expense", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            budgetId: budget._id,
            name: category.name,
            projectedAmount: category.projectedAmount,
            category: category.category,
            order: i,
          }),
        });
      }

      // 5. Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      console.error("Setup error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8">
      <div>
        <h1 className="text-3xl font-bold">Setup Your Budget</h1>
        <p className="text-muted-foreground">
          Let's get started by configuring your budget settings and categories
        </p>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure your basic budget settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <Select
                      onValueChange={handleCountryChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {getAllCountries().map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      This will update the currency symbol throughout the app
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <FormControl>
                        <Input {...field} disabled />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currencySymbol"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Symbol</FormLabel>
                      <FormControl>
                        <Input {...field} disabled />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fiscal Year</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startingMonth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Starting Month</FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(parseInt(value))
                        }
                        defaultValue={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select month" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {MONTHS.map((month) => (
                            <SelectItem
                              key={month.value}
                              value={month.value.toString()}
                            >
                              {month.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="budgetName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget Name</FormLabel>
                    <FormControl>
                      <Input placeholder="2025 Budget" {...field} />
                    </FormControl>
                    <FormDescription>
                      A friendly name for your budget
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rolloverEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Enable Rollover
                      </FormLabel>
                      <FormDescription>
                        Carry over your balance from one month to the next. If enabled, any surplus or deficit from the previous month will be added to the current month's starting balance.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Income Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Income Categories</CardTitle>
              <CardDescription>
                Add your expected income sources and projected amounts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {incomeFields.map((field, index) => (
                <div key={field.id} className="flex gap-4 items-start">
                  <FormField
                    control={form.control}
                    name={`incomeCategories.${index}.name`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input placeholder="e.g., Salary" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`incomeCategories.${index}.projectedAmount`}
                    render={({ field }) => (
                      <FormItem className="w-40">
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeIncome(index)}
                    disabled={incomeFields.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendIncome({ name: "", projectedAmount: 0 })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Income Category
              </Button>
            </CardContent>
          </Card>

          {/* Expense Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Expense Categories</CardTitle>
              <CardDescription>
                Add your expense categories, set projected amounts, and classify them using the 50/30/20 rule (Needs, Wants, or Savings). This classification is optional and helps with the 50/30/20 Budget Dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {expenseFields.map((field, index) => (
                <div key={field.id} className="flex gap-4 items-start">
                  <FormField
                    control={form.control}
                    name={`expenseCategories.${index}.name`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input placeholder="e.g., Rent" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`expenseCategories.${index}.projectedAmount`}
                    render={({ field }) => (
                      <FormItem className="w-32">
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`expenseCategories.${index}.category`}
                    render={({ field }) => (
                      <FormItem className="w-48">
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {EXPENSE_CATEGORIES.map((cat) => (
                              <SelectItem key={cat.value} value={cat.value}>
                                {cat.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeExpense(index)}
                    disabled={expenseFields.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  appendExpense({
                    name: "",
                    projectedAmount: 0,
                    category: "needs",
                  })
                }
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Expense Category
              </Button>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? "Setting up..." : "Complete Setup"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
