import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const dailyLogs = pgTable("daily_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD format
  goals: jsonb("goals").$type<Array<{id: string, text: string, completed: boolean, type: 'text' | 'topic', subject?: string, chapter?: string, topic?: string}>>().default([]),
  sleep: jsonb("sleep").$type<{bedtime?: string, wakeTime?: string, totalHours?: number}>().default({}),
  studyData: jsonb("study_data").$type<Record<string, {target: number, practiced: Array<{chapter: string, topic: string, count: number}>}>>().default({}),
  lectures: jsonb("lectures").$type<Array<{subject: string, chapter: string, topic: string, duration: number}>>().default([]),
  notes: text("notes").default(""),
  schoolAttendance: text("school_attendance").default(""), // "present" | "absent" | "holiday"
  createdAt: timestamp("created_at").defaultNow(),
});

export const syllabusProgress = pgTable("syllabus_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  subject: text("subject").notNull(),
  chapter: text("chapter").notNull(),
  topic: text("topic").notNull(),
  questionsCompleted: jsonb("questions_completed").$type<number>().default(0),
  lecturesAttended: jsonb("lectures_attended").$type<number>().default(0),
  goalsCompleted: jsonb("goals_completed").$type<number>().default(0),
});

export const userSettings = pgTable("user_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique(),
  theme: text("theme").default("light"),
  reminderTime: text("reminder_time").default("09:00"),
  currentStreak: jsonb("current_streak").$type<number>().default(0),
  bestStreak: jsonb("best_streak").$type<number>().default(0),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertDailyLogSchema = createInsertSchema(dailyLogs).omit({
  id: true,
  createdAt: true,
});

export const insertSyllabusProgressSchema = createInsertSchema(syllabusProgress).omit({
  id: true,
});

export const insertUserSettingsSchema = createInsertSchema(userSettings).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type DailyLog = typeof dailyLogs.$inferSelect;
export type InsertDailyLog = z.infer<typeof insertDailyLogSchema>;
export type SyllabusProgress = typeof syllabusProgress.$inferSelect;
export type InsertSyllabusProgress = z.infer<typeof insertSyllabusProgressSchema>;
export type UserSettings = typeof userSettings.$inferSelect;
export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
