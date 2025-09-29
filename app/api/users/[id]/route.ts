import { db } from "@/lib/database";
import { usersTable } from "@/lib/database/schema";
import { NextResponse } from "next/server";
import { and, eq, ne } from "drizzle-orm";

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
      { success: false, error: "User ID is required" },
      { status: 400 }
    );
  }

  try {
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, params.id));

    if (!user || user.length === 0) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: user[0] });
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

export async function PUT(
  req: Request,
  { params }: Params
): Promise<NextResponse> {
  if (!params?.id) {
    return NextResponse.json(
      { success: false, error: "User ID is required" },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();
    if (body.username) {
      const existing = await db
        .select()
        .from(usersTable)
        .where(
          and(
            eq(usersTable.username, body.username),
            ne(usersTable.id, params.id)
          )
        );

      if (existing.length > 0) {
        return NextResponse.json(
          { success: false, error: "Username already taken" },
          { status: 400 }
        );
      }
    }
    // Update the user
    const updated = await db
      .update(usersTable)
      .set({
        username: body.username,
        phoneNo: body.phoneNo,
        bio: body.bio,
        visibility: body.visibility,
      })
      .where(eq(usersTable.id, params.id))
      .returning(); // returns the updated row(s)

    if (!updated || updated.length === 0) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated[0] });
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
