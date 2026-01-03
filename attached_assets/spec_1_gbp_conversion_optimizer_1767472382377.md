# SPEC-1-GBP Conversion Optimizer

## Background

Local businesses rely heavily on Google Business Profile (GBP) for discovery and high‑intent conversions (calls, directions, website clicks). However, owners and agencies lack a consistent, actionable way to identify listing gaps, quantify impact, and track improvement over time. The proposed system provides:

- A standardized GBP "Completeness & Conversion Readiness" score.
- An AI-driven action engine that detects deficiencies (photos/posts cadence, categories/services/attributes, reviews/Q&A, hours, products/menus) and recommends exact fixes.
- A weekly action plan with measurable targets tied to conversion metrics (calls, direction requests, website clicks), enabling continuous optimization and ROI attribution.

It integrates with Google Business Profile APIs (with user‑granted OAuth) for private listing and insights data, and Google Places API for public/comparative signals. Recommendations are generated via AI on top of deterministic rules, and progress is tracked week over week.

## Requirements

### Scope & Audience
- **Primary user**: Single-location business owner (non-technical) with Google account access to their GBP listing.
- **MVP surface**: Web app dashboard (Next.js).

### Functional Requirements (MoSCoW)

**Must Have**
1. **Google OAuth + Consent** for Business Profile access (user selects a single location to authorize).
2. **Ingestion of GBP data** via Business Profile APIs: business details, categories, services, attributes, opening hours, photos/posts metadata, reviews/Q&A, Insights (calls, direction requests, website clicks).
3. **Places API pull** for public listing info and basic competitor context (e.g., nearby/top-3 map pack peers, rating/count, open hours, photo volume).
4. **Scoring v1**: "Completeness & Conversion Readiness" score (0–100) composed of weighted sub-scores (Profile Completeness, Content Freshness, Reputation, Engagement/Insights trends).
5. **Rule + AI Recommendation Engine** generating a **weekly action plan** (3–7 prioritized tasks) with exact steps (e.g., “Add 10 photos across exterior/interior/products; post 2 updates; add secondary category X; enable attribute Y”).
6. **Photo/Post Cadence Recommendations** driven by recency/volume vs category norms.
7. **Category/Service/Attribute Suggestions** with evidence (e.g., peer-set usage, Google help docs link) and estimated impact.
8. **Progress Tracking** week-over-week on score and conversions (calls, directions, clicks), with a baseline snapshot.
9. **Task Tracking**: mark-as-done, snooze, auto-rescore.
10. **Data storage** for historical metrics and decisions (location-scoped; single tenant per user account).
11. **Privacy & Permissioning**: read-only by default; clearly indicate any write actions (if later added).

**Should Have**
12. **Competitor Benchmarking**: lightweight peer cohort from Places NearbySearch with deltas on rating, reviews, photo volume, posting frequency.
13. **Anomaly Detection** on insights (drops/spikes) with descriptive alerts.
14. *(Reserved)*: No notifications in MVP; consider lightweight in-app nudges only if explicitly enabled later.
15. **Audit Log** of recommendations applied and score changes.
16. **Multi-location–ready data model** (but UI limited to single location).

**Could Have**
17. **AI Post Drafting** (user-approved) based on seasonality/FAQs/promotions.
18. **Photo Quality Heuristics** (basic EXIF/orientation/blur detection) to flag low-quality uploads.
19. **Integrations**: Slack/Zapier webhooks for tasks and alerts.
20. **Website Tie-ins**: UTM templates and basic schema/org markup checks from the website URL.

**Won’t Have (Now)**
21. Automatic review gating/solicitation that violates platform policies.
22. Auto-editing GBP data without explicit user confirmation.
23. Complex A/B experiments on categories (manual only in MVP).

### Non-Functional Requirements
- **Security**: OAuth 2.0 with least-privilege scopes; encrypt at rest (KMS) and in transit (TLS 1.2+).
- **Privacy**: Store only location-scoped data needed for scoring; allow user to revoke and delete.
- **Reliability**: Daily data sync; action plan refresh weekly. Graceful degradation on API rate limits.
- **Performance**: Dashboard loads <2s p95 on recent data; background jobs under 5 minutes for sync + scoring.
- **Observability**: Structured logs, metrics for job success, API quota usage, and scoring latency.
- **Compliance**: GDPR/CCPA-ready data deletion and export.
- **Cost**: Track per-location API and compute cost; alert if monthly exceeds threshold.

## Method

