import { type User, type InsertUser, type DailyLog, type InsertDailyLog, type SyllabusProgress, type InsertSyllabusProgress, type UserSettings, type InsertUserSettings } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getDailyLog(userId: string, date: string): Promise<DailyLog | undefined>;
  createDailyLog(dailyLog: InsertDailyLog): Promise<DailyLog>;
  updateDailyLog(userId: string, date: string, dailyLog: Partial<InsertDailyLog>): Promise<DailyLog | undefined>;
  
  getSyllabusProgress(userId: string): Promise<SyllabusProgress[]>;
  updateSyllabusProgress(progress: InsertSyllabusProgress): Promise<SyllabusProgress>;
  
  getUserSettings(userId: string): Promise<UserSettings | undefined>;
  updateUserSettings(userId: string, settings: Partial<InsertUserSettings>): Promise<UserSettings>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private dailyLogs: Map<string, DailyLog>;
  private syllabusProgress: Map<string, SyllabusProgress>;
  private userSettings: Map<string, UserSettings>;

  constructor() {
    this.users = new Map();
    this.dailyLogs = new Map();
    this.syllabusProgress = new Map();
    this.userSettings = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getDailyLog(userId: string, date: string): Promise<DailyLog | undefined> {
    const key = `${userId}-${date}`;
    return this.dailyLogs.get(key);
  }

  async createDailyLog(insertDailyLog: InsertDailyLog): Promise<DailyLog> {
    const id = randomUUID();
    const dailyLog: DailyLog = { 
      ...insertDailyLog, 
      id,
      createdAt: new Date()
    };
    const key = `${insertDailyLog.userId}-${insertDailyLog.date}`;
    this.dailyLogs.set(key, dailyLog);
    return dailyLog;
  }

  async updateDailyLog(userId: string, date: string, updates: Partial<InsertDailyLog>): Promise<DailyLog | undefined> {
    const key = `${userId}-${date}`;
    const existing = this.dailyLogs.get(key);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.dailyLogs.set(key, updated);
    return updated;
  }

  async getSyllabusProgress(userId: string): Promise<SyllabusProgress[]> {
    return Array.from(this.syllabusProgress.values()).filter(
      (progress) => progress.userId === userId
    );
  }

  async updateSyllabusProgress(insertProgress: InsertSyllabusProgress): Promise<SyllabusProgress> {
    const key = `${insertProgress.userId}-${insertProgress.subject}-${insertProgress.chapter}-${insertProgress.topic}`;
    const existing = this.syllabusProgress.get(key);
    
    if (existing) {
      const updated = { ...existing, ...insertProgress };
      this.syllabusProgress.set(key, updated);
      return updated;
    } else {
      const id = randomUUID();
      const progress: SyllabusProgress = { ...insertProgress, id };
      this.syllabusProgress.set(key, progress);
      return progress;
    }
  }

  async getUserSettings(userId: string): Promise<UserSettings | undefined> {
    return Array.from(this.userSettings.values()).find(
      (settings) => settings.userId === userId
    );
  }

  async updateUserSettings(userId: string, updates: Partial<InsertUserSettings>): Promise<UserSettings> {
    const existing = await this.getUserSettings(userId);
    
    if (existing) {
      const updated = { ...existing, ...updates };
      this.userSettings.set(existing.id, updated);
      return updated;
    } else {
      const id = randomUUID();
      const settings: UserSettings = { 
        id,
        userId,
        theme: "light",
        reminderTime: "09:00",
        currentStreak: 0,
        bestStreak: 0,
        ...updates
      };
      this.userSettings.set(id, settings);
      return settings;
    }
  }
}

export const storage = new MemStorage();
