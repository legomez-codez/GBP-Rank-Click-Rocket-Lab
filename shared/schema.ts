import { pgTable, text, serial, integer, boolean, timestamp, jsonb, date, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
export * from "./models/chat";

// Cached place searches (optional persistence for searched businesses)
export const placeCaches = pgTable("place_caches", {
  id: serial("id").primaryKey(),
  placeId: text("place_id").notNull().unique(),
  name: text("name").notNull(),
  address: text("address"),
  rating: doublePrecision("rating"),
  reviewsCount: integer("reviews_count"),
  photoCount: integer("photo_count"),
  businessStatus: text("business_status"),
  phoneNumber: text("phone_number"),
  website: text("website"),
  types: text("types").array(),
  openingHours: jsonb("opening_hours"),
  photoReferences: text("photo_references").array(),
  lastFetched: timestamp("last_fetched").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Cached scores for places (so we don't recalculate every time)
export const placeScores = pgTable("place_scores", {
  id: serial("id").primaryKey(),
  placeId: text("place_id").notNull(),
  profileScore: integer("profile_score").default(0),
  contentScore: integer("content_score").default(0),
  reputationScore: integer("reputation_score").default(0),
  engagementScore: integer("engagement_score").default(0),
  totalScore: integer("total_score").default(0),
  calculatedAt: timestamp("calculated_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Cached recommendations for places
export const placeRecommendations = pgTable("place_recommendations", {
  id: serial("id").primaryKey(),
  placeId: text("place_id").notNull(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  detailsMd: text("details_md"),
  estImpact: integer("est_impact"),
  effort: integer("effort"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Search input schema
export const searchBusinessSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
});

// Schemas
export const insertPlaceCacheSchema = createInsertSchema(placeCaches).omit({ id: true, createdAt: true, lastFetched: true });
export const insertPlaceScoreSchema = createInsertSchema(placeScores).omit({ id: true, createdAt: true, calculatedAt: true });
export const insertPlaceRecommendationSchema = createInsertSchema(placeRecommendations).omit({ id: true, createdAt: true });

// Types
export type PlaceCache = typeof placeCaches.$inferSelect;
export type InsertPlaceCache = z.infer<typeof insertPlaceCacheSchema>;
export type PlaceScore = typeof placeScores.$inferSelect;
export type InsertPlaceScore = z.infer<typeof insertPlaceScoreSchema>;
export type PlaceRecommendation = typeof placeRecommendations.$inferSelect;
export type InsertPlaceRecommendation = z.infer<typeof insertPlaceRecommendationSchema>;
export type SearchBusinessInput = z.infer<typeof searchBusinessSchema>;

// Place search result (from Google API)
export interface PlaceSearchResult {
  placeId: string;
  name: string;
  address: string;
  rating?: number;
  reviewsCount?: number;
  businessStatus?: string;
  phoneNumber?: string;
  website?: string;
  types?: string[];
  photoCount?: number;
  openingHours?: any;
  photoReferences?: string[];
}

// Analysis result returned to frontend
export interface BusinessAnalysis {
  place: PlaceSearchResult;
  score: {
    total: number;
    profile: number;
    content: number;
    reputation: number;
    engagement: number;
  };
  recommendations: Array<{
    type: string;
    title: string;
    details: string;
    impact: number;
    effort: number;
  }>;
}
