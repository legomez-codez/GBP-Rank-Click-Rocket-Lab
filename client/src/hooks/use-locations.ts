import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

// List all locations
export function useLocations() {
  return useQuery({
    queryKey: [api.locations.list.path],
    queryFn: async () => {
      const res = await fetch(api.locations.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch locations");
      return api.locations.list.responses[200].parse(await res.json());
    },
  });
}

// Get single location
export function useLocation(id: number) {
  return useQuery({
    queryKey: [api.locations.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.locations.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch location");
      return api.locations.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

// Get location score
export function useLocationScore(id: number) {
  return useQuery({
    queryKey: [api.locations.score.path, id],
    queryFn: async () => {
      const url = buildUrl(api.locations.score.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch score");
      return api.locations.score.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

// Get recommendations
export function useRecommendations(id: number) {
  return useQuery({
    queryKey: [api.locations.recommendations.path, id],
    queryFn: async () => {
      const url = buildUrl(api.locations.recommendations.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch recommendations");
      return api.locations.recommendations.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

// Get insights
export function useInsights(id: number) {
  return useQuery({
    queryKey: [api.locations.insights.path, id],
    queryFn: async () => {
      const url = buildUrl(api.locations.insights.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch insights");
      return api.locations.insights.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

// Sync location
export function useSyncLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.locations.sync.path, { id });
      const res = await fetch(url, {
        method: api.locations.sync.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Sync failed");
      return api.locations.sync.responses[200].parse(await res.json());
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [api.locations.score.path, id] });
      queryClient.invalidateQueries({ queryKey: [api.locations.recommendations.path, id] });
      queryClient.invalidateQueries({ queryKey: [api.locations.insights.path, id] });
    },
  });
}

// Update recommendation status
export function useUpdateRecommendationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: 'open' | 'done' | 'snoozed' }) => {
      const url = buildUrl(api.recommendations.updateStatus.path, { id });
      const validated = api.recommendations.updateStatus.input.parse({ status });
      
      const res = await fetch(url, {
        method: api.recommendations.updateStatus.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Update failed");
      return api.recommendations.updateStatus.responses[200].parse(await res.json());
    },
    onSuccess: (updatedRec) => {
      // Invalidate the recommendations list for the parent location
      // We need to know the locationId to invalidate optimally, but global invalidation works too
      // Ideally backend returns locationId or we pass it through context
      queryClient.invalidateQueries({ queryKey: [api.locations.recommendations.path, updatedRec.locationId] });
      queryClient.invalidateQueries({ queryKey: [api.locations.score.path, updatedRec.locationId] });
    },
  });
}
