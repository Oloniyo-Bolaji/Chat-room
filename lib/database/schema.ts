import { relations } from "drizzle-orm";
import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  jsonb,
  unique,
} from "drizzle-orm/pg-core";

// ================= USERS =================
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

// ================= ROOMS =================
export const roomsTable = pgTable("rooms", {
  id: uuid("id").defaultRandom().primaryKey(),
  roomName: varchar("room_name", { length: 255 }).notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  avatar: varchar("avatar", { length: 255 }),
  creatorId: uuid("creator_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "set null" }),
});

// ================= ROOM MEMBERS =================
export const roomMembersTable = pgTable(
  "room_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    roomId: uuid("room_id")
      .notNull()
      .references(() => roomsTable.id, { onDelete: "cascade" }),
    joinedAt: timestamp("joined_at").defaultNow(),
  },
  (table) => ({
    userRoomUnique: unique("user_room_unique").on(table.userId, table.roomId),
  })
);

// ================= MESSAGES =================
export const messagesTable = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  roomId: uuid("room_id")
    .notNull()
    .references(() => roomsTable.id, { onDelete: "cascade" }),
  senderId: uuid("sender_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ================= MESSAGE READS =================
export const messageReadsTable = pgTable("message_reads", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  roomId: uuid("room_id")
    .notNull()
    .references(() => roomsTable.id, { onDelete: "cascade" }),
  lastReadMessageId: uuid("last_read_message_id").references(
    () => messagesTable.id
  ),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ================= RELATIONS =================
export const roomMembersRelations = relations(roomMembersTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [roomMembersTable.userId],
    references: [usersTable.id],
  }),
  room: one(roomsTable, {
    fields: [roomMembersTable.roomId],
    references: [roomsTable.id],
  }),
}));

export const usersRelations = relations(usersTable, ({ many }) => ({
  rooms: many(roomsTable),
  memberships: many(roomMembersTable),
}));

export const roomsRelations = relations(roomsTable, ({ one, many }) => ({
  creator: one(usersTable, {
    fields: [roomsTable.creatorId],
    references: [usersTable.id],
  }),
  members: many(roomMembersTable),
  messages: many(messagesTable),
}));

export const messagesRelations = relations(messagesTable, ({ one }) => ({
  room: one(roomsTable, {
    fields: [messagesTable.roomId],
    references: [roomsTable.id],
  }),
  sender: one(usersTable, {
    fields: [messagesTable.senderId],
    references: [usersTable.id],
  }),
}));

export const messageReadsRelations = relations(messageReadsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [messageReadsTable.userId],
    references: [usersTable.id],
  }),
  room: one(roomsTable, {
    fields: [messageReadsTable.roomId],
    references: [roomsTable.id],
  }),
  lastReadMessage: one(messagesTable, {
    fields: [messageReadsTable.lastReadMessageId],
    references: [messagesTable.id],
  }),
}));
