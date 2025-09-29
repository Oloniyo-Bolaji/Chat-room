import type { User, Session } from "next-auth";
import type { NextAuthOptions } from "next-auth";

import GoogleProvider from "next-auth/providers/google";
import { db } from "./lib/database";
import { usersTable } from "./lib/database/schema";
import { eq } from "drizzle-orm";

export const authConfig: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      httpOptions: { timeout: 10000 },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    // When user signs in
    async signIn({ user }: { user: User }) {
      if (!user?.email) return false;

      try {
        const existingUser = await db.query.usersTable.findFirst({
          where: eq(usersTable.email, user.email),
        });

        if (!existingUser) {
          await db.insert(usersTable).values({
            name: user.name ?? "",
            email: user.email,
            image: user.image ?? "",
          });
        } else {
          console.log("✅ User already exists in DB:", existingUser);
        }
      } catch (err) {
        console.error("❌ Error while inserting/finding user:", err);
        return false;
      }

      return true; // allow login
    },

    // When session is created / checked
    async session({ session }: { session: Session }) {
      if (!session.user?.email) return session;

      try {
        const dbUser = await db.query.usersTable.findFirst({
          where: eq(usersTable.email, session.user.email),
        });

        if (dbUser) {
          // 🔧 requires next-auth type augmentation
          session.user.id = dbUser.id;
        } else {
          console.warn("⚠️ No DB user found for:", session.user.email);
        }
      } catch (err) {
        console.error("❌ Error fetching user in session callback:", err);
      }

      return session;
    },
  },
};
