import { useState } from "react";
import { Check, Clock, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUpdateRecommendationStatus } from "@/hooks/use-locations";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Recommendation } from "@shared/schema";
import { cn } from "@/lib/utils";

interface RecommendationCardProps {
  recommendation: Recommendation;
}

export function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { mutate: updateStatus, isPending } = useUpdateRecommendationStatus();

  // Color mapping based on impact/effort
  const impactColor = {
    high: "bg-purple-100 text-purple-700 border-purple-200",
    medium: "bg-blue-100 text-blue-700 border-blue-200",
    low: "bg-slate-100 text-slate-700 border-slate-200",
  };

  // Convert numeric est_impact to text
  const getImpactLabel = (val: number | null) => {
    if (!val) return "Low";
    if (val > 7) return "High Impact";
    if (val > 4) return "Medium Impact";
    return "Low Impact";
  };
  
  const getImpactStyle = (val: number | null) => {
    if (!val) return impactColor.low;
    if (val > 7) return impactColor.high;
    if (val > 4) return impactColor.medium;
    return impactColor.low;
  };

  if (recommendation.status === "done") return null;

  return (
    <div className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="p-5 flex items-start gap-4">
          <div className={`mt-1 h-10 w-10 shrink-0 rounded-full flex items-center justify-center ${
            recommendation.type === 'alert' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'
          }`}>
            <AlertCircle className="h-5 w-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className={cn("font-semibold border", getImpactStyle(recommendation.estImpact))}>
                {getImpactLabel(recommendation.estImpact)}
              </Badge>
              {recommendation.effort && (
                <span className="text-xs text-slate-400 font-medium">
                  {recommendation.effort < 3 ? "Quick Fix (5m)" : "Requires Effort (15m+)"}
                </span>
              )}
            </div>
            <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
              {recommendation.title}
            </h4>
            
            <CollapsibleContent className="mt-3 text-sm text-slate-600 leading-relaxed animate-accordion-down">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-3">
                <p>{recommendation.detailsMd || "No details provided."}</p>
              </div>
            </CollapsibleContent>
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600">
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
          </div>
        </div>

        <div className={cn(
          "bg-slate-50 px-5 py-3 border-t border-slate-100 flex justify-end gap-2 transition-all",
          !isOpen && "hidden group-hover:flex" 
        )}>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => updateStatus({ id: recommendation.id, status: 'snoozed' })}
            disabled={isPending}
            className="text-slate-500 hover:text-slate-700"
          >
            <Clock className="h-4 w-4 mr-2" />
            Snooze
          </Button>
          <Button 
            size="sm" 
            onClick={() => updateStatus({ id: recommendation.id, status: 'done' })}
            disabled={isPending}
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-200"
          >
            <Check className="h-4 w-4 mr-2" />
            Mark as Done
          </Button>
        </div>
      </Collapsible>
    </div>
  );
}
