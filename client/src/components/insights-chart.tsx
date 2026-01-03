import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Area, AreaChart } from "recharts";
import { format, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InsightDaily } from "@shared/schema";

interface InsightsChartProps {
  data: InsightDaily[];
  isLoading?: boolean;
}

export function InsightsChart({ data, isLoading }: InsightsChartProps) {
  if (isLoading) {
    return (
      <Card className="shadow-sm border-slate-200 h-[350px]">
        <CardHeader>
          <div className="h-6 w-48 bg-slate-100 rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full bg-slate-50 rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  // Sort data by date
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Format for chart
  const chartData = sortedData.map(item => ({
    date: format(new Date(item.date), "MMM d"),
    calls: item.calls,
    directions: item.directions,
    clicks: item.websiteClicks,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg text-xs">
          <p className="font-bold text-slate-900 mb-2">{label}</p>
          {payload.map((entry: any) => (
            <div key={entry.name} className="flex items-center gap-2 mb-1">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-slate-600 font-medium capitalize">{entry.name}:</span>
              <span className="font-bold text-slate-900">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold font-display text-slate-900">Performance Trends</CardTitle>
        <p className="text-sm text-slate-500">Actions taken on your profile over time</p>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorDirections" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#94a3b8' }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#94a3b8' }} 
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="calls" 
                name="Calls"
                stroke="#3b82f6" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorCalls)" 
              />
              <Area 
                type="monotone" 
                dataKey="directions" 
                name="Directions"
                stroke="#8b5cf6" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorDirections)" 
              />
              <Area 
                type="monotone" 
                dataKey="clicks" 
                name="Website Clicks"
                stroke="#10b981" 
                strokeWidth={3}
                fillOpacity={0} 
                fill="transparent" 
                strokeDasharray="5 5"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
