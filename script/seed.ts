import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";
import { storage } from "../server/storage";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

async function seed() {
  console.log("Seeding database...");

  try {
    // Create a demo user if not exists
    let user = await storage.getUserByGoogleId("demo-user-id");
    if (!user) {
      user = await storage.createUser({
        email: "demo@example.com",
        googleId: "demo-user-id",
        name: "Demo User",
        picture: "https://github.com/shadcn.png"
      });
      console.log("Created demo user:", user.id);
    }

    // Create a demo location
    const locations = await storage.getLocationsByUserId(user.id);
    let locationId: number;

    if (locations.length === 0) {
      const loc = await storage.createLocation({
        userId: user.id,
        name: "Acme Dental Austin",
        googleLocationId: "loc-12345",
        placeId: "place-123",
        address: "123 Main St, Austin, TX",
        primaryCategoryId: "Dentist",
      });
      locationId = loc.id;
      console.log("Created demo location:", loc.id);
    } else {
      locationId = locations[0].id;
      console.log("Using existing location:", locationId);
    }

    // Create mock score
    await storage.createScore({
      locationId: locationId,
      weekStart: new Date().toISOString().split('T')[0],
      profileScore: 65,
      contentScore: 40,
      reputationScore: 85,
      engagementScore: 70,
      totalScore: 65,
    });
    console.log("Created demo score");

    // Create mock insights
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      // Check if insight already exists to avoid unique constraint violation if any (though schema doesn't enforce unique date per loc currently)
      // simplified: just insert
      await db.insert(schema.insightsDaily).values({
        locationId: locationId,
        date: dateStr,
        calls: Math.floor(Math.random() * 10) + 2,
        directions: Math.floor(Math.random() * 20) + 5,
        websiteClicks: Math.floor(Math.random() * 15) + 3,
      });
    }
    console.log("Created demo insights");

    // Create mock recommendations
    await storage.createRecommendation({
      locationId: locationId,
      weekStart: new Date().toISOString().split('T')[0],
      type: "photos",
      title: "Upload 10 new photos",
      detailsMd: "Use landscape 1200px+. Tag interior, exterior, team.",
      estImpact: 4,
      effort: 2,
      status: "open",
    });
    await storage.createRecommendation({
      locationId: locationId,
      weekStart: new Date().toISOString().split('T')[0],
      type: "posts",
      title: "Create a weekly update post",
      detailsMd: "Share a recent customer success story or new service.",
      estImpact: 3,
      effort: 1,
      status: "open",
    });
    console.log("Created demo recommendations");

  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    pool.end();
  }
}

seed();