### High-Level Architecture (MVP)
- **Web App (Next.js)**: Owner dashboard, score view, action plan, task tracking.
- **Auth & Consent**: Google OAuth (sign-in) + Business Profile scopes (user selects single location).
- **Backend API**: Next.js API routes for authenticated data access and job triggers.
- **Data Layer**: PostgreSQL (managed) for core data; Redis for job/queue state.
- **Workers**: Background jobs (BullMQ) for data sync (GBP & Places), scoring, recommendations.
- **Integrations**: Google Business Profile APIs; Google Places API.
- **AI Service**: LLM for recommendation phrasing and prioritization (prompted with deterministic rule outputs).
- **Storage**: Encrypted at rest; per-user, single-location scope.

#### Data Flow (MVP)
1. User signs in with Google → grants GBP access → selects location.
2. Sync job fetches GBP & Places data → stores normalized records.
3. Scoring job computes sub-scores and overall 0–100.
4. Recommendation engine produces 3–7 tasks with exact steps and estimated impact.
5. Dashboard displays score, trends, tasks; user marks done/snoozes → auto-rescore.

```plantuml
@startuml
actor Owner
rectangle WebApp as WA
rectangle Backend as BE
database Postgres as DB
queue Redis/BullMQ as Q
rectangle "GBP APIs" as GBP
rectangle "Places API" as GP
cloud "LLM" as LLM

Owner --> WA : Google Sign-In + Consent
WA --> BE : Auth'd requests
BE --> GBP : Fetch private listing/insights
BE --> GP : Fetch public/competitor signals
BE --> DB : Upsert normalized data
BE --> Q : Enqueue sync/score jobs
Q --> BE : Run jobs
BE --> LLM : Rule outputs → phrasing/prioritization
BE --> DB : Store score, tasks
WA --> BE : Read score/tasks; mark done
@enduml
```

### GCP Deployment & IAM (Chosen)
- **Runtime**: Cloud Run (Web + API) and Cloud Run Jobs (scheduled sync/score); **Cloud SQL (PostgreSQL)**; **Memorystore (Redis)**; **Cloud Storage** for cached media and exports.
- **Networking**: Private Serverless VPC Access to Cloud SQL/Memorystore; egress via NAT if needed.
- **Secrets**: Secret Manager for API keys (Places, OpenAI) and OAuth creds.
- **Auth**: Google Identity Services (OAuth). Scopes limited to Business Profile read/management and Performance metrics.
- **IAM**: Per-service accounts (web, worker) with least privilege (Secret Accessor, Cloud SQL Client, Redis Client).
- **Jobs**: Cloud Scheduler → Pub/Sub → Cloud Run Job triggers (daily sync; weekly recompute).
- **Observability**: Cloud Logging, Error Reporting, Cloud Trace.

### External APIs (MVP)
- **Business Information API** (read-only in MVP): locations.get, categories.list, attributes.list.
- **Business Profile Performance API**: time-series metrics for `CALL_CLICKS`, `WEBSITE_CLICKS`, `DIRECTION_REQUESTS` (daily granularity).
- **OAuth scope**: `https://www.googleapis.com/auth/business.manage` (minimum required for reading Business Profile & performance metrics). No write operations in MVP.
- **Places API** (API key): Nearby Search (New) for cohort discovery; Place Details (`rating`, `user_ratings_total`, `opening_hours`, `photos`). Field-masking to minimize cost.

### API Access Patterns (Read-only)
- **/auth/connect** → start OAuth with Business Profile scope.
- **/auth/callback** → exchange code; store refresh token; list user locations; user selects one.
- **/sync/location** → fetch Business Information; **/sync/performance** → fetch last 35 days metrics.
- **/peers/nearby** → Nearby Search (3 km, top 10) → hydrate with Place Details (field mask).

### Scoring Math (v1)
Let weights: `wP=0.30`, `wC=0.25`, `wR=0.25`, `wE=0.20`.

- **Profile Completeness (P)** ∈ [0,100]
  - Required fields present (name, phone, URL, hours) → 40 pts (pro-rata).
  - Categories: primary present (+10), relevant secondary vs peers (+10).
  - Services/Attributes coverage vs category-supported set (Jaccard) → 40 pts.
- **Content Freshness (C)** ∈ [0,100]
  - Photo volume percentile vs peers (p20→p80 mapped to 20–100) → 40 pts.
  - Last photo age: 0–45d → 100 to 60; >90d → 30 (linear) → 30 pts.
  - Posts in last 30d: 0→0, 1→60, ≥2→100 → 30 pts.
- **Reputation (R)** ∈ [0,100]
  - Star rating (winsorized 3.5–5.0 to 0–100) → 40 pts.
  - Review velocity vs peers (rank percentile) → 30 pts.
  - Owner response rate/time (last 90d) → 30 pts (≥90% & <48h → 100).
- **Engagement (E)** ∈ [0,100]
  - 4-week MA trend vs prior 4-week for calls/directions/clicks (each 1/3) with small-sample smoothing → 70 pts.
  - Anomaly penalty if z-score < −1.0 on any metric → −10 each (cap −20) → 30 base.

