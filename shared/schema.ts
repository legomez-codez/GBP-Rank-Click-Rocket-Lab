import { pgTable, text, serial, integer, boolean, timestamp, jsonb, date, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
export * from "./models/chat";

// Users (single tenant per user account)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  googleId: text("google_id").unique(), // google_sub
  name: text("name"),
  picture: text("picture"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  googleLocationId: text("google_location_id").notNull(), // from GBP
  name: text("name").notNull(),
  address: text("address"),
  primaryCategoryId: text("primary_category_id"),
  placeId: text("place_id"), // Google Places ID
  timezone: text("timezone"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const locationSnapshots = pgTable("location_snapshots", {
  id: serial("id").primaryKey(),
  locationId: integer("location_id").references(() => locations.id).notNull(),
  asOfDate: date("as_of_date").notNull(),
  rating: doublePrecision("rating"),
  reviewsCount: integer("reviews_count"),
  photoCount: integer("photo_count"),
  postCount: integer("post_count"),
  hoursStatus: text("hours_status"),
  attributesJson: jsonb("attributes_json"), // Store attributes as JSON
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insightsDaily = pgTable("insights_daily", {
  id: serial("id").primaryKey(),
  locationId: integer("location_id").references(() => locations.id).notNull(),
  date: date("date").notNull(),
  calls: integer("calls").default(0),
  directions: integer("directions").default(0),
  websiteClicks: integer("website_clicks").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const peersDaily = pgTable("peers_daily", {
  id: serial("id").primaryKey(),
  locationId: integer("location_id").references(() => locations.id).notNull(),
  date: date("date").notNull(),
  peerPlaceId: text("peer_place_id").notNull(),
  name: text("name"),
  rating: doublePrecision("rating"),
  reviewsCount: integer("reviews_count"),
  photoCount: integer("photo_count"),
  distanceMeters: doublePrecision("distance_meters"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const scoreWeeks = pgTable("score_weeks", {
  id: serial("id").primaryKey(),
  locationId: integer("location_id").references(() => locations.id).notNull(),
  weekStart: date("week_start").notNull(),
  profileScore: integer("profile_score").default(0),
  contentScore: integer("content_score").default(0),
  reputationScore: integer("reputation_score").default(0),
  engagementScore: integer("engagement_score").default(0),
  totalScore: integer("total_score").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const recommendations = pgTable("recommendations", {
  id: serial("id").primaryKey(),
  locationId: integer("location_id").references(() => locations.id).notNull(),
  weekStart: date("week_start").notNull(),
  type: text("type").notNull(), // photos, posts, categories, etc.
  title: text("title").notNull(),
  detailsMd: text("details_md"),
  estImpact: integer("est_impact"),
  effort: integer("effort"),
  status: text("status").default("open"), // open, done, snoozed
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertLocationSchema = createInsertSchema(locations).omit({ id: true, createdAt: true });
export const insertRecommendationSchema = createInsertSchema(recommendations).omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Location = typeof locations.$inferSelect;
export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type LocationSnapshot = typeof locationSnapshots.$inferSelect;
export type InsightDaily = typeof insightsDaily.$inferSelect;
export type PeerDaily = typeof peersDaily.$inferSelect;
export type ScoreWeek = typeof scoreWeeks.$inferSelect;
export type Recommendation = typeof recommendations.$inferSelect;
