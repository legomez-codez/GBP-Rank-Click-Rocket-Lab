import { db } from "./db";
import {
  users, locations, locationSnapshots, insightsDaily, peersDaily, scoreWeeks, recommendations,
  type User, type InsertUser, type Location, type InsertLocation, type ScoreWeek, type Recommendation, type InsightDaily
} from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";
import { chatStorage, type IChatStorage } from "./replit_integrations/chat";

export interface IStorage extends IChatStorage {
  // User
  getUser(id: number): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Locations
  getLocationsByUserId(userId: number): Promise<Location[]>;
  getLocation(id: number): Promise<Location | undefined>;
  createLocation(location: InsertLocation): Promise<Location>;

  // Scores
  getLatestScore(locationId: number): Promise<ScoreWeek | undefined>;
  createScore(score: typeof scoreWeeks.$inferInsert): Promise<ScoreWeek>;

  // Recommendations
  getRecommendations(locationId: number, weekStart: string): Promise<Recommendation[]>; // weekStart as string YYYY-MM-DD
  updateRecommendationStatus(id: number, status: string): Promise<Recommendation | undefined>;
  createRecommendation(rec: typeof recommendations.$inferInsert): Promise<Recommendation>;

  // Insights
  getInsights(locationId: number, limit?: number): Promise<InsightDaily[]>;
}

export class DatabaseStorage implements IStorage {
  // Chat Integration
  getConversation = chatStorage.getConversation;
  getAllConversations = chatStorage.getAllConversations;
  createConversation = chatStorage.createConversation;
  deleteConversation = chatStorage.deleteConversation;
  getMessagesByConversation = chatStorage.getMessagesByConversation;
  createMessage = chatStorage.createMessage;

  // User
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Locations
  async getLocationsByUserId(userId: number): Promise<Location[]> {
    return db.select().from(locations).where(eq(locations.userId, userId));
  }

  async getLocation(id: number): Promise<Location | undefined> {
    const [location] = await db.select().from(locations).where(eq(locations.id, id));
    return location;
  }

  async createLocation(location: InsertLocation): Promise<Location> {
    const [newLocation] = await db.insert(locations).values(location).returning();
    return newLocation;
  }

  // Scores
  async getLatestScore(locationId: number): Promise<ScoreWeek | undefined> {
    const [score] = await db.select().from(scoreWeeks)
      .where(eq(scoreWeeks.locationId, locationId))
      .orderBy(desc(scoreWeeks.weekStart))
      .limit(1);
    return score;
  }

  async createScore(score: typeof scoreWeeks.$inferInsert): Promise<ScoreWeek> {
    const [newScore] = await db.insert(scoreWeeks).values(score).returning();
    return newScore;
  }

  // Recommendations
  async getRecommendations(locationId: number, weekStart: string): Promise<Recommendation[]> {
    return db.select().from(recommendations)
      .where(
        and(
          eq(recommendations.locationId, locationId),
          // Simple filter by location for now, assuming weekStart logic handled by caller or filter
        )
      )
      .orderBy(desc(recommendations.estImpact));
  }

  async updateRecommendationStatus(id: number, status: string): Promise<Recommendation | undefined> {
    const [updated] = await db.update(recommendations)
      .set({ status })
      .where(eq(recommendations.id, id))
      .returning();
    return updated;
  }

  async createRecommendation(rec: typeof recommendations.$inferInsert): Promise<Recommendation> {
    const [newRec] = await db.insert(recommendations).values(rec).returning();
    return newRec;
  }

  // Insights
  async getInsights(locationId: number, limit = 30): Promise<InsightDaily[]> {
    return db.select().from(insightsDaily)
      .where(eq(insightsDaily.locationId, locationId))
      .orderBy(desc(insightsDaily.date))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();
