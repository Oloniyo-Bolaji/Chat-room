// pages/api/rooms/index.ts
import { db } from "@/lib/database";
import { roomsTable, roomMembersTable } from "@/lib/database/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
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
    const joinedRoomsRecords = await db
      .select()
      .from(roomMembersTable)
      .where(eq(roomMembersTable.userId, userId));

    const joinedRoomIds = joinedRoomsRecords.map((r) => r.roomId);

    const joinedRooms = allRooms.filter((room) =>
      joinedRoomIds.includes(room.id)
    );
    const availableRooms = allRooms.filter(
      (room) => !joinedRoomIds.includes(room.id)
    );

    return NextResponse.json({ success: true, joinedRooms, availableRooms });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch rooms" },
      { status: 500 }
    );
  }
}
