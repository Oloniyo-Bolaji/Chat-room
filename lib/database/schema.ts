import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";
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

export const roomsTable = pgTable("rooms", {
  id: uuid("id").defaultRandom().primaryKey(),
  roomName: varchar("room_name", { length: 255 }).notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  avatar: varchar("avatar", { length: 255 }),
  messages: jsonb("messages")
});
