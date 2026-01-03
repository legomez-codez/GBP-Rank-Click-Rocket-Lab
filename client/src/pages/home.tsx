import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Search, BarChart3, CheckCircle2, Zap, MapPin, Building2, Loader2 } from "lucide-react";

interface PlaceResult {
  placeId: string;
  name: string;
  address: string;
  rating?: number;
  reviewsCount?: number;
}

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

export default function HomePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [businessName, setBusinessName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [searchResults, setSearchResults] = useState<PlaceResult[]>([]);

  const searchMutation = useMutation({
    mutationFn: async (data: { businessName: string; city: string; state: string }) => {
      const response = await apiRequest("POST", "/api/search", data);
      return response.json();
    },
    onSuccess: (data: PlaceResult[]) => {
      setSearchResults(data);
      if (data.length === 0) {
        toast({
          title: "No results found",
          description: "Try a different business name or location.",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Search failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !city.trim() || !state.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter business name, city, and state.",
        variant: "destructive",
      });
      return;
    }
    searchMutation.mutate({ businessName, city, state });
  };

  const handleSelectBusiness = (placeId: string) => {
    setLocation(`/results/${encodeURIComponent(placeId)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <nav className="border-b border-slate-100 dark:border-slate-800 fixed w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">G</span>
            </div>
            <span className="font-bold text-xl text-slate-900 dark:text-white">GBP Optimizer</span>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center space-y-6 mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-sm font-semibold border border-blue-100 dark:border-blue-800">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Free Business Profile Analysis
          </div>
          
          <h1 className="font-bold text-4xl md:text-5xl leading-tight text-slate-900 dark:text-white">
            Optimize Your Google Business Profile
          </h1>
          
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Get a free score and AI-powered recommendations to improve your local search ranking and convert more customers.
          </p>
        </div>

        <Card className="shadow-xl border-slate-200 dark:border-slate-700">
          <CardContent className="p-6 md:p-8">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="businessName">
                  Business Name
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="businessName"
                    data-testid="input-business-name"
                    placeholder="e.g., Joe's Pizza"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="city">
                    City
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="city"
                      data-testid="input-city"
                      placeholder="e.g., Austin"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="state">
                    State
                  </label>
                  <select
                    id="state"
                    data-testid="select-state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">Select state</option>
                    {US_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <Button 
                type="submit" 
                size="lg"
                className="w-full"
                disabled={searchMutation.isPending}
                data-testid="button-search"
              >
                {searchMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Search Business
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {searchResults.length > 0 && (
          <div className="mt-8 space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Select Your Business</h2>
            {searchResults.map((place) => (
              <Card 
                key={place.placeId} 
                className="cursor-pointer hover-elevate transition-all"
                onClick={() => handleSelectBusiness(place.placeId)}
                data-testid={`card-result-${place.placeId}`}
              >
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 dark:text-white truncate">{place.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{place.address}</p>
                    {place.rating && (
                      <div className="flex items-center gap-1 mt-1 text-sm text-slate-600 dark:text-slate-300">
                        <span className="text-amber-500">{"*".repeat(Math.round(place.rating))}</span>
                        <span>{place.rating.toFixed(1)}</span>
                        {place.reviewsCount && (
                          <span className="text-slate-400">({place.reviewsCount} reviews)</span>
                        )}
                      </div>
                    )}
                  </div>
                  <Button variant="ghost" size="icon">
                    <Search className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-slate-100 dark:border-slate-800">
            <CardContent className="p-6">
              <div className="h-12 w-12 bg-blue-50 dark:bg-blue-950 rounded-xl flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-white">Optimization Score</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Get a 0-100 score for your profile health based on Google's ranking factors.
              </p>
            </CardContent>
          </Card>
          <Card className="border-slate-100 dark:border-slate-800">
            <CardContent className="p-6">
              <div className="h-12 w-12 bg-emerald-50 dark:bg-emerald-950 rounded-xl flex items-center justify-center mb-4">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-white">Actionable Checklist</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Get a prioritized list of improvements to boost your local search ranking.
              </p>
            </CardContent>
          </Card>
          <Card className="border-slate-100 dark:border-slate-800">
            <CardContent className="p-6">
              <div className="h-12 w-12 bg-amber-50 dark:bg-amber-950 rounded-xl flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-amber-500" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-white">AI Recommendations</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Leverage AI to generate personalized optimization strategies for your business.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <footer className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-8 text-center text-slate-500 dark:text-slate-400 text-sm">
        <p>GBP Optimizer - Improve your Google Business Profile</p>
      </footer>
    </div>
  );
}
