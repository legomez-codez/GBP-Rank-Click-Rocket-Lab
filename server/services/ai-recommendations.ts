import type { PlaceSearchResult } from "@shared/schema";
import type { ScoreResult } from "./scoring";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
});

export interface Recommendation {
  type: string;
  title: string;
  details: string;
  impact: number;
  effort: number;
}

export async function generateRecommendations(
  place: PlaceSearchResult,
  score: ScoreResult
): Promise<Recommendation[]> {
  const prompt = `You are a Google Business Profile optimization expert. Analyze this business profile and provide actionable recommendations to improve their local search ranking and conversion rate.

Business Information:
- Name: ${place.name}
- Address: ${place.address}
- Rating: ${place.rating || "Not available"} (${place.reviewsCount || 0} reviews)
- Phone: ${place.phoneNumber || "Not listed"}
- Website: ${place.website || "Not listed"}
- Business Status: ${place.businessStatus || "Unknown"}
- Photo Count: ${place.photoCount || 0}
- Has Business Hours: ${place.openingHours ? "Yes" : "No"}
- Business Types: ${place.types?.join(", ") || "Not specified"}

Current Scores (out of 25 each):
- Profile: ${score.profile}/25
- Content: ${score.content}/25
- Reputation: ${score.reputation}/25
- Engagement: ${score.engagement}/25
- Total: ${score.total}/100

Generate 3-5 specific, actionable recommendations. Focus on the areas with lowest scores. For each recommendation, provide:
1. Type (one of: photos, reviews, posts, profile, hours, categories, description)
2. Title (brief action item)
3. Details (specific steps to implement, 2-3 sentences)
4. Impact (1-5, where 5 is highest impact on ranking/conversions)
5. Effort (1-5, where 1 is easiest to implement)

Respond in JSON format as an array of recommendations.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a Google Business Profile optimization expert. Respond only with valid JSON arrays.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const responseText = completion.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(responseText);
    
    // Handle various response formats
    const recommendations = parsed.recommendations || parsed.items || parsed;
    
    if (!Array.isArray(recommendations)) {
      console.error("AI response was not an array:", parsed);
      return getDefaultRecommendations(place, score);
    }

    return recommendations.map((rec: any) => ({
      type: rec.type || "profile",
      title: rec.title || "Optimization recommendation",
      details: rec.details || rec.description || "",
      impact: typeof rec.impact === "number" ? rec.impact : 3,
      effort: typeof rec.effort === "number" ? rec.effort : 2,
    }));
  } catch (error) {
    console.error("AI recommendation error:", error);
    return getDefaultRecommendations(place, score);
  }
}

function getDefaultRecommendations(
  place: PlaceSearchResult,
  score: ScoreResult
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  if (!place.phoneNumber) {
    recommendations.push({
      type: "profile",
      title: "Add a business phone number",
      details: "A phone number increases trust and enables customers to contact you directly. Add your business phone in Google Business Profile settings.",
      impact: 4,
      effort: 1,
    });
  }

  if (!place.website) {
    recommendations.push({
      type: "profile",
      title: "Add your website URL",
      details: "Linking your website drives traffic and improves credibility. Add your website in the business info section of your profile.",
      impact: 4,
      effort: 1,
    });
  }

  if ((place.photoCount || 0) < 10) {
    recommendations.push({
      type: "photos",
      title: "Upload more photos",
      details: `You have ${place.photoCount || 0} photos. Aim for at least 10 high-quality photos showing your business interior, exterior, products, and team.`,
      impact: 5,
      effort: 2,
    });
  }

  if (!place.openingHours) {
    recommendations.push({
      type: "hours",
      title: "Add business hours",
      details: "Business hours help customers know when to visit. Update your hours in Google Business Profile, including special holiday hours.",
      impact: 4,
      effort: 1,
    });
  }

  if ((place.reviewsCount || 0) < 20) {
    recommendations.push({
      type: "reviews",
      title: "Encourage more customer reviews",
      details: "Ask satisfied customers to leave a review. Consider creating a QR code or short link to your review page to make it easy.",
      impact: 5,
      effort: 3,
    });
  }

  return recommendations.slice(0, 5);
}