**Total Score** = `round(wP*P + wC*C + wR*R + wE*E)`.

### LLM Prompt Contract (MVP)
Input JSON (summarized):
```json
{
  "business": {"name": "Acme Dental", "primaryCategory": "dentist", "city": "Austin"},
  "peers": {"photoP40": 120, "postFreq": "1/wk"},
  "gaps": [
    {"type": "photos", "current": 60, "target": 120, "lastPhotoDays": 78},
    {"type": "posts", "lastPostDays": 45},
    {"type": "attributes", "missing": ["wheelchair_accessible_entrance"]}
  ],
  "insights": {"callsMA4": 32, "callsMA8": 41, "trend": -0.22}
}
```
Output schema:
```json
[
  {"title": "Upload 10 new photos across exterior/interior/products",
   "details_md": "Use landscape 1200px+. Tag interior, exterior, team.",
   "why_it_matters": "Peers show ~p40=120 photos and Google favors fresh media.",
   "est_impact": 4, "effort": 2, "links": ["https://support.google.com/business/answer/6103862"]}
]
```

### Error Handling & Quotas
- Exponential backoff on 429/5xx; store `retry_after` hints.
- Quota guards: per-location daily budget for Places; field-masked requests to control cost.
- Token refresh & rotation; revoke on user disconnect.

### Data Model v1 (single location)
- **users**(id, email, google_sub, created_at)
- **locations**(id, google_location_id, name, address, primary_category_id, place_id, timezone)
- **location_snapshots**(id, location_id, as_of_date, rating, reviews_count, photo_count, post_count, hours_status, attributes_json)
- **insights_daily**(id, location_id, date, calls, directions, website_clicks)
- **peers_daily**(id, location_id, date, peer_place_id, rating, reviews_count, open_now, distance_m)
- **score_weeks**(id, location_id, week_start, profile_score, content_score, reputation_score, engagement_score, total_score)
- **recommendations**(id, location_id, week_start, type, title, details_md, est_impact, status[open|done|snoozed], created_at)
- **audit_log**(id, location_id, action, metadata_json, created_at)

### Scoring v1 (0–100)
- **Profile Completeness (30%)**: critical fields present (name, primary category, phone, URL, hours, services, attributes), categories aligned to peers.
- **Content Freshness (25%)**: photo volume vs peer median; last photo age; posts in last 14/30 days.
- **Reputation (25%)**: rating (winsorized), review velocity vs peers; owner response rate/time.
- **Engagement/Trends (20%)**: 4-week moving averages for calls/directions/clicks; anomaly penalties.

### Recommendation Engine
- **Rules layer**: deterministic checks (e.g., "no post in 30d" → task; "photos < peer p40" → task; missing attribute supported by category → task).
- **AI layer**: converts rule outputs + evidence into concise, prioritized tasks (3–7) with exact steps and links; avoids policy-violating actions.
- **Benchmarks**: compute peer cohort via Nearby Search (within **3 km** or city centroid; **top 10** by relevance).

### Data Retention
- **Daily insights + peer snapshots** retained for **13 months**; **weekly rollups** retained indefinitely.

## Implementation

### GCP Project Setup
1. Create **GCP project**; enable: Business Profile APIs (Business Information, Performance), **Maps Places API**, **Cloud Run**, **Cloud SQL (Postgres)**, **Memorystore (Redis)**, **Secret Manager**, **Cloud Scheduler**, **Pub/Sub**.
2. Create **service accounts**: `web-app-sa`, `worker-sa`. Grant: Secret Manager Secret Accessor, Cloud SQL Client, Redis Client, Pub/Sub Publisher/Subscriber (as needed).
3. **Secret Manager**: `OPENAI_API_KEY`, `PLACES_API_KEY`, OAuth client secrets.
4. **Cloud SQL (Postgres 15+)**: private IP; set `instance_iam_authentication=on`.
5. **Memorystore (Redis 7)**: standard tier, private IP.
6. **Networking**: Serverless VPC Access connector for Cloud Run to reach SQL/Redis.

### Repos & Services
- **mono-repo** with apps:
  - `web`: Next.js app (pages for dashboard, tasks, auth callback).
  - `api`: Next.js API routes (or a small Fastify on Cloud Run) exposing authenticated endpoints.
  - `jobs`: worker (Node.js + BullMQ) for sync/scoring.
  - `pkg/llm`: provider interface (OpenAI first, pluggable).
  - `pkg/google`: typed clients for GBP/Places.

