import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { searchBusinessSchema, type BusinessAnalysis } from "@shared/schema";
import { z } from "zod";
import { searchPlaces, getPlaceDetails } from "./services/places-api";
import { calculateScore } from "./services/scoring";
import { generateRecommendations } from "./services/ai-recommendations";
import { registerChatRoutes } from "./replit_integrations/chat";
import { registerImageRoutes } from "./replit_integrations/image";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Search for businesses
  app.post("/api/search", async (req, res) => {
    try {
      const input = searchBusinessSchema.parse(req.body);
      const places = await searchPlaces(input.businessName, input.city, input.state);
      res.json(places);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Search error:", error);
      res.status(500).json({ message: "Failed to search for businesses" });
    }
  });

  // Analyze a specific business by placeId
  app.get("/api/analyze/:placeId", async (req, res) => {
    try {
      const { placeId } = req.params;
      
      if (!placeId) {
        return res.status(400).json({ message: "Place ID is required" });
      }

      // Check cache first (within last hour)
      const cachedScore = await storage.getPlaceScore(placeId);
      const cachedPlace = await storage.getPlaceByPlaceId(placeId);
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      if (cachedScore && cachedPlace && cachedScore.calculatedAt > oneHourAgo) {
        const cachedRecommendations = await storage.getPlaceRecommendations(placeId);
        const analysis: BusinessAnalysis = {
          place: {
            placeId: cachedPlace.placeId,
            name: cachedPlace.name,
            address: cachedPlace.address || "",
            rating: cachedPlace.rating || undefined,
            reviewsCount: cachedPlace.reviewsCount || undefined,
            businessStatus: cachedPlace.businessStatus || undefined,
            phoneNumber: cachedPlace.phoneNumber || undefined,
            website: cachedPlace.website || undefined,
            types: cachedPlace.types || undefined,
            photoCount: cachedPlace.photoCount || undefined,
            openingHours: cachedPlace.openingHours,
            photoReferences: cachedPlace.photoReferences || undefined,
          },
          score: {
            total: cachedScore.totalScore || 0,
            profile: cachedScore.profileScore || 0,
            content: cachedScore.contentScore || 0,
            reputation: cachedScore.reputationScore || 0,
            engagement: cachedScore.engagementScore || 0,
          },
          recommendations: cachedRecommendations.map((r) => ({
            type: r.type,
            title: r.title,
            details: r.detailsMd || "",
            impact: r.estImpact || 3,
            effort: r.effort || 2,
          })),
        };
        return res.json(analysis);
      }

      // Fetch fresh data from Google
      const place = await getPlaceDetails(placeId);
      if (!place) {
        return res.status(404).json({ message: "Business not found" });
      }

      // Calculate score
      const score = calculateScore(place);

      // Generate AI recommendations
      const recommendations = await generateRecommendations(place, score);

      // Cache the results
      await storage.upsertPlaceCache({
        placeId: place.placeId,
        name: place.name,
        address: place.address,
        rating: place.rating,
        reviewsCount: place.reviewsCount,
        photoCount: place.photoCount,
        businessStatus: place.businessStatus,
        phoneNumber: place.phoneNumber,
        website: place.website,
        types: place.types,
        openingHours: place.openingHours,
        photoReferences: place.photoReferences,
      });

      await storage.createPlaceScore({
        placeId: place.placeId,
        profileScore: score.profile,
        contentScore: score.content,
        reputationScore: score.reputation,
        engagementScore: score.engagement,
        totalScore: score.total,
      });

      // Delete old recommendations and create new ones
      await storage.deleteRecommendationsForPlace(placeId);
      for (const rec of recommendations) {
        await storage.createPlaceRecommendation({
          placeId: place.placeId,
          type: rec.type,
          title: rec.title,
          detailsMd: rec.details,
          estImpact: rec.impact,
          effort: rec.effort,
        });
      }

      const analysis: BusinessAnalysis = {
        place,
        score,
        recommendations,
      };

      res.json(analysis);
    } catch (error) {
      console.error("Analysis error:", error);
      res.status(500).json({ message: "Failed to analyze business" });
    }
  });

  // Register Integration Routes
  registerChatRoutes(app);
  registerImageRoutes(app);

  return httpServer;
}
