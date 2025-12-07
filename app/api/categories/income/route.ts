import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ObjectId } from "mongodb";
import { getCollection } from "@/lib/db";
import { incomeCategorySchema } from "@/lib/validations";
import type { IncomeCategory } from "@/types";

// GET /api/categories/income?budgetId=xxx
export async function GET(request: Request) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const budgetId = searchParams.get("budgetId");

    if (!budgetId) {
      return NextResponse.json(
        { error: "budgetId is required" },
        { status: 400 }
      );
    }

    const categoriesCollection =
      await getCollection<IncomeCategory>("income_categories");
    const categories = await categoriesCollection
      .find({ budgetId: new ObjectId(budgetId) })
      .sort({ order: 1 })
      .toArray();

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Error fetching income categories:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/categories/income - Create income category
export async function POST(request: Request) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate input
    const validatedData = incomeCategorySchema.parse(body);

    const categoriesCollection =
      await getCollection<IncomeCategory>("income_categories");

    // Get the highest order number
    const maxOrderCategory = await categoriesCollection
      .find({ budgetId: new ObjectId(validatedData.budgetId) })
      .sort({ order: -1 })
      .limit(1)
      .toArray();

    const nextOrder = maxOrderCategory.length > 0
      ? maxOrderCategory[0].order + 1
      : 0;

    const newCategory: Omit<IncomeCategory, "_id"> = {
      budgetId: new ObjectId(validatedData.budgetId),
      name: validatedData.name,
      projectedAmount: validatedData.projectedAmount,
      order: validatedData.order ?? nextOrder,
      createdAt: new Date(),
    };

    const result = await categoriesCollection.insertOne(
      newCategory as IncomeCategory
    );
    const createdCategory = await categoriesCollection.findOne({
      _id: result.insertedId,
    });

    return NextResponse.json({ category: createdCategory }, { status: 201 });
  } catch (error) {
    console.error("Error creating income category:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
