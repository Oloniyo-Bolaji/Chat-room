import { db } from "@/lib/database";
import { roomsTable } from "@/lib/database/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const roomId = params.id;

    if (!roomId) {
      return new Response(
        JSON.stringify({ success: false, error: "Room ID is required" }),
        { status: 400 }
      );
    }

    // Fetch room with messages
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

    const messages = Array.isArray(room[0].messages)
      ? room[0].messages
      : [];

    return new Response(
      JSON.stringify({ success: true, messages }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching messages:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal Server Error" }),
      { status: 500 }
    );
  }
}