### Database (DDL excerpt)
```sql
create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  google_sub text unique not null,
  created_at timestamptz default now()
);
create table locations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  google_location_id text not null,
  name text not null,
  address jsonb not null,
  primary_category_id text,
  place_id text,
  timezone text not null,
  created_at timestamptz default now()
);
create table insights_daily (
  id bigserial primary key,
  location_id uuid references locations(id) on delete cascade,
  date date not null,
  calls int default 0,
  directions int default 0,
  website_clicks int default 0,
  unique (location_id, date)
);
create table peers_daily (
  id bigserial primary key,
  location_id uuid references locations(id) on delete cascade,
  date date not null,
  peer_place_id text not null,
  rating numeric(3,2),
  reviews_count int,
  open_now boolean,
  distance_m int,
  unique(location_id, date, peer_place_id)
);
create table score_weeks (
  id bigserial primary key,
  location_id uuid references locations(id) on delete cascade,
  week_start date not null,
  profile_score int,
  content_score int,
  reputation_score int,
  engagement_score int,
  total_score int,
  unique(location_id, week_start)
);
create table recommendations (
  id bigserial primary key,
  location_id uuid references locations(id) on delete cascade,
  week_start date not null,
  type text not null,
  title text not null,
  details_md text not null,
  est_impact int check (est_impact between 1 and 5),
  status text not null default 'open',
  created_at timestamptz default now()
);
```

### Sync & Scoring Jobs
- **Daily Sync (Cloud Scheduler → Pub/Sub → Cloud Run Job)**
  1. Refresh OAuth token; fetch **Business Information** (location, categories, attributes, hours) and **Performance metrics** for last 35 days.
  2. Query **Places Nearby Search (New)** with 3 km radius around location (or centroid); take **top 10** peers; hydrate via Place Details fields (rating, user_ratings_total, opening_hours, photos).
  3. Upsert normalized tables; compute peer medians (photo volume, rating, review velocity).
- **Weekly Recompute**
  1. Compute sub-scores and total.
  2. Run rules engine → produce gaps; hand to LLM for phrasing/prioritization; store 3–7 tasks.

### Rules (deterministic) Examples
- **Posts**: if no post in last 30d → `"Publish 2 updates this week (offer + update)."`
- **Photos**: if photo_count < peer p40 or last_photo_age > 45d → `"Upload 10 photos across exterior/interior/product/people."`
- **Categories**: if peers show frequent secondary category not present → suggest add; include examples.
- **Attributes**: if category supports attributes absent → list toggles (e.g., accessibility, amenities).
- **Hours**: warn if special/holiday hours missing for upcoming 30d.
- **Reputation**: if response rate < 90% or response time > 72h → `"Respond to last 20 reviews; template provided."`

### LLM Integration
- Prompt with: business category, current gaps, peer deltas, last-4wk conversions, owner tone preference.
- Output schema: `[{title, details_md, why_it_matters, est_impact(1-5), effort(1-5), links[]}]`.
- Guardrails: reject policy-violating advice; avoid unverifiable claims; cite evidence links to in-product help pages.

### Frontend (MVP Screens)
- **Dashboard**: total score + sub-scores; week-over-week trend for calls/directions/clicks.
- **Action Plan**: 3–7 tasks with checkboxes, snooze, "re-score" button.
- **Listing Checklist**: required fields, attributes, categories; photo/post recency indicators.
- **Settings**: Connect GBP, select location, revoke/delete data.

### Security & Privacy
- Scopes: request minimum Business Profile scopes for read/performance; **no write** in MVP.
- Data deletion: one-click delete purges location records and secrets; revoke OAuth.
- Logging: redact PII; use sampling for payloads.

## Milestones
1. **M0 – Project Setup (1 week)**: GCP project, IAM, Secrets, Cloud SQL/Memorystore, boilerplate Next.js + OAuth.
2. **M1 – Data Sync (2 weeks)**: GBP/Places clients; daily sync to DB; basic dashboard with raw metrics.
3. **M2 – Scoring v1 (1 week)**: implement sub-scores; weekly rollups.
4. **M3 – Recommendations v1 (2 weeks)**: rules → LLM phrasing; action plan UI; task CRUD.
5. **M4 – Peer Benchmarking (1 week)**: 3 km cohort + medians; integrate into scoring/rules.
6. **M5 – Hardening (1 week)**: tests, quotas, retries, observability, data deletion flow.
7. **M6 – Beta Launch**: 10–20 locations, collect feedback and tune weights.

## Gathering Results
- **Success Metrics**: +X points in score after 4 weeks; +Y% in calls/directions/website clicks vs 4-week baseline.
- **Attribution**: tag weeks when tasks completed; compare deltas vs weeks with no actions.
- **Quality Checks**: false-positive rate of suggestions <10%; user satisfaction (CSAT) ≥ 4.2/5.
- **Review Cadence**: monthly scoring weight audit; quarterly benchmark refresh by category cohort.

