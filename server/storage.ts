import { db } from "./db";
import {
  placeCaches, placeScores, placeRecommendations,
  type PlaceCache, type InsertPlaceCache, 
  type PlaceScore, type InsertPlaceScore,
  type PlaceRecommendation, type InsertPlaceRecommendation
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { chatStorage, type IChatStorage } from "./replit_integrations/chat";

export interface IStorage extends IChatStorage {
  // Place Cache
  getPlaceByPlaceId(placeId: string): Promise<PlaceCache | undefined>;
  upsertPlaceCache(place: InsertPlaceCache): Promise<PlaceCache>;

  // Place Scores
  getPlaceScore(placeId: string): Promise<PlaceScore | undefined>;
  createPlaceScore(score: InsertPlaceScore): Promise<PlaceScore>;

  // Place Recommendations
  getPlaceRecommendations(placeId: string): Promise<PlaceRecommendation[]>;
  createPlaceRecommendation(rec: InsertPlaceRecommendation): Promise<PlaceRecommendation>;
  deleteRecommendationsForPlace(placeId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Chat Integration
  getConversation = chatStorage.getConversation;
  getAllConversations = chatStorage.getAllConversations;
  createConversation = chatStorage.createConversation;
  deleteConversation = chatStorage.deleteConversation;
  getMessagesByConversation = chatStorage.getMessagesByConversation;
  createMessage = chatStorage.createMessage;

  // Place Cache
  async getPlaceByPlaceId(placeId: string): Promise<PlaceCache | undefined> {
    const [place] = await db.select().from(placeCaches).where(eq(placeCaches.placeId, placeId));
    return place;
  }

  async upsertPlaceCache(place: InsertPlaceCache): Promise<PlaceCache> {
    const existing = await this.getPlaceByPlaceId(place.placeId);
    if (existing) {
      const [updated] = await db.update(placeCaches)
        .set({ ...place, lastFetched: new Date() })
        .where(eq(placeCaches.placeId, place.placeId))
        .returning();
      return updated;
    }
    const [newPlace] = await db.insert(placeCaches).values(place).returning();
    return newPlace;
  }

  // Place Scores
  async getPlaceScore(placeId: string): Promise<PlaceScore | undefined> {
    const [score] = await db.select().from(placeScores)
      .where(eq(placeScores.placeId, placeId))
      .orderBy(desc(placeScores.calculatedAt))
      .limit(1);
    return score;
  }

  async createPlaceScore(score: InsertPlaceScore): Promise<PlaceScore> {
    const [newScore] = await db.insert(placeScores).values(score).returning();
    return newScore;
  }

  // Place Recommendations
  async getPlaceRecommendations(placeId: string): Promise<PlaceRecommendation[]> {
    return db.select().from(placeRecommendations)
      .where(eq(placeRecommendations.placeId, placeId))
      .orderBy(desc(placeRecommendations.estImpact));
  }

  async createPlaceRecommendation(rec: InsertPlaceRecommendation): Promise<PlaceRecommendation> {
    const [newRec] = await db.insert(placeRecommendations).values(rec).returning();
    return newRec;
  }

  async deleteRecommendationsForPlace(placeId: string): Promise<void> {
    await db.delete(placeRecommendations).where(eq(placeRecommendations.placeId, placeId));
  }
}

export const storage = new DatabaseStorage();
