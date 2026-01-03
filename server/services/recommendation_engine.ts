import { batchProcess } from "./replit_integrations/batch";
import OpenAI from "openai";
import { storage } from "../storage";
import { type Location, type LocationSnapshot, type PeerDaily, type Recommendation } from "@shared/schema";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

interface AnalysisInput {
  location: Location;
  snapshot: LocationSnapshot | undefined;
  peers: PeerDaily[];
}

export async function generateRecommendationsForLocation(
  locationId: number,
  weekStart: string
): Promise<void> {
  const location = await storage.getLocation(locationId);
  if (!location) return;

  // Fetch relevant data (snapshot, peers, insights - simplified for MVP)
  // Ideally, we'd fetch the latest snapshot and peers for this location.
  // For MVP, we'll assume some mock data or fetch what's available.
  const snapshot = undefined; // await storage.getLatestSnapshot(locationId);
  const peers: PeerDaily[] = []; // await storage.getPeers(locationId);

  const input: AnalysisInput = { location, snapshot, peers };

  // Generate recommendations using OpenAI
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5.1",
      messages: [
        {
          role: "system",
          content: `You are a Google Business Profile expert. Analyze the business data and generate 3-5 specific, actionable recommendations to improve their conversion readiness score.
          Focus on:
          1. Profile Completeness (missing info)
          2. Content Freshness (photos, posts)
          3. Reputation (reviews, responses)
          4. Engagement trends

          Output JSON array of objects with keys:
          - type: string (photos, posts, info, reviews, q_a)
          - title: string (short, action-oriented)
          - detailsMd: string (markdown details, specific instructions)
          - estImpact: number (1-5, 5 being highest impact)
          - effort: number (1-5, 1 being easiest)
          `
        },
        {
          role: "user",
          content: JSON.stringify(input)
        }
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content || "{\"recommendations\": []}";
    const result = JSON.parse(content);
    const recs = result.recommendations || [];

    for (const rec of recs) {
      await storage.createRecommendation({
        locationId,
        weekStart,
        type: rec.type,
        title: rec.title,
        detailsMd: rec.detailsMd,
        estImpact: rec.estImpact,
        effort: rec.effort,
        status: "open",
      });
    }

  } catch (error) {
    console.error("Error generating recommendations:", error);
  }
}
