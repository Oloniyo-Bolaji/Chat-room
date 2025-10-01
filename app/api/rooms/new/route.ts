import { db } from "@/lib/database";
import { roomsTable, roomMembersTable } from "@/lib/database/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth";

import type { NextApiResponse } from "next";

export async function POST(req: Request, res: NextApiResponse) {
  const session = await getServerSession(authConfig);

  if (!session || !session.user?.id) {
    return NextResponse.json(
      { success: false, error: "Unauthorized, Please sign up" },
      { status: 401 }
    );
  }
  const body = await req.json();
  const userId = session.user.id;

  try {
    if (body.name) {
      const existing = await db.query.roomsTable.findFirst({
        where: eq(roomsTable.roomName, body.name),
      });

      if (existing) {
        return NextResponse.json(
          { success: false, error: "Room name already exists" },
          { status: 400 }
        );
      }
    }

    const [newRoom] = await db
      .insert(roomsTable)
      .values({
        roomName: body.name,
        description: body.description,
        avatar: body.avatar,
        messages: [],
        creatorId: userId,
      })
      .returning();
    // Add creator as first member of the room
    await db.insert(roomMembersTable).values({
      userId,
      roomId: newRoom.id,
    });
    global._ioServer?.emit("room_created", newRoom);

    //send mails to all users, check readme file
    return NextResponse.json({ success: true, room: newRoom });
  } catch (err) {
    console.error("Database Error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
