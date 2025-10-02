import { db } from "@/lib/database";
import { messagesTable } from "@/lib/database/schema";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { roomId, senderId, text } = body;

    if (!roomId || !senderId || !text) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing fields" }),
        { status: 400 }
      );
    }

    // Insert new message
    const [newMessage] = await db
      .insert(messagesTable)
      .values({
        roomId,
        senderId,
        text,
      })
      .returning();

    // Emit via socket.io
    global._ioServer?.to(roomId).emit("receive_message", newMessage);

    return new Response(
      JSON.stringify({ success: true, message: newMessage }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending message:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal Server Error" }),
      { status: 500 }
    );
  }
}
