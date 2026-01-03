import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Globe, 
  Star, 
  Image as ImageIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  Rocket
} from "lucide-react";
import type { BusinessAnalysis } from "@shared/schema";

function ScoreRing({ score, label }: { score: number; label: string }) {
  const getColor = (s: number) => {
    if (s >= 20) return "text-primary";
    if (s >= 15) return "text-emerald-400";
    if (s >= 10) return "text-amber-400";
    return "text-red-400";
  };

  return (
    <div className="flex flex-col items-center gap-2" data-testid={`score-ring-${label.toLowerCase()}`}>
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 transform -rotate-90">
          <circle
            cx="40"
            cy="40"
            r="36"
            stroke="currentColor"
            strokeWidth="6"
            fill="none"
            className="text-muted"
          />
          <circle
            cx="40"
            cy="40"
            r="36"
            stroke="currentColor"
            strokeWidth="6"
            fill="none"
            strokeDasharray={`${(score / 25) * 226} 226`}
            className={getColor(score)}
          />
        </svg>
        <span className={`absolute inset-0 flex items-center justify-center font-bold text-lg ${getColor(score)}`}>
          {score}
        </span>
      </div>
      <span className="text-xs text-muted-foreground text-center">{label}</span>
    </div>
  );
}

export default function ResultsPage() {
  const params = useParams();
  const placeId = params.placeId ? decodeURIComponent(params.placeId) : "";

  const { data: analysis, isLoading, error } = useQuery<BusinessAnalysis>({
    queryKey: ["/api/analyze", placeId],
    enabled: !!placeId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto space-y-6 pt-20">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full bg-muted" />
            <Skeleton className="h-6 w-48 bg-muted" />
          </div>
          <Skeleton className="h-64 w-full bg-muted rounded-xl" />
          <Skeleton className="h-40 w-full bg-muted rounded-xl" />
          <Skeleton className="h-96 w-full bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-border bg-card">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2 text-foreground">Analysis Failed</h2>
            <p className="text-muted-foreground mb-4">
              We couldn't analyze this business. Please try again.
            </p>
            <Link href="/">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90" data-testid="button-back-home">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Search
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { place, score, recommendations } = analysis;

  const getScoreLabel = (s: number) => {
    if (s >= 80) return { text: "Excellent", color: "bg-primary text-primary-foreground" };
    if (s >= 60) return { text: "Good", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" };
    if (s >= 40) return { text: "Needs Work", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" };
    return { text: "Critical", color: "bg-red-500/20 text-red-400 border-red-500/30" };
  };

  const scoreLabel = getScoreLabel(score.total);

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" data-testid="button-back">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Rocket className="h-5 w-5 text-primary shrink-0" />
            <span className="font-semibold text-foreground truncate">{place.name}</span>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        <Card className="border-border bg-card rocket-glow">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-2xl font-bold text-foreground" data-testid="text-business-name">
                    {place.name}
                  </h1>
                  <div className="flex items-center gap-2 text-muted-foreground mt-1">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm" data-testid="text-address">{place.address}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 text-sm">
                  {place.phoneNumber && (
                    <div className="flex items-center gap-1 text-muted-foreground" data-testid="text-phone">
                      <Phone className="h-4 w-4" />
                      <span>{place.phoneNumber}</span>
                    </div>
                  )}
                  {place.website && (
                    <a 
                      href={place.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline"
                      data-testid="link-website"
                    >
                      <Globe className="h-4 w-4" />
                      <span>Website</span>
                    </a>
                  )}
                  {place.rating && (
                    <div className="flex items-center gap-1 text-muted-foreground" data-testid="text-rating">
                      <Star className="h-4 w-4 text-primary" />
                      <span>{place.rating.toFixed(1)} ({place.reviewsCount || 0} reviews)</span>
                    </div>
                  )}
                  {place.photoCount !== undefined && (
                    <div className="flex items-center gap-1 text-muted-foreground" data-testid="text-photos">
                      <ImageIcon className="h-4 w-4" />
                      <span>{place.photoCount} photos</span>
                    </div>
                  )}
                  {place.openingHours && (
                    <div className="flex items-center gap-1 text-emerald-400" data-testid="text-hours">
                      <Clock className="h-4 w-4" />
                      <span>Hours listed</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-center justify-center p-6 bg-muted rounded-xl min-w-[160px]">
                <div className="text-5xl font-bold text-primary" data-testid="text-total-score">
                  {score.total}
                </div>
                <div className="text-sm text-muted-foreground">out of 100</div>
                <Badge className={`mt-2 border ${scoreLabel.color}`} data-testid="badge-score-label">
                  {scoreLabel.text}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-foreground">Score Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex justify-around flex-wrap gap-4">
              <ScoreRing score={score.profile} label="Profile" />
              <ScoreRing score={score.content} label="Content" />
              <ScoreRing score={score.reputation} label="Reputation" />
              <ScoreRing score={score.engagement} label="Engagement" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-foreground">
              <Rocket className="h-5 w-5 text-primary" />
              AI Recommendations
              <Badge variant="outline" className="text-xs border-primary/30 text-primary" data-testid="badge-rec-count">
                {recommendations.length} items
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {recommendations.map((rec, index) => (
                <div key={index} className="p-4 hover:bg-muted/50 transition-colors" data-testid={`recommendation-${index}`}>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground" data-testid={`rec-title-${index}`}>{rec.title}</h3>
                        <Badge variant="outline" className="text-xs capitalize border-border text-muted-foreground" data-testid={`rec-type-${index}`}>{rec.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1" data-testid={`rec-details-${index}`}>{rec.details}</p>
                      <div className="flex items-center gap-4 mt-3 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Impact:</span>
                          <Progress value={rec.impact * 20} className="w-16 h-1.5 bg-muted [&>div]:bg-primary" />
                          <span className="text-foreground">{rec.impact}/5</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Effort:</span>
                          <Progress value={rec.effort * 20} className="w-16 h-1.5 bg-muted [&>div]:bg-muted-foreground" />
                          <span className="text-foreground">{rec.effort}/5</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="text-center py-8">
          <Link href="/">
            <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/10" data-testid="button-analyze-another">
              <Rocket className="mr-2 h-4 w-4" />
              Analyze Another Business
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
