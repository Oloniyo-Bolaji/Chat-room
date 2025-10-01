import { db } from "@/lib/database";
import { roomsTable } from "@/lib/database/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { roomId, text, sender, timestamp } = body;

    if (!roomId || !text || !sender) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing fields" }),
        { status: 400 }
      );
    }

    const newMessage = { text, sender, timestamp };

    // Fetch the room
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

    // Ensure messages is always an array
    const existingMessages = Array.isArray(room[0].messages)
      ? room[0].messages
      : [];

    // Update DB with new messages
    await db
      .update(roomsTable)
      .set({ messages: [...existingMessages, newMessage] })
      .where(eq(roomsTable.id, roomId));

    // Emit via socket.io
    global._ioServer?.to(roomId).emit("receive_message", newMessage);

    return new Response(
      JSON.stringify({ success: true, message: newMessage }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saving message:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal Server Error" }),
      { status: 500 }
    );
  }
}

