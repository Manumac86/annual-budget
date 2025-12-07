import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";
import { ObjectId } from "mongodb";
import type { Subscription, SubscriptionUpdate } from "@/types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid subscription ID" }, { status: 400 });
    }

    const db = await getDb();
    const subscriptionsCollection = db.collection<Subscription>("subscriptions");

    const subscription = await subscriptionsCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!subscription) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }

    const serializedSubscription = {
      ...subscription,
      _id: subscription._id.toString(),
      budgetId: subscription.budgetId.toString(),
    };

    return NextResponse.json(serializedSubscription);
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid subscription ID" }, { status: 400 });
    }

    const body: SubscriptionUpdate = await request.json();

    const db = await getDb();
    const subscriptionsCollection = db.collection<Subscription>("subscriptions");

    const updateData: any = {
      ...body,
      updatedAt: new Date(),
    };

    if (body.nextBillingDate) {
      updateData.nextBillingDate = new Date(body.nextBillingDate);
    }

    const result = await subscriptionsCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }

    const serializedSubscription = {
      ...result,
      _id: result._id.toString(),
      budgetId: result.budgetId.toString(),
    };

    return NextResponse.json(serializedSubscription);
  } catch (error) {
    console.error("Error updating subscription:", error);
    return NextResponse.json(
      { error: "Failed to update subscription" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid subscription ID" }, { status: 400 });
    }

    const db = await getDb();
    const subscriptionsCollection = db.collection<Subscription>("subscriptions");

    const result = await subscriptionsCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting subscription:", error);
    return NextResponse.json(
      { error: "Failed to delete subscription" },
      { status: 500 }
    );
  }
}
