import { db } from "@/lib/database";
import {
  roomsTable,
  roomMembersTable,
  messagesTable,
  messageReadsTable,
} from "@/lib/database/schema";
import { eq, desc, and, gt, ne } from "drizzle-orm";
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
    // 1️⃣ Fetch all rooms
    const allRooms = await db.select().from(roomsTable);

    // 2️⃣ Get all rooms user has joined
    const joinedMemberships = await db.query.roomMembersTable.findMany({
      where: eq(roomMembersTable.userId, userId),
      with: { room: true },
    });

    const joinedRooms = joinedMemberships.map((m) => m.room);
    const joinedRoomIds = joinedRooms.map((r) => r.id);

    // 3️⃣ For each joined room, get the last message + unread count
    const roomsWithLastMessageAndUnread = await Promise.all(
      joinedRooms.map(async (room) => {
        // Get the last message in the room
        const lastMessage = await db.query.messagesTable.findFirst({
          where: eq(messagesTable.roomId, room.id),
          orderBy: desc(messagesTable.createdAt),
        });

        // Find user's last read record
        const lastRead = await db.query.messageReadsTable.findFirst({
          where: and(
            eq(messageReadsTable.userId, userId),
            eq(messageReadsTable.roomId, room.id)
          ),
        });
        // Calculate unread count
        let unreadCount = null;

        if (lastRead?.lastReadAt) {
          // Count messages created AFTER the last read timestamp
          // AND not sent by the current user
          const unreadMessages = await db
            .select()
            .from(messagesTable)
            .where(
              and(
                eq(messagesTable.roomId, room.id),
                gt(messagesTable.createdAt, lastRead.lastReadAt),
                ne(messagesTable.senderId, userId)
              )
            );

          unreadCount = unreadMessages.length;
        } else {
          // User has never read this room → count all messages except their own
          const allMessages = await db
            .select()
            .from(messagesTable)
            .where(
              and(
                eq(messagesTable.roomId, room.id),
                ne(messagesTable.senderId, userId)
              )
            );

          unreadCount = allMessages.length;
        }

        return {
          ...room,
          lastMessage: lastMessage || null,
          unreadCount,
        };
      })
    );

    // 4️⃣ Available rooms (not joined)
    const availableRooms = allRooms.filter(
      (room) => !joinedRoomIds.includes(room.id)
    );

    return NextResponse.json({
      success: true,
      joinedRooms: roomsWithLastMessageAndUnread,
      availableRooms,
    });
  } catch (err) {
    console.error("Error fetching rooms:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch rooms" },
      { status: 500 }
    );
  }
}
