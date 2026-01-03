import type { PlaceSearchResult } from "@shared/schema";

export interface ScoreResult {
  total: number;
  profile: number;
  content: number;
  reputation: number;
  engagement: number;
}

export function calculateScore(place: PlaceSearchResult): ScoreResult {
  // Profile Score (25 points max)
  // - Has phone number: 5 pts
  // - Has website: 5 pts
  // - Has address: 5 pts
  // - Has business hours: 5 pts
  // - Has business types: 5 pts
  let profileScore = 0;
  if (place.phoneNumber) profileScore += 5;
  if (place.website) profileScore += 5;
  if (place.address) profileScore += 5;
  if (place.openingHours) profileScore += 5;
  if (place.types && place.types.length > 0) profileScore += 5;

  // Content Score (25 points max)
  // - Photos: up to 15 pts based on count (10+ photos = full points)
  // - Business status operational: 10 pts
  let contentScore = 0;
  const photoCount = place.photoCount || 0;
  contentScore += Math.min(15, Math.floor(photoCount * 1.5));
  if (place.businessStatus === "OPERATIONAL") contentScore += 10;

  // Reputation Score (25 points max)
  // - Rating: up to 15 pts (5 stars = 15 pts)
  // - Review count: up to 10 pts (100+ reviews = full points)
  let reputationScore = 0;
  if (place.rating) {
    reputationScore += Math.floor((place.rating / 5) * 15);
  }
  const reviewCount = place.reviewsCount || 0;
  reputationScore += Math.min(10, Math.floor(reviewCount / 10));

  // Engagement Score (25 points max)
  // For public API data, we estimate based on profile completeness
  // - Complete profile suggests active management: up to 15 pts
  // - Recent activity (photos, updates) suggested by data freshness: up to 10 pts
  let engagementScore = 0;
  const completenessFactors = [
    place.phoneNumber,
    place.website,
    place.openingHours,
    photoCount > 0,
    place.rating,
  ].filter(Boolean).length;
  engagementScore += completenessFactors * 3; // up to 15
  if (photoCount >= 5) engagementScore += 5;
  if (reviewCount >= 20) engagementScore += 5;

  // Cap all scores at 25
  profileScore = Math.min(25, profileScore);
  contentScore = Math.min(25, contentScore);
  reputationScore = Math.min(25, reputationScore);
  engagementScore = Math.min(25, engagementScore);

  const total = profileScore + contentScore + reputationScore + engagementScore;

  return {
    total,
    profile: profileScore,
    content: contentScore,
    reputation: reputationScore,
    engagement: engagementScore,
  };
}
