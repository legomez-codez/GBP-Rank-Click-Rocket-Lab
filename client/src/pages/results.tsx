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
  AlertCircle
} from "lucide-react";
import type { BusinessAnalysis } from "@shared/schema";

function ScoreRing({ score, label }: { score: number; label: string }) {
  const getColor = (s: number) => {
    if (s >= 80) return "text-emerald-500";
    if (s >= 60) return "text-blue-500";
    if (s >= 40) return "text-amber-500";
    return "text-red-500";
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 transform -rotate-90">
          <circle
            cx="40"
            cy="40"
            r="36"
            stroke="currentColor"
            strokeWidth="6"
            fill="none"
            className="text-slate-200 dark:text-slate-700"
          />
          <circle
            cx="40"
            cy="40"
            r="36"
            stroke="currentColor"
            strokeWidth="6"
            fill="none"
            strokeDasharray={`${(score / 25) * 226} 226`}
            className={getColor((score / 25) * 100)}
          />
        </svg>
        <span className={`absolute inset-0 flex items-center justify-center font-bold text-lg ${getColor((score / 25) * 100)}`}>
          {score}
        </span>
      </div>
      <span className="text-xs text-slate-500 dark:text-slate-400 text-center">{label}</span>
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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Analysis Failed</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              We couldn't analyze this business. Please try again.
            </p>
            <Link href="/">
              <Button data-testid="button-back-home">
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
    if (s >= 80) return { text: "Excellent", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" };
    if (s >= 60) return { text: "Good", color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" };
    if (s >= 40) return { text: "Needs Work", color: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" };
    return { text: "Critical", color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" };
  };

  const scoreLabel = getScoreLabel(score.total);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" data-testid="button-back">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div className="flex-1 truncate">
            <span className="font-semibold text-slate-900 dark:text-white">{place.name}</span>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white" data-testid="text-business-name">
                    {place.name}
                  </h1>
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mt-1">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm" data-testid="text-address">{place.address}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 text-sm">
                  {place.phoneNumber && (
                    <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                      <Phone className="h-4 w-4" />
                      <span>{place.phoneNumber}</span>
                    </div>
                  )}
                  {place.website && (
                    <a 
                      href={place.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:underline"
                    >
                      <Globe className="h-4 w-4" />
                      <span>Website</span>
                    </a>
                  )}
                  {place.rating && (
                    <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                      <Star className="h-4 w-4 text-amber-500" />
                      <span>{place.rating.toFixed(1)} ({place.reviewsCount || 0} reviews)</span>
                    </div>
                  )}
                  {place.photoCount !== undefined && (
                    <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                      <ImageIcon className="h-4 w-4" />
                      <span>{place.photoCount} photos</span>
                    </div>
                  )}
                  {place.openingHours && (
                    <div className="flex items-center gap-1 text-emerald-600">
                      <Clock className="h-4 w-4" />
                      <span>Hours listed</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl min-w-[140px]">
                <div className="text-5xl font-bold text-slate-900 dark:text-white" data-testid="text-total-score">
                  {score.total}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">out of 100</div>
                <Badge className={`mt-2 ${scoreLabel.color}`} data-testid="badge-score-label">
                  {scoreLabel.text}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Score Breakdown</CardTitle>
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

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              AI Recommendations
              <Badge variant="secondary" className="text-xs">
                {recommendations.length} items
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recommendations.map((rec, index) => (
                <div key={index} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors" data-testid={`recommendation-${index}`}>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <CheckCircle2 className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-slate-900 dark:text-white">{rec.title}</h3>
                        <Badge variant="outline" className="text-xs capitalize">{rec.type}</Badge>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{rec.details}</p>
                      <div className="flex items-center gap-4 mt-3 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">Impact:</span>
                          <Progress value={rec.impact * 20} className="w-16 h-1.5" />
                          <span className="text-slate-700 dark:text-slate-300">{rec.impact}/5</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">Effort:</span>
                          <Progress value={rec.effort * 20} className="w-16 h-1.5" />
                          <span className="text-slate-700 dark:text-slate-300">{rec.effort}/5</span>
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
            <Button variant="outline" size="lg" data-testid="button-analyze-another">
              Analyze Another Business
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
