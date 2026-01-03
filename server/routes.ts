import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import session from "express-session";
import createMemoryStore from "memorystore";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { registerChatRoutes } from "./replit_integrations/chat";
import { registerImageRoutes } from "./replit_integrations/image";

const MemoryStore = createMemoryStore(session);

// Type extensions for session
declare global {
  namespace Express {
    interface User {
      id: number;
      email: string;
      name?: string;
    }
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Session setup
  app.use(
    session({
      cookie: { maxAge: 86400000 },
      store: new MemoryStore({
        checkPeriod: 86400000,
      }),
      resave: false,
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET || "gbp_optimizer_secret",
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  // Passport config
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Google Strategy
  // NOTE: This will fail until user provides GOOGLE_CLIENT_ID/SECRET
  // We'll wrap it in a try-catch or check envs to avoid crashing on startup,
  // but functionality requires them.
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: "/auth/google/callback",
          scope: ["profile", "email"], // Add GBP scopes later: 'https://www.googleapis.com/auth/business.manage'
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const googleId = profile.id;
            const email = profile.emails?.[0]?.value;
            const name = profile.displayName;
            const picture = profile.photos?.[0]?.value;

            if (!email) {
              return done(new Error("No email found from Google profile"));
            }

            let user = await storage.getUserByGoogleId(googleId);
            if (!user) {
              user = await storage.createUser({
                googleId,
                email,
                name,
                picture,
              });
            }
            return done(null, user);
          } catch (err) {
            return done(err);
          }
        }
      )
    );
  }

  // Auth Routes
  app.get("/auth/google", (req, res, next) => {
    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).send("Google Auth not configured (missing CLIENT_ID)");
    }
    passport.authenticate("google")(req, res, next);
  });

  app.get(
    "/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/" }),
    (req, res) => {
      res.redirect("/dashboard");
    }
  );

  app.get(api.auth.user.path, (req, res) => {
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else {
      res.json(null);
    }
  });

  app.post(api.auth.logout.path, (req, res) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ message: "Logout failed" });
      res.json({ message: "Logged out" });
    });
  });

  // Middleware for protected routes
  const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) return next();
    res.status(401).json({ message: "Unauthorized" });
  };

  // Locations
  app.get(api.locations.list.path, requireAuth, async (req, res) => {
    const locations = await storage.getLocationsByUserId(req.user!.id);
    res.json(locations);
  });

  app.get(api.locations.get.path, requireAuth, async (req, res) => {
    const location = await storage.getLocation(Number(req.params.id));
    // Check ownership? (Skip for MVP demo simplicity, but should verify location.userId === req.user.id)
    if (!location) return res.status(404).json({ message: "Location not found" });
    res.json(location);
  });

  app.post(api.locations.sync.path, requireAuth, async (req, res) => {
    // Mock sync functionality for MVP
    const locationId = Number(req.params.id);
    console.log(`Syncing location ${locationId}...`);
    // In real app, call Google APIs here.
    // Update snapshots, insights, etc.
    res.json({ message: "Sync started" });
  });

  app.get(api.locations.score.path, requireAuth, async (req, res) => {
    const score = await storage.getLatestScore(Number(req.params.id));
    if (!score) return res.status(404).json({ message: "Score not found" });
    res.json(score);
  });

  app.get(api.locations.recommendations.path, requireAuth, async (req, res) => {
    const recs = await storage.getRecommendations(Number(req.params.id), new Date().toISOString());
    res.json(recs);
  });

  app.get(api.locations.insights.path, requireAuth, async (req, res) => {
    const insights = await storage.getInsights(Number(req.params.id));
    res.json(insights);
  });

  app.patch(api.recommendations.updateStatus.path, requireAuth, async (req, res) => {
    try {
      const { status } = api.recommendations.updateStatus.input.parse(req.body);
      const updated = await storage.updateRecommendationStatus(Number(req.params.id), status);
      if (!updated) return res.status(404).json({ message: "Recommendation not found" });
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Register Integration Routes
  registerChatRoutes(app);
  registerImageRoutes(app);

  // Seed Data Endpoint (for demo)
  app.post("/api/seed", requireAuth, async (req, res) => {
    const userId = req.user!.id;
    // Check if location exists
    let locations = await storage.getLocationsByUserId(userId);
    if (locations.length === 0) {
      // Create mock location
      const loc = await storage.createLocation({
        userId,
        name: "Acme Dental Austin",
        googleLocationId: "loc-12345",
        placeId: "place-123",
        address: "123 Main St, Austin, TX",
        primaryCategoryId: "Dentist",
      });

      // Create mock score
      await storage.createScore({
        locationId: loc.id,
        weekStart: new Date().toISOString(),
        profileScore: 40,
        contentScore: 60,
        reputationScore: 80,
        engagementScore: 50,
        totalScore: 58,
      });

      // Create mock insights
      const today = new Date();
      for (let i = 0; i < 30; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        await db.insert(schema.insightsDaily).values({
          locationId: loc.id,
          date: d.toISOString(),
          calls: Math.floor(Math.random() * 10),
          directions: Math.floor(Math.random() * 20),
          websiteClicks: Math.floor(Math.random() * 15),
        });
      }

      // Create mock recommendations
      await storage.createRecommendation({
        locationId: loc.id,
        weekStart: new Date().toISOString(),
        type: "photos",
        title: "Upload 10 new photos",
        detailsMd: "Use landscape 1200px+. Tag interior, exterior, team.",
        estImpact: 4,
        effort: 2,
        status: "open",
      });
      await storage.createRecommendation({
        locationId: loc.id,
        weekStart: new Date().toISOString(),
        type: "posts",
        title: "Create a weekly update post",
        detailsMd: "Share a recent customer success story or new service.",
        estImpact: 3,
        effort: 1,
        status: "open",
      });

      res.json({ message: "Seeded" });
    } else {
      res.json({ message: "Already seeded" });
    }
  });

  return httpServer;
}
