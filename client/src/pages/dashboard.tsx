import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { RefreshCw, MapPin } from "lucide-react";
import { useUser } from "@/hooks/use-auth";
import { useLocations, useSyncLocation, useLocationScore, useRecommendations, useInsights } from "@/hooks/use-locations";
import { LayoutShell } from "@/components/layout-shell";
import { ScoreCard } from "@/components/score-card";
import { RecommendationCard } from "@/components/recommendation-card";
import { InsightsChart } from "@/components/insights-chart";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const [, setLocation] = useLocation();
  const { data: user, isLoading: isUserLoading } = useUser();
  const { data: locations, isLoading: isLocationsLoading } = useLocations();
  const [selectedLocationId, setSelectedLocationId] = useState<string>("");
  const { mutate: syncLocation, isPending: isSyncing } = useSyncLocation();

  // Redirect if not logged in
  useEffect(() => {
    if (!isUserLoading && !user) {
      setLocation("/");
    }
  }, [user, isUserLoading, setLocation]);

  // Set default location
  useEffect(() => {
    if (locations && locations.length > 0 && !selectedLocationId) {
      setSelectedLocationId(locations[0].id.toString());
    }
  }, [locations, selectedLocationId]);

  const locationIdNum = parseInt(selectedLocationId);

  // Fetch location-specific data
  const { data: scoreData, isLoading: isScoreLoading } = useLocationScore(locationIdNum);
  const { data: recommendations, isLoading: isRecsLoading } = useRecommendations(locationIdNum);
  const { data: insights, isLoading: isInsightsLoading } = useInsights(locationIdNum);

  if (isUserLoading || !user) return null;

  const handleSync = () => {
    if (locationIdNum) {
      syncLocation(locationIdNum);
    }
  };

  const activeRecs = recommendations?.filter(r => r.status === 'open') || [];

  return (
    <LayoutShell>
      <div className="space-y-8 animate-fade-in">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-500">Welcome back, {user.name}</p>
          </div>

          <div className="flex items-center gap-3">
            <Select value={selectedLocationId} onValueChange={setSelectedLocationId}>
              <SelectTrigger className="w-[280px] h-10 bg-white border-slate-200 shadow-sm">
                <MapPin className="h-4 w-4 mr-2 text-slate-400" />
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {isLocationsLoading ? (
                  <div className="p-2 space-y-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                ) : (
                  locations?.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id.toString()}>
                      {loc.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>

            <Button 
              onClick={handleSync} 
              disabled={isSyncing || !selectedLocationId}
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? "animate-spin" : ""}`} />
              {isSyncing ? "Syncing..." : "Sync Data"}
            </Button>
          </div>
        </div>

        {selectedLocationId ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Score Column */}
            <div className="lg:col-span-2 space-y-8">
              <ScoreCard 
                score={scoreData?.totalScore || 0}
                subScores={{
                  profile: scoreData?.profileScore || 0,
                  content: scoreData?.contentScore || 0,
                  reputation: scoreData?.reputationScore || 0,
                  engagement: scoreData?.engagementScore || 0,
                }}
                isLoading={isScoreLoading}
              />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-display font-bold text-slate-900">Weekly Action Plan</h3>
                  <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
                    {activeRecs.length} Pending
                  </span>
                </div>
                
                {isRecsLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-24 w-full rounded-xl" />
                    <Skeleton className="h-24 w-full rounded-xl" />
                    <Skeleton className="h-24 w-full rounded-xl" />
                  </div>
                ) : activeRecs.length > 0 ? (
                  <div className="space-y-4">
                    {activeRecs.map((rec) => (
                      <RecommendationCard key={rec.id} recommendation={rec} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white p-12 rounded-xl border border-slate-200 text-center shadow-sm">
                    <div className="h-16 w-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">All Caught Up!</h3>
                    <p className="text-slate-500 max-w-sm mx-auto">
                      Great job! You've completed all recommendations for this week. Check back later for more insights.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Insights */}
            <div className="space-y-8">
              <InsightsChart data={insights || []} isLoading={isInsightsLoading} />
              
              {/* Quick Info Card */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-900/20">
                <h3 className="font-display font-bold text-lg mb-2">Did you know?</h3>
                <p className="text-blue-100 text-sm leading-relaxed mb-4">
                  Businesses with photos receive 42% more requests for directions on Google Maps and 35% more clicks through to their websites.
                </p>
                <Button variant="secondary" size="sm" className="w-full bg-white/10 hover:bg-white/20 text-white border-0">
                  Add Photos Now
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <h3 className="text-xl font-bold text-slate-900">No Locations Found</h3>
            <p className="text-slate-500 mt-2">Please link your Google Business Profile to get started.</p>
          </div>
        )}
      </div>
    </LayoutShell>
  );
}
