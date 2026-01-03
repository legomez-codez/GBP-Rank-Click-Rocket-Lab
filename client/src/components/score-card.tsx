import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Info } from "lucide-react";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface ScoreCardProps {
  score: number;
  subScores: {
    profile: number;
    content: number;
    reputation: number;
    engagement: number;
  };
  isLoading?: boolean;
}

export function ScoreCard({ score, subScores, isLoading }: ScoreCardProps) {
  if (isLoading) {
    return (
      <div className="h-[280px] bg-white rounded-2xl p-6 shadow-sm border border-slate-200 animate-pulse">
        <div className="h-8 w-32 bg-slate-100 rounded mb-8" />
        <div className="flex items-center justify-between">
          <div className="h-24 w-24 bg-slate-100 rounded-full" />
          <div className="space-y-4 flex-1 ml-12">
            <div className="h-4 w-full bg-slate-100 rounded" />
            <div className="h-4 w-3/4 bg-slate-100 rounded" />
            <div className="h-4 w-1/2 bg-slate-100 rounded" />
          </div>
        </div>
      </div>
    );
  }

  // Calculate color based on score
  const getScoreColor = (val: number) => {
    if (val >= 80) return "text-emerald-500 stroke-emerald-500";
    if (val >= 60) return "text-amber-500 stroke-amber-500";
    return "text-red-500 stroke-red-500";
  };

  const getProgressColor = (val: number) => {
    if (val >= 80) return "bg-emerald-500";
    if (val >= 60) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute -top-12 -right-12 h-40 w-40 bg-blue-50 rounded-full blur-3xl opacity-60 pointer-events-none" />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 font-display">Profile Health Score</h3>
          <p className="text-sm text-slate-500">Overall optimization status</p>
        </div>
        <Tooltip>
          <TooltipTrigger>
            <Info className="h-4 w-4 text-slate-400" />
          </TooltipTrigger>
          <TooltipContent>
            Your score is calculated based on profile completeness, activity, reviews, and engagement metrics.
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-8">
        {/* Main circular score */}
        <div className="relative flex items-center justify-center h-32 w-32 shrink-0">
          <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
            <circle
              className="text-slate-100 stroke-current"
              strokeWidth="8"
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
            />
            <motion.circle
              className={`${getScoreColor(score)} transition-all duration-1000 ease-out`}
              strokeWidth="8"
              strokeLinecap="round"
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: score / 100 }}
              strokeDasharray="251.2"
              strokeDashoffset="0"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className={`text-3xl font-bold font-display ${getScoreColor(score).replace('stroke-', '')}`}>
              {score}
            </span>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Score</span>
          </div>
        </div>

        {/* Sub-scores grid */}
        <div className="flex-1 w-full grid grid-cols-2 gap-x-8 gap-y-6">
          {[
            { label: "Profile Completeness", val: subScores.profile },
            { label: "Content Frequency", val: subScores.content },
            { label: "Reputation", val: subScores.reputation },
            { label: "Engagement", val: subScores.engagement },
          ].map((item) => (
            <div key={item.label} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 font-medium">{item.label}</span>
                <span className="font-bold text-slate-900">{item.val}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  className={`h-full rounded-full ${getProgressColor(item.val)}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${item.val}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
