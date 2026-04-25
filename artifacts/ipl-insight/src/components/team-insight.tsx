import { useEffect, useState } from "react";
import { useGetTeam, getGetTeamQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy,
  Activity,
  MapPin,
  Calendar,
  User,
  UserCheck,
  Quote,
  TrendingUp,
  TrendingDown,
  Crown,
  Target,
  Flame,
  Award,
  ChevronRight,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid,
  AreaChart,
  Area,
  Legend,
} from "recharts";

const resolveAsset = (p: string) => `${import.meta.env.BASE_URL}${p.replace(/^\//, "")}`;

interface TeamCardData {
  id: string;
  name: string;
  shortName: string;
  primaryColor: string;
  secondaryColor: string;
  homeCity: string;
  founded: number;
  titles: number;
  logoUrl: string;
}

interface TeamInsightProps {
  teamId: string;
  onChangeTeam: (id: string) => void;
  allTeams: TeamCardData[];
}

/* ---------- helpers ---------- */
function useCounter(end: number, duration = 1500) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    let raf = 0;
    const step = (ts: number) => {
      if (start === null) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 4);
      setCount(end * ease);
      if (p < 1) raf = window.requestAnimationFrame(step);
      else setCount(end);
    };
    raf = window.requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [end, duration]);
  return count;
}

