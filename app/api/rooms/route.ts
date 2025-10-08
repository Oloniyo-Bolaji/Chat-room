// pages/api/rooms/index.ts
import { db } from "@/lib/database";
import { roomsTable, roomMembersTable, messagesTable } from "@/lib/database/schema";
import { eq, desc } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authConfig);

  if (!session || !session.user?.id) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const userId = session.user.id;

  try {
    const allRooms = await db.select().from(roomsTable);

    // Get joined rooms with their memberships
    const joinedMemberships = await db.query.roomMembersTable.findMany({
      where: eq(roomMembersTable.userId, userId),
      with: { 
        room: true 
      },
    });

    const joinedRooms = joinedMemberships.map((m) => m.room);
    const joinedRoomIds = joinedRooms.map((r) => r.id);

    // Get the last message for each joined room
    const roomsWithLastMessage = await Promise.all(
      joinedRooms.map(async (room) => {
        const lastMessage = await db.query.messagesTable.findFirst({
          where: eq(messagesTable.roomId, room.id),
          orderBy: desc(messagesTable.createdAt),
        });

        return {
          ...room,
          lastMessage: lastMessage || null,
        };
      })
    );

    const availableRooms = allRooms.filter(
      (room) => !joinedRoomIds.includes(room.id)
    );

    return NextResponse.json({ 
      success: true, 
      joinedRooms: roomsWithLastMessage, 
      availableRooms 
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch rooms" },
      { status: 500 }
    );
  }
}