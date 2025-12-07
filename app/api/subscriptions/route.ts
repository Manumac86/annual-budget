import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";
import { ObjectId } from "mongodb";
import type { Subscription, SubscriptionCreate } from "@/types";

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
        { error: "Budget ID is required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const subscriptionsCollection = db.collection<Subscription>("subscriptions");

    const subscriptions = await subscriptionsCollection
      .find({ budgetId: new ObjectId(budgetId) })
      .sort({ nextBillingDate: 1 })
      .toArray();

    // Convert to serializable format
    const serializedSubscriptions = subscriptions.map((sub: Subscription) => ({
      ...sub,
      _id: sub._id.toString(),
      budgetId: sub.budgetId.toString(),
    }));

    return NextResponse.json(serializedSubscriptions);
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscriptions" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: SubscriptionCreate = await request.json();
    const { budgetId, name, amount, billingCycle, nextBillingDate, category } =
      body;

    if (!budgetId || !name || !amount || !billingCycle || !nextBillingDate || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const subscriptionsCollection = db.collection<Subscription>("subscriptions");

    const newSubscription: Omit<Subscription, "_id"> = {
      budgetId: new ObjectId(budgetId),
      name,
      amount,
      billingCycle,
      nextBillingDate: new Date(nextBillingDate),
      category,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await subscriptionsCollection.insertOne(
      newSubscription as Subscription
    );

    const createdSubscription = await subscriptionsCollection.findOne({
      _id: result.insertedId,
    });

    if (!createdSubscription) {
      return NextResponse.json(
        { error: "Failed to create subscription" },
        { status: 500 }
      );
    }

    const serializedSubscription = {
      ...createdSubscription,
      _id: createdSubscription._id.toString(),
      budgetId: createdSubscription.budgetId.toString(),
    };

    return NextResponse.json(serializedSubscription, { status: 201 });
  } catch (error) {
    console.error("Error creating subscription:", error);
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    );
  }
}
