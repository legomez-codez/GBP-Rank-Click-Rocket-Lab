/*
  # Create Business Optimization Database Schema

  ## Overview
  This migration creates the core tables for a business optimization and recommendations system.
  The system analyzes Google Places businesses and provides GBP optimization recommendations.

  ## Tables

  ### 1. place_caches
  Stores cached business data from Google Places API to avoid redundant API calls.
  - Reduces API usage costs
  - Improves query performance
  - Stores complete place information with metadata

  ### 2. place_scores
  Stores pre-calculated optimization scores for each business to avoid recalculation.
  - profile_score: Business profile completeness (0-100)
  - content_score: Content quality and optimization (0-100)
  - reputation_score: Reviews and ratings strength (0-100)
  - engagement_score: Customer interaction level (0-100)
  - total_score: Aggregate optimization score (0-400)

  ### 3. place_recommendations
  Stores AI-generated optimization recommendations for each business.
  - Recommendations are generated based on analysis results
  - Stores improvement suggestions with impact estimates
  - Cached to avoid re-generating recommendations

  ## Security
  - Row Level Security (RLS) is not enabled as this is not a multi-tenant app with user isolation
  - Tables are application-internal and managed by backend services
  - No direct user access to these tables through API
*/

CREATE TABLE IF NOT EXISTS place_caches (
  id SERIAL PRIMARY KEY,
  place_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  address TEXT,
  rating DOUBLE PRECISION,
  reviews_count INTEGER,
  photo_count INTEGER,
  business_status TEXT,
  phone_number TEXT,
  website TEXT,
  types TEXT[],
  opening_hours JSONB,
  photo_references TEXT[],
  last_fetched TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS place_scores (
  id SERIAL PRIMARY KEY,
  place_id TEXT NOT NULL,
  profile_score INTEGER DEFAULT 0,
  content_score INTEGER DEFAULT 0,
  reputation_score INTEGER DEFAULT 0,
  engagement_score INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS place_recommendations (
  id SERIAL PRIMARY KEY,
  place_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  details_md TEXT,
  est_impact INTEGER,
  effort INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_place_caches_place_id ON place_caches(place_id);
CREATE INDEX IF NOT EXISTS idx_place_scores_place_id ON place_scores(place_id);
CREATE INDEX IF NOT EXISTS idx_place_recommendations_place_id ON place_recommendations(place_id);
