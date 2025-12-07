import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getCollection } from "@/lib/db";
import { userSettingsSchema } from "@/lib/validations";
import type { User } from "@/types";

// GET /api/users - Get current user
export async function GET() {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const usersCollection = await getCollection<User>("users");
    const user = await usersCollection.findOne({ clerkId });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/users - Create or update user
export async function POST(request: Request) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { email, name, settings } = body;

    const usersCollection = await getCollection<User>("users");

    // Check if user exists
    const existingUser = await usersCollection.findOne({ clerkId });

    if (existingUser) {
      // Update existing user
      const updateData: Partial<User> = {
        updatedAt: new Date(),
      };

      if (email) updateData.email = email;
      if (name) updateData.name = name;
      if (settings) {
        // Validate settings
        const validatedSettings = userSettingsSchema.parse(settings);
        updateData.settings = validatedSettings;
      }

      await usersCollection.updateOne({ clerkId }, { $set: updateData });

      const updatedUser = await usersCollection.findOne({ clerkId });

      return NextResponse.json({ user: updatedUser });
    } else {
      // Create new user
      const newUser: Omit<User, "_id"> = {
        clerkId,
        email: email || "",
        name: name || "",
        createdAt: new Date(),
        updatedAt: new Date(),
        settings: settings
          ? userSettingsSchema.parse(settings)
          : {
              country: "United States",
              currency: "USD",
              currencySymbol: "$",
              startingMonth: 1,
              year: new Date().getFullYear(),
              rolloverEnabled: true,
            },
      };

      const result = await usersCollection.insertOne(newUser as User);
      const createdUser = await usersCollection.findOne({ _id: result.insertedId });

      return NextResponse.json({ user: createdUser }, { status: 201 });
    }
  } catch (error) {
    console.error("Error creating/updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/users - Update user settings
export async function PATCH(request: Request) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { settings } = body;

    if (!settings) {
      return NextResponse.json(
        { error: "Settings are required" },
        { status: 400 }
      );
    }

    // Validate settings
    const validatedSettings = userSettingsSchema.parse(settings);

    const usersCollection = await getCollection<User>("users");

    await usersCollection.updateOne(
      { clerkId },
      {
        $set: {
          settings: validatedSettings,
          updatedAt: new Date(),
        },
      }
    );

    const updatedUser = await usersCollection.findOne({ clerkId });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Error updating user settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
