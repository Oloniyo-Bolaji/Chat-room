// app/api/rooms/join/route.ts
import { db } from "@/lib/database";
import { roomMembersTable, roomsTable, usersTable } from "@/lib/database/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, roomId } = body;

    if (!userId || !roomId) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing userId or roomId" }),
        { status: 400 }
      );
    }

    // Check if room exists
    const room = await db
      .select()
      .from(roomsTable)
      .where(eq(roomsTable.id, roomId))
      .limit(1);

    if (!room.length) {
      return new Response(
        JSON.stringify({ success: false, error: "Room not found" }),
        { status: 404 }
      );
    }

    // Insert membership (ignore duplicates)
    await db
      .insert(roomMembersTable)
      .values({ userId, roomId })
      .onConflictDoNothing();

    // 🔌 Let socket server know this user joined
    global._ioServer?.to(roomId).emit("user_joined", { userId, roomId });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Join room error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal Server Error" }),
      { status: 500 }
    );
  }
}
