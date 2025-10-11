import { db } from "@/lib/database";
import { messageReadsTable } from "@/lib/database/schema";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const roomId = params.id;
    const { lastReadMessageId, lastReadAt } = await req.json();

    // ✅ Validate inputs
    if (!lastReadMessageId || !lastReadAt) {
      return NextResponse.json(
        { error: "Missing lastReadMessageId or lastReadAt" },
        { status: 400 }
      );
    }

    // ✅ Convert lastReadAt to Date
    const lastReadDate = new Date(lastReadAt);

    if (isNaN(lastReadDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid lastReadAt timestamp" },
        { status: 400 }
      );
    }

    // Check if record exists
    const existing = await db
      .select()
      .from(messageReadsTable)
      .where(
        and(
          eq(messageReadsTable.userId, userId),
          eq(messageReadsTable.roomId, roomId)
        )
      );

    if (existing.length > 0) {
      // Update existing record
      await db
        .update(messageReadsTable)
        .set({
          lastReadMessageId,
          lastReadAt: lastReadDate,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(messageReadsTable.userId, userId),
            eq(messageReadsTable.roomId, roomId)
          )
        );
    } else {
      // Insert new record
      await db.insert(messageReadsTable).values({
        userId,
        roomId,
        lastReadMessageId,
        lastReadAt: lastReadDate,
        updatedAt: new Date(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error updating message read status:", err);
    return NextResponse.json(
      { error: "Failed to update message read status" },
      { status: 500 }
    );
  }
}
