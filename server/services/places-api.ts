import type { PlaceSearchResult } from "@shared/schema";

const PLACES_API_KEY = process.env.PLACES_API_KEY;

interface GooglePlaceResponse {
  places?: Array<{
    id: string;
    displayName?: { text: string };
    formattedAddress?: string;
    rating?: number;
    userRatingCount?: number;
    businessStatus?: string;
    nationalPhoneNumber?: string;
    websiteUri?: string;
    types?: string[];
    photos?: Array<{ name: string }>;
    currentOpeningHours?: any;
  }>;
}

export async function searchPlaces(
  businessName: string,
  city: string,
  state: string
): Promise<PlaceSearchResult[]> {
  if (!PLACES_API_KEY) {
    throw new Error("PLACES_API_KEY not configured");
  }

  const query = `${businessName} ${city} ${state}`;
  
  const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": PLACES_API_KEY,
      "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.businessStatus,places.nationalPhoneNumber,places.websiteUri,places.types,places.photos,places.currentOpeningHours",
    },
    body: JSON.stringify({
      textQuery: query,
      regionCode: "US",
      maxResultCount: 5,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Places API error:", errorText);
    throw new Error(`Places API error: ${response.status}`);
  }

  const data: GooglePlaceResponse = await response.json();
  
  if (!data.places || data.places.length === 0) {
    return [];
  }

  return data.places.map((place) => ({
    placeId: place.id,
    name: place.displayName?.text || "Unknown",
    address: place.formattedAddress || "",
    rating: place.rating,
    reviewsCount: place.userRatingCount,
    businessStatus: place.businessStatus,
    phoneNumber: place.nationalPhoneNumber,
    website: place.websiteUri,
    types: place.types,
    photoCount: place.photos?.length || 0,
    openingHours: place.currentOpeningHours,
    photoReferences: place.photos?.map((p) => p.name) || [],
  }));
}

export async function getPlaceDetails(placeId: string): Promise<PlaceSearchResult | null> {
  if (!PLACES_API_KEY) {
    throw new Error("PLACES_API_KEY not configured");
  }

  const response = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": PLACES_API_KEY,
      "X-Goog-FieldMask": "id,displayName,formattedAddress,rating,userRatingCount,businessStatus,nationalPhoneNumber,websiteUri,types,photos,currentOpeningHours",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Place Details API error:", errorText);
    return null;
  }

  const place = await response.json();
  
  return {
    placeId: place.id,
    name: place.displayName?.text || "Unknown",
    address: place.formattedAddress || "",
    rating: place.rating,
    reviewsCount: place.userRatingCount,
    businessStatus: place.businessStatus,
    phoneNumber: place.nationalPhoneNumber,
    website: place.websiteUri,
    types: place.types,
    photoCount: place.photos?.length || 0,
    openingHours: place.currentOpeningHours,
    photoReferences: place.photos?.map((p: any) => p.name) || [],
  };
}
