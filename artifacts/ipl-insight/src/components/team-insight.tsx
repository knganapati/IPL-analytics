import { useGetTeam, getGetTeamQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Trophy, Activity, MapPin, Calendar, User, UserCheck, Quote, ChevronUp, ChevronDown } from "lucide-react";
import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import { useEffect, useState } from "react";

interface TeamInsightProps {
  teamId: string;
}

// Simple counter animation hook
function useCounter(end: number, duration: number = 1000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutQuart
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeProgress * end));
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(end); // Ensure exact final value, especially for floats (though we floor here, so just use end)
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);

  return count;
}

function StatCard({ title, value, subtitle, suffix = "" }: { title: string, value: number, subtitle?: string, suffix?: string }) {
  const count = useCounter(value, 1500);
  return (
    <Card className="overflow-hidden bg-card/50 backdrop-blur-sm border-card-border/50 shadow-sm transition-all hover:shadow-md hover:bg-card">
      <CardContent className="p-6">
        <p className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">{title}</p>
        <div className="flex items-baseline gap-1">
          <h3 className="text-4xl font-bold tracking-tight text-foreground">
            {count}{suffix}
          </h3>
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-2">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function TeamInsight({ teamId }: TeamInsightProps) {
  const { data, isLoading, isError } = useGetTeam(teamId, {
    query: {
      enabled: !!teamId,
      queryKey: getGetTeamQueryKey(teamId),
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Header Skeleton */}
        <div className="relative overflow-hidden rounded-xl border bg-card p-8">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <Skeleton className="w-24 h-24 rounded-full" />
            <div className="space-y-3 flex-1">
              <Skeleton className="h-8 w-64" />
              <div className="flex gap-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[400px] rounded-xl" />
          <Skeleton className="h-[400px] rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="h-[400px] flex items-center justify-center text-destructive bg-destructive/10 rounded-xl border border-destructive/20 p-6 text-center">
        <div>
          <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold">Failed to load team insights</h3>
          <p className="text-sm opacity-80 mt-1">There was a problem fetching the data for this team.</p>
        </div>
      </div>
    );
  }

  const team = data.team;
  
  // Chart Data
  const pieData = [
    { name: "Wins", value: data.wins, color: team.primaryColor },
    { name: "Losses", value: data.losses, color: "hsl(var(--muted-foreground))" },
    ...(data.noResult > 0 ? [{ name: "No Result", value: data.noResult, color: "hsl(var(--border))" }] : [])
  ];

  return (
    <div className="space-y-8 pb-10 animate-in slide-in-from-bottom-4 fade-in duration-700">
      
      {/* Hero Header Strip */}
      <div className="relative overflow-hidden rounded-2xl border shadow-sm bg-card group">
        {/* Dynamic decorative gradient background using team color */}
        <div 
          className="absolute inset-0 opacity-10 dark:opacity-20 mix-blend-multiply transition-colors duration-1000"
          style={{ 
            background: `linear-gradient(135deg, ${team.primaryColor} 0%, transparent 60%, ${team.secondaryColor} 100%)` 
          }}
        />
        
        {/* Accent Top Bar */}
        <div 
          className="absolute top-0 left-0 right-0 h-2 transition-colors duration-1000"
          style={{ backgroundColor: team.primaryColor }}
        />

        <div className="relative p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center">
          <div 
            className="w-20 h-20 md:w-28 md:h-28 shrink-0 rounded-2xl shadow-inner flex items-center justify-center text-white text-3xl font-black tracking-tighter transition-colors duration-1000"
            style={{ 
              background: `linear-gradient(135deg, ${team.primaryColor}, ${team.secondaryColor})` 
            }}
          >
            {team.shortName}
          </div>

          <div className="flex-1 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">{team.name}</h2>
              {team.titles > 0 && (
                <Badge 
                  className="w-fit gap-1.5 px-3 py-1 font-semibold text-sm shadow-sm"
                  style={{ backgroundColor: team.primaryColor, color: "white" }}
                >
                  <Trophy className="w-4 h-4" />
                  {team.titles} Title{team.titles !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground font-medium">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" /> {team.homeCity} ({data.homeGround})
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" /> Est. {team.founded}
              </span>
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" /> Capt: <span className="text-foreground">{data.captain}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <UserCheck className="w-4 h-4" /> Coach: <span className="text-foreground">{data.coach}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Summary Pull-Quote */}
      {data.summary && (
        <Card className="border-l-4 rounded-xl bg-muted/30 overflow-hidden" style={{ borderLeftColor: team.primaryColor }}>
          <CardContent className="p-6 md:py-8 flex gap-4 md:gap-6 items-start">
            <Quote className="w-8 h-8 shrink-0 opacity-20" style={{ color: team.primaryColor }} />
            <p className="text-lg md:text-xl font-serif text-foreground/90 leading-relaxed italic">
              {data.summary}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Core Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Matches" value={data.matches} />
        <StatCard title="Wins" value={data.wins} />
        <StatCard title="Losses" value={data.losses} />
        <StatCard title="Win Rate" value={data.winPercentage} suffix="%" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Win/Loss Donut */}
        <Card className="overflow-hidden flex flex-col shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-muted-foreground" />
              Overall Performance
            </CardTitle>
            <CardDescription>Win/Loss distribution across all seasons</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center p-6 min-h-[300px]">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  animationDuration={1500}
                  animationEasing="ease-out"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))' }}
                  itemStyle={{ fontWeight: 600 }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Custom Legend inside absolute positioning for tighter layout */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-6 text-sm font-medium">
              {pieData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-muted-foreground">{entry.name}</span>
                  <span className="text-foreground">{entry.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Season Wins Bar Chart */}
        <Card className="overflow-hidden flex flex-col shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="w-5 h-5 text-muted-foreground" />
              Season-wise Wins
            </CardTitle>
            <CardDescription>Number of matches won per season</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pt-4 pb-6 min-h-[300px]">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.seasonWins} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="season" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} 
                />
                <RechartsTooltip
                  cursor={{ fill: 'hsl(var(--muted))' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))', fontWeight: 500 }}
                />
                <Bar 
                  dataKey="won" 
                  name="Matches Won" 
                  fill={team.primaryColor} 
                  radius={[4, 4, 0, 0]} 
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Top Batsman */}
        <Card className="shadow-sm overflow-hidden border-t-4" style={{ borderTopColor: team.primaryColor }}>
          <CardHeader className="bg-muted/30 pb-4">
            <div className="flex justify-between items-start">
              <div>
                <CardDescription className="uppercase tracking-wider font-semibold mb-1 text-xs">Top Batsman</CardDescription>
                <CardTitle className="text-2xl">{data.topBatsman.name}</CardTitle>
                <div className="text-sm text-muted-foreground mt-1">{data.topBatsman.role}</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-card shadow-sm flex items-center justify-center text-foreground border">
                🏏
              </div>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="p-0">
            <div className="grid grid-cols-3 divide-x divide-border">
              <div className="p-4 text-center">
                <div className="text-xs text-muted-foreground mb-1">Matches</div>
                <div className="text-xl font-bold">{data.topBatsman.matches}</div>
              </div>
              <div className="p-4 text-center bg-muted/10">
                <div className="text-xs text-muted-foreground mb-1">Runs</div>
                <div className="text-xl font-bold text-foreground" style={{ color: team.primaryColor }}>{data.topBatsman.runs ?? "—"}</div>
              </div>
              <div className="p-4 text-center">
                <div className="text-xs text-muted-foreground mb-1">Strike Rate</div>
                <div className="text-xl font-bold">{data.topBatsman.strikeRate ?? "—"}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Bowler */}
        <Card className="shadow-sm overflow-hidden border-t-4" style={{ borderTopColor: team.secondaryColor || team.primaryColor }}>
          <CardHeader className="bg-muted/30 pb-4">
            <div className="flex justify-between items-start">
              <div>
                <CardDescription className="uppercase tracking-wider font-semibold mb-1 text-xs">Top Bowler</CardDescription>
                <CardTitle className="text-2xl">{data.topBowler.name}</CardTitle>
                <div className="text-sm text-muted-foreground mt-1">{data.topBowler.role}</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-card shadow-sm flex items-center justify-center text-foreground border">
                🎯
              </div>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="p-0">
            <div className="grid grid-cols-3 divide-x divide-border">
              <div className="p-4 text-center">
                <div className="text-xs text-muted-foreground mb-1">Matches</div>
                <div className="text-xl font-bold">{data.topBowler.matches}</div>
              </div>
              <div className="p-4 text-center bg-muted/10">
                <div className="text-xs text-muted-foreground mb-1">Wickets</div>
                <div className="text-xl font-bold text-foreground" style={{ color: team.primaryColor }}>{data.topBowler.wickets ?? "—"}</div>
              </div>
              <div className="p-4 text-center">
                <div className="text-xs text-muted-foreground mb-1">Best Fig</div>
                <div className="text-xl font-bold">{data.topBowler.bestFigures ?? "—"}</div>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Extremes (Highest / Lowest Scores) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-center gap-4 bg-card border rounded-xl p-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
            <ChevronUp className="w-6 h-6 text-green-600 dark:text-green-500" />
          </div>
          <div>
            <div className="text-sm text-muted-foreground font-medium">Highest Score</div>
            <div className="text-lg font-bold">{data.highestScore}</div>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-card border rounded-xl p-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
            <ChevronDown className="w-6 h-6 text-red-600 dark:text-red-500" />
          </div>
          <div>
            <div className="text-sm text-muted-foreground font-medium">Lowest Score</div>
            <div className="text-lg font-bold">{data.lowestScore}</div>
          </div>
        </div>
      </div>

    </div>
  );
}
