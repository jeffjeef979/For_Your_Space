import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  boolean,
  json,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Events table
export const events = mysqlTable("events", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  venueName: varchar("venueName", { length: 255 }),
  venueAddress: text("venueAddress"),
  venueLat: varchar("venueLat", { length: 32 }),
  venueLng: varchar("venueLng", { length: 32 }),
  startTime: timestamp("startTime").notNull(),
  endTime: timestamp("endTime").notNull(),
  status: mysqlEnum("status", ["upcoming", "active", "ended"]).default("upcoming").notNull(),
  lumaEventId: varchar("lumaEventId", { length: 128 }),
  coverImageUrl: text("coverImageUrl"),
  wifiSsid: varchar("wifiSsid", { length: 128 }),
  wifiPassword: varchar("wifiPassword", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

// Attendees / check-in table
export const attendees = mysqlTable("attendees", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("eventId").notNull(),
  userId: int("userId"),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  tableNumber: varchar("tableNumber", { length: 16 }),
  checkInStatus: mysqlEnum("checkInStatus", ["pending", "confirmed", "checked_in"]).default("pending").notNull(),
  checkedInAt: timestamp("checkedInAt"),
  linkedinUrl: text("linkedinUrl"),
  instagramHandle: varchar("instagramHandle", { length: 64 }),
  avatarUrl: text("avatarUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Attendee = typeof attendees.$inferSelect;
export type InsertAttendee = typeof attendees.$inferInsert;

// Event timeline items
export const timelineItems = mysqlTable("timelineItems", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("eventId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  startTime: timestamp("startTime").notNull(),
  endTime: timestamp("endTime"),
  location: varchar("location", { length: 255 }),
  sortOrder: int("sortOrder").default(0),
});

export type TimelineItem = typeof timelineItems.$inferSelect;
export type InsertTimelineItem = typeof timelineItems.$inferInsert;

// Voice / chat requests
export const voiceRequests = mysqlTable("voiceRequests", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("eventId").notNull(),
  attendeeId: int("attendeeId"),
  attendeeName: varchar("attendeeName", { length: 255 }),
  tableNumber: varchar("tableNumber", { length: 16 }),
  transcript: text("transcript").notNull(),
  aiResponse: text("aiResponse"),
  intent: mysqlEnum("intent", ["informational", "service_request", "navigation", "speaker_research", "networking", "other"]).default("other"),
  status: mysqlEnum("status", ["pending", "answered", "escalated"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type VoiceRequest = typeof voiceRequests.$inferSelect;
export type InsertVoiceRequest = typeof voiceRequests.$inferInsert;
