import { db } from "@/lib/database";
import { messagesTable } from "@/lib/database/schema";
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

    // Get all messages in the room with sender details
    const messages = await db.query.messagesTable.findMany({
      where: eq(messagesTable.roomId, roomId),
      with: {
        sender: true,
        room: true, 
      },
      orderBy: (msg, { asc }) => [asc(msg.createdAt)],
    });

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
