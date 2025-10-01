import { db } from "@/lib/database";
import { roomsTable } from "@/lib/database/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

//Type for context params
type Params = {
  params: {
    id: string;
  };
};

export async function GET(
  req: Request,
  { params }: Params
): Promise<NextResponse> {
  if (!params?.id) {
    return NextResponse.json(
      { success: false, error: "Room ID is required" },
      { status: 400 }
    );
  }

  try {
    const selectedRoom = await db
      .select()
      .from(roomsTable)
      .where(eq(roomsTable.id, params.id));

    if (!selectedRoom || selectedRoom.length === 0) {
      return NextResponse.json(
        { success: false, error: "selectedRoom not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: selectedRoom[0] });
  } catch (err: unknown) {
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