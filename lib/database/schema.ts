import { pgTable, uuid, varchar, text, timestamp, boolean } from "drizzle-orm/pg-core";
//import { relations } from "drizzle-orm";

// USERS TABLE
export const usersTable = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  image: text("image"), 
  username: varchar("username", { length: 50 }),
  phoneNo: varchar("phone_no", { length: 20 }),
  bio: varchar("bio"),
  visibility: boolean("visibility").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});