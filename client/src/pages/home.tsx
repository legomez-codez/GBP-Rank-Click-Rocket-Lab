import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Search, BarChart3, CheckCircle2, Zap, MapPin, Building2, Loader2, Rocket } from "lucide-react";

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
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border fixed w-full bg-background/90 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <a href="https://clickrocketlab.com/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <Rocket className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl text-foreground">Click Rocket Lab</span>
          </a>
        </div>
      </nav>
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center space-y-6 mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold border border-primary/20">
            <Rocket className="h-4 w-4" />
            Free Business Profile Audit
          </div>
          
          <h1 className="font-bold text-4xl md:text-5xl leading-tight text-foreground">
            Rankings That <span className="text-primary">Soar</span>
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get a free score and AI-powered recommendations to boost your Google Business Profile and convert more local leads.
          </p>
        </div>

        <Card className="rocket-glow border-border bg-card">
          <CardContent className="p-6 md:p-8">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="businessName">
                  Business Name
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="businessName"
                    data-testid="input-business-name"
                    placeholder="e.g., Joe's Pizza"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="pl-10 bg-background border-input text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground" htmlFor="city">
                    City
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="city"
                      data-testid="input-city"
                      placeholder="e.g., Austin"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="pl-10 bg-background border-input text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground" htmlFor="state">
                    State
                  </label>
                  <select
                    id="state"
                    data-testid="select-state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="" className="bg-card">Select state</option>
                    {US_STATES.map((s) => (
                      <option key={s} value={s} className="bg-card">{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <Button 
                type="submit" 
                size="lg"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
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
                    <Rocket className="mr-2 h-4 w-4" />
                    Launch Audit
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {searchResults.length > 0 && (
          <div className="mt-8 space-y-4">
            <h2 className="text-xl font-bold text-foreground">Select Your Business</h2>
            {searchResults.map((place) => (
              <Card 
                key={place.placeId} 
                className="cursor-pointer hover-elevate border-border bg-card hover:border-primary/50 transition-all"
                onClick={() => handleSelectBusiness(place.placeId)}
                data-testid={`card-result-${place.placeId}`}
              >
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{place.name}</h3>
                    <p className="text-sm text-muted-foreground truncate">{place.address}</p>
                    {place.rating && (
                      <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                        <span className="text-primary">{"*".repeat(Math.round(place.rating))}</span>
                        <span>{place.rating.toFixed(1)}</span>
                        {place.reviewsCount && (
                          <span className="text-muted-foreground/70">({place.reviewsCount} reviews)</span>
                        )}
                      </div>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                    <Search className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-foreground mb-8">Results, Delivered Locally</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-foreground">Higher Google Rankings</h3>
              <p className="text-muted-foreground text-sm">
                Get a 0-100 score for your profile health based on Google's ranking factors.
              </p>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-foreground">More Local Leads</h3>
              <p className="text-muted-foreground text-sm">
                Get a prioritized list of improvements to boost your local search and conversions.
              </p>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-foreground">Increased Conversions</h3>
              <p className="text-muted-foreground text-sm">
                Leverage AI to generate personalized optimization strategies for your business.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
      <footer className="border-t border-border py-8 text-center text-muted-foreground text-sm">
        <p>© 2026 <a href="https://clickrocketlab.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Click Rocket Lab</a>. All rights reserved.</p>
      </footer>
    </div>
  );
}