function StatTile({
  label,
  value,
  suffix = "",
  accent,
  icon,
  hint,
}: {
  label: string;
  value: number;
  suffix?: string;
  accent: string;
  icon: React.ReactNode;
  hint?: string;
}) {
  const animated = useCounter(value);
  const display = suffix === "%" ? animated.toFixed(1) : Math.floor(animated).toLocaleString();
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-card/60 backdrop-blur-sm p-5 transition-all hover:border-white/20 hover:-translate-y-0.5"
      data-testid={`stat-tile-${label.toLowerCase().replace(/\s/g, "-")}`}
    >
      <div
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-20 blur-2xl"
        style={{ backgroundColor: accent }}
      />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            {label}
          </span>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${accent}22`, color: accent }}
          >
            {icon}
          </div>
        </div>
        <div className="text-3xl md:text-4xl font-black tracking-tight tabular-nums">
          {display}
          {suffix}
        </div>
        {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
      </div>
    </div>
  );
}

function PerformerCard({
  title,
  player,
  accent,
  variant,
}: {
  title: string;
  player: {
    name: string;
    role: string;
    matches: number;
    runs?: number | null;
    average?: number | null;
    strikeRate?: number | null;
    wickets?: number | null;
    economy?: number | null;
    bestFigures?: string | null;
  };
  accent: string;
  variant: "batsman" | "bowler";
}) {
  const stats =
    variant === "batsman"
      ? [
          { label: "Matches", value: player.matches },
          { label: "Runs", value: player.runs ?? "—", emphasised: true },
          { label: "Average", value: player.average ?? "—" },
          { label: "S/R", value: player.strikeRate ?? "—" },
        ]
      : [
          { label: "Matches", value: player.matches },
          { label: "Wickets", value: player.wickets ?? "—", emphasised: true },
          { label: "Economy", value: player.economy ?? "—" },
          { label: "Best", value: player.bestFigures ?? "—" },
        ];

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-card/60 backdrop-blur-sm"
      data-testid={`performer-${variant}`}
    >
      <div
        className="absolute inset-x-0 top-0 h-1.5"
        style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }}
      />
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground mb-1">
              {title}
            </div>
            <div className="text-2xl font-black leading-tight">{player.name}</div>
            <div className="text-xs text-muted-foreground mt-1">{player.role}</div>
          </div>
          <div
            className="w-12 h-12 shrink-0 rounded-xl flex items-center justify-center text-white shadow-lg"
            style={{ background: `linear-gradient(135deg, ${accent}, ${accent}AA)` }}
          >
            {variant === "batsman" ? (
              <Crown className="w-6 h-6" />
            ) : (
              <Target className="w-6 h-6" />
            )}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {stats.map((s) => (
            <div
              key={s.label}
              className="px-2 py-2.5 rounded-lg bg-white/5 text-center"
            >
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {s.label}
              </div>
              <div
                className="text-base font-bold tabular-nums mt-0.5"
                style={s.emphasised ? { color: accent } : undefined}
              >
                {s.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Main component ---------- */
export default function TeamInsight({ teamId, onChangeTeam, allTeams }: TeamInsightProps) {
  const { data, isLoading, isError } = useGetTeam(teamId, {
    query: {
      enabled: !!teamId,
      queryKey: getGetTeamQueryKey(teamId),
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        <Skeleton className="h-72 rounded-3xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-10 text-center">
        <Activity className="w-10 h-10 mx-auto mb-3 text-destructive" />
        <h3 className="text-lg font-bold">Could not load team insights</h3>
        <p className="text-sm text-muted-foreground mt-1">
          The server didn't return data for this team. Try picking another franchise.
        </p>
      </div>
    );
  }

  const team = data.team;
  const otherTeams = allTeams.filter((t) => t.id !== team.id).slice(0, 6);
  const recentSeasons = data.seasonWins;
  const recentForm = recentSeasons.slice(-3);
  const recentWinPct =
    recentForm.length > 0
      ? Math.round(
          (recentForm.reduce((s, x) => s + x.won, 0) /
            recentForm.reduce((s, x) => s + x.played, 0)) *
            1000,
        ) / 10
      : 0;

  const pieData = [
    { name: "Wins", value: data.wins, color: team.primaryColor },
    { name: "Losses", value: data.losses, color: "#3a4060" },
    ...(data.noResult > 0
      ? [{ name: "No Result", value: data.noResult, color: "#5a6080" }]
      : []),
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* HERO */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10">
        {/* Color background */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(80% 100% at 0% 0%, ${team.primaryColor}55, transparent 60%), radial-gradient(80% 100% at 100% 100%, ${team.secondaryColor}55, transparent 60%), linear-gradient(135deg, ${team.primaryColor}22, ${team.secondaryColor}22)`,
          }}
        />
        <div className="absolute inset-0 bg-card/40 backdrop-blur-sm" />
        {/* Decorative grid */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative p-6 md:p-10 flex flex-col md:flex-row gap-6 md:gap-10 items-start md:items-center">
          {/* Logo */}
          <div className="relative shrink-0">
            <div
              className="absolute inset-0 rounded-3xl blur-2xl opacity-40"
              style={{ backgroundColor: team.primaryColor }}
            />
            <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-3xl bg-white/95 p-3 shadow-2xl flex items-center justify-center floaty">
              <img
                src={resolveAsset(team.logoUrl)}
                alt={`${team.name} logo`}
                className="w-full h-full object-contain"
                data-testid="hero-team-logo"
              />
            </div>
          </div>

          {/* Identity */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Badge
                className="font-bold uppercase tracking-wider text-[10px] border-0"
                style={{ backgroundColor: team.primaryColor, color: "#fff" }}
              >
                {team.shortName}
              </Badge>
              {team.titles > 0 && (
                <Badge
                  variant="outline"
                  className="border-yellow-400/50 bg-yellow-400/10 text-yellow-300 font-bold gap-1"
                >
                  <Trophy className="w-3 h-3" />
                  {team.titles} IPL Title{team.titles !== 1 ? "s" : ""}
                </Badge>
              )}
            </div>

            <h2
              className="text-3xl md:text-5xl font-black tracking-tight leading-[1.05] mb-3"
              data-testid="hero-team-name"
            >
              {team.name}
            </h2>

            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                <span className="text-foreground/80">{team.homeCity}</span>
                <span className="text-muted-foreground/70">· {data.homeGround}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                Est. <span className="text-foreground/80">{team.founded}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                Captain: <span className="text-foreground/80">{data.captain}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <UserCheck className="w-4 h-4" />
                Coach: <span className="text-foreground/80">{data.coach}</span>
              </span>
            </div>
          </div>

          {/* Win % big number */}
          <div className="hidden md:flex flex-col items-end shrink-0">
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
              Win Rate
            </div>
            <div
              className="text-6xl font-black tabular-nums leading-none"
              style={{ color: team.primaryColor }}
            >
              {data.winPercentage.toFixed(1)}
              <span className="text-3xl">%</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              over {data.matches} matches
            </div>
          </div>
        </div>
      </div>

      {/* STAT TILES */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatTile
          label="Matches"
          value={data.matches}
          accent={team.primaryColor}
          icon={<Activity className="w-4 h-4" />}
          hint="all-time IPL games"
        />
        <StatTile
          label="Wins"
          value={data.wins}
          accent="#22c55e"
          icon={<TrendingUp className="w-4 h-4" />}
          hint="career victories"
        />
        <StatTile
          label="Losses"
          value={data.losses}
          accent="#ef4444"
          icon={<TrendingDown className="w-4 h-4" />}
          hint="defeats so far"
        />
        <StatTile
          label="Win Rate"
          value={data.winPercentage}
          suffix="%"
          accent={team.secondaryColor || team.primaryColor}
          icon={<Award className="w-4 h-4" />}
          hint={`recent 3 seasons: ${recentWinPct}%`}
        />
      </div>

      {/* SUMMARY QUOTE */}
      {data.summary && (
        <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm p-6 md:p-8 overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 w-1.5"
            style={{ background: `linear-gradient(180deg, ${team.primaryColor}, ${team.secondaryColor})` }}
          />
          <div className="flex gap-4">
            <Quote className="w-8 h-8 shrink-0 text-primary opacity-50" />
            <p
              className="text-lg md:text-xl font-serif italic leading-relaxed text-foreground/90"
              data-testid="text-team-summary"
            >
              {data.summary}
            </p>
          </div>
        </div>
      )}

      {/* TABS */}
      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="bg-white/5 border border-white/10 p-1 h-auto">
          <TabsTrigger value="performance" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary px-4 py-2">
            <BarTrendIcon className="w-4 h-4 mr-2" /> Performance
          </TabsTrigger>
          <TabsTrigger value="players" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary px-4 py-2">
            <Crown className="w-4 h-4 mr-2" /> Top Players
          </TabsTrigger>
          <TabsTrigger value="records" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary px-4 py-2">
            <Flame className="w-4 h-4 mr-2" /> Records
          </TabsTrigger>
        </TabsList>

        {/* PERFORMANCE TAB */}
        <TabsContent value="performance" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Donut */}
            <Card className="lg:col-span-2 bg-card/60 backdrop-blur-sm border-white/10 overflow-hidden">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="w-4 h-4 text-muted-foreground" />
                  Win / Loss Split
                </CardTitle>
                <CardDescription>All seasons combined</CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                      animationDuration={1200}
                      stroke="none"
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{
                        borderRadius: 8,
                        border: "1px solid hsl(var(--border))",
                        background: "hsl(var(--card))",
                        color: "hsl(var(--foreground))",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-[-20px]">
                  <div className="text-3xl font-black tabular-nums" style={{ color: team.primaryColor }}>
                    {data.winPercentage.toFixed(0)}%
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Win Rate
                  </div>
                </div>
                <div className="flex justify-center gap-4 text-xs mt-2">
                  {pieData.map((p) => (
                    <div key={p.name} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                      <span className="text-muted-foreground">{p.name}</span>
                      <span className="font-bold">{p.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Season trend */}
            <Card className="lg:col-span-3 bg-card/60 backdrop-blur-sm border-white/10 overflow-hidden">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-muted-foreground" />
                  Season-by-season form
                </CardTitle>
                <CardDescription>Wins per season — last {data.seasonWins.length} years</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={data.seasonWins} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id={`grad-${team.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={team.primaryColor} stopOpacity={0.6} />
                        <stop offset="95%" stopColor={team.primaryColor} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="season"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      dy={6}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        borderRadius: 8,
                        border: "1px solid hsl(var(--border))",
                        background: "hsl(var(--card))",
                        color: "hsl(var(--foreground))",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="won"
                      name="Wins"
                      stroke={team.primaryColor}
                      strokeWidth={2.5}
                      fill={`url(#grad-${team.id})`}
                      animationDuration={1400}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Played vs Won bar chart */}
          <Card className="bg-card/60 backdrop-blur-sm border-white/10 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarTrendIcon className="w-4 h-4 text-muted-foreground" />
                Played vs Won — season comparison
              </CardTitle>
              <CardDescription>
                The gap shows where the team underperformed vs the maximum possible
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.seasonWins} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="season"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <RechartsTooltip
                    cursor={{ fill: "hsl(var(--muted) / 0.3)" }}
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid hsl(var(--border))",
                      background: "hsl(var(--card))",
                      color: "hsl(var(--foreground))",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="played" name="Played" fill="#3a4060" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="won" name="Won" fill={team.primaryColor} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PLAYERS TAB */}
        <TabsContent value="players" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PerformerCard
              title="Top Batsman"
              player={data.topBatsman}
              accent={team.primaryColor}
              variant="batsman"
            />
            <PerformerCard
              title="Top Bowler"
              player={data.topBowler}
              accent={team.secondaryColor || team.primaryColor}
              variant="bowler"
            />
          </div>
        </TabsContent>

        {/* RECORDS TAB */}
        <TabsContent value="records" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-sm p-6 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-green-500/15 border border-green-500/30 flex items-center justify-center shrink-0">
                <TrendingUp className="w-7 h-7 text-green-400" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  Highest Score
                </div>
                <div className="text-xl font-black mt-1 truncate" data-testid="record-highest">
                  {data.highestScore}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-sm p-6 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center shrink-0">
                <TrendingDown className="w-7 h-7 text-red-400" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  Lowest Score
                </div>
                <div className="text-xl font-black mt-1 truncate" data-testid="record-lowest">
                  {data.lowestScore}
                </div>
              </div>
            </div>

            {team.titles > 0 ? (
              <div className="md:col-span-2 rounded-2xl border border-yellow-400/30 bg-gradient-to-br from-yellow-500/15 to-amber-700/10 p-6 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-yellow-400/20 border border-yellow-400/40 flex items-center justify-center shrink-0">
                  <Trophy className="w-7 h-7 text-yellow-300" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-yellow-300/80">
                    IPL Trophy Cabinet
                  </div>
                  <div className="text-xl font-black mt-1">
                    {team.titles} championship{team.titles !== 1 ? "s" : ""}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {team.name} {team.titles >= 4 ? "is one of the most decorated franchises in IPL history." : team.titles >= 2 ? "has lifted the trophy multiple times." : "has tasted championship glory."}
                  </div>
                </div>
              </div>
            ) : (
              <div className="md:col-span-2 rounded-2xl border border-white/10 bg-card/60 backdrop-blur-sm p-6 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <Trophy className="w-7 h-7 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    IPL Trophy Cabinet
                  </div>
                  <div className="text-xl font-black mt-1">Still hunting the trophy</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {team.name} is yet to lift its first IPL title — every season is the year.
                  </div>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* OTHER TEAMS RAIL */}
      {otherTeams.length > 0 && (
        <div className="pt-4">
          <div className="flex items-end justify-between mb-4">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Switch franchise
              </div>
              <h3 className="text-xl font-black">Other teams</h3>
            </div>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {otherTeams.map((t) => (
              <button
                key={t.id}
                onClick={() => onChangeTeam(t.id)}
                className="group relative shrink-0 w-44 rounded-2xl border border-white/10 hover:border-white/30 overflow-hidden transition-all hover:-translate-y-0.5"
                data-testid={`switch-team-${t.id}`}
              >
                <div
                  className="absolute inset-0 opacity-90"
                  style={{ background: `linear-gradient(135deg, ${t.primaryColor}, ${t.secondaryColor})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="relative p-3 h-32 flex flex-col justify-between">
                  <img
                    src={resolveAsset(t.logoUrl)}
                    alt={t.name}
                    className="w-10 h-10 object-contain drop-shadow-lg"
                    loading="lazy"
                  />
                  <div>
                    <div className="text-[10px] font-bold uppercase text-white/70 tracking-wider">{t.shortName}</div>
                    <div className="text-sm font-black text-white leading-tight line-clamp-2">{t.name}</div>
                  </div>
                  <ChevronRight className="absolute top-3 right-3 w-4 h-4 text-white/60 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* Small inline icon to avoid an extra import */
function BarTrendIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 3v18h18" />
      <rect x="6" y="12" width="3" height="6" rx="1" />
      <rect x="11" y="8" width="3" height="10" rx="1" />
      <rect x="16" y="4" width="3" height="14" rx="1" />
    </svg>
  );
}
