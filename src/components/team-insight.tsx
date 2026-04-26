import { useEffect, useState, useMemo } from "react";
import { IPL_TEAMS } from "../data/teams";
import { buildSummary } from "../lib/build-summary";
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
  Home,
  Plane,
  Lightbulb,
  Users,
  Zap,
  Swords,
  Sparkles,
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
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  LabelList,
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

/* ---------- Custom chart tooltip ---------- */
function ChartTip({
  active,
  payload,
  label,
  formatter,
  insight,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name?: string; color?: string; dataKey?: string }>;
  label?: string | number;
  formatter?: (v: number, key?: string) => string;
  insight?: (p: Array<{ value: number; name?: string; dataKey?: string }>, label?: string | number) => string | null;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const insightText = insight ? insight(payload, label) : null;
  return (
    <div className="rounded-xl border border-white/15 bg-card/95 backdrop-blur-md px-3 py-2.5 shadow-2xl text-xs min-w-[160px]">
      {label !== undefined && (
        <div className="font-bold text-foreground mb-1.5">{label}</div>
      )}
      <div className="space-y-1">
        {payload.map((p, i) => (
          <div key={i} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
              <span className="text-muted-foreground">{p.name}</span>
            </div>
            <span className="font-bold tabular-nums">
              {formatter ? formatter(p.value, p.dataKey) : p.value}
            </span>
          </div>
        ))}
      </div>
      {insightText && (
        <div className="mt-2 pt-2 border-t border-white/10 text-[11px] text-accent flex gap-1.5 items-start">
          <Lightbulb className="w-3 h-3 mt-0.5 shrink-0" />
          <span className="italic leading-snug">{insightText}</span>
        </div>
      )}
    </div>
  );
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
  const data = useMemo(() => {
    const rawTeam = IPL_TEAMS.find((t) => t.id === teamId);
    if (!rawTeam) return null;

    const winPercentage =
      rawTeam.matches > 0
        ? Math.round((rawTeam.wins / rawTeam.matches) * 1000) / 10
        : 0;

    const headToHead = rawTeam.headToHead.map((h) => {
      const opp = IPL_TEAMS.find((t) => t.id === h.opponentId);
      return {
        opponentId: h.opponentId,
        opponentName: opp?.name ?? h.opponentId,
        opponentShortName: opp?.shortName ?? h.opponentId.toUpperCase(),
        opponentColor: opp?.primaryColor ?? "#888",
        wins: h.wins,
        losses: h.losses,
      };
    });

    return {
      team: rawTeam,
      matches: rawTeam.matches,
      wins: rawTeam.wins,
      losses: rawTeam.losses,
      noResult: rawTeam.noResult,
      winPercentage,
      highestScore: rawTeam.highestScore,
      lowestScore: rawTeam.lowestScore,
      topBatsman: rawTeam.topBatsman,
      topBowler: rawTeam.topBowler,
      seasonWins: rawTeam.seasonWins,
      summary: buildSummary(rawTeam as any),
      captain: rawTeam.captain,
      coach: rawTeam.coach,
      homeGround: rawTeam.homeGround,
      homeWinPct: rawTeam.homeWinPct,
      awayWinPct: rawTeam.awayWinPct,
      avgFirstInningsScore: rawTeam.avgFirstInningsScore,
      avgPowerplayScore: rawTeam.avgPowerplayScore,
      avgDeathOversRunRate: rawTeam.avgDeathOversRunRate,
      headToHead,
      keyPlayers2026: rawTeam.keyPlayers2026,
      strengths: rawTeam.strengths,
      funFacts: rawTeam.funFacts,
      decisionInsights: rawTeam.decisionInsights,
    };
  }, [teamId]);

  const isLoading = false;
  const isError = !data;

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
  const otherTeams = allTeams.filter((t) => t.id !== team.id);
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

  /* Recent form trend arrow */
  const trendDelta = recentWinPct - data.winPercentage;
  const trendUp = trendDelta > 2;
  const trendDown = trendDelta < -2;

  const pieData = [
    { name: "Wins", value: data.wins, color: team.primaryColor },
    { name: "Losses", value: data.losses, color: "#3a4060" },
    ...(data.noResult > 0
      ? [{ name: "No Result", value: data.noResult, color: "#5a6080" }]
      : []),
  ];

  /* Season win % derived series */
  const seasonWinPct = data.seasonWins.map((s) => ({
    season: s.season,
    won: s.won,
    played: s.played,
    pct: Math.round((s.won / Math.max(s.played, 1)) * 1000) / 10,
  }));

  /* Radar data — team strengths */
  const radarData = [
    { metric: "Batting", value: data.strengths.batting, full: 100 },
    { metric: "Bowling", value: data.strengths.bowling, full: 100 },
    { metric: "Powerplay", value: data.strengths.powerplay, full: 100 },
    { metric: "Death Overs", value: data.strengths.deathOvers, full: 100 },
    { metric: "Fielding", value: data.strengths.fielding, full: 100 },
  ];

  /* Home vs away */
  const homeAwayData = [
    { venue: "Home", winPct: data.homeWinPct, fill: team.primaryColor },
    { venue: "Away", winPct: data.awayWinPct, fill: "#5a6080" },
  ];

  /* Head to head sorted by total games */
  const h2hData = [...data.headToHead]
    .sort((a, b) => b.wins + b.losses - (a.wins + a.losses))
    .map((h) => ({
      name: h.opponentShortName,
      wins: h.wins,
      losses: h.losses,
      net: h.wins - h.losses,
      color: h.opponentColor,
    }));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* HERO */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10">
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(80% 100% at 0% 0%, ${team.primaryColor}55, transparent 60%), radial-gradient(80% 100% at 100% 100%, ${team.secondaryColor}55, transparent 60%), linear-gradient(135deg, ${team.primaryColor}22, ${team.secondaryColor}22)`,
          }}
        />
        <div className="absolute inset-0 bg-card/40 backdrop-blur-sm" />
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
            <div className="flex items-center gap-2 mb-3 flex-wrap">
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
              {trendUp && (
                <Badge variant="outline" className="border-green-500/40 bg-green-500/10 text-green-300 gap-1">
                  <TrendingUp className="w-3 h-3" /> Form rising
                </Badge>
              )}
              {trendDown && (
                <Badge variant="outline" className="border-red-500/40 bg-red-500/10 text-red-300 gap-1">
                  <TrendingDown className="w-3 h-3" /> Form dipping
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
              All-time Win Rate
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

      {/* SECONDARY METRIC RIBBON */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <MetricChip
          icon={<Home className="w-4 h-4" />}
          label="Home win %"
          value={`${data.homeWinPct.toFixed(1)}%`}
          accent={team.primaryColor}
        />
        <MetricChip
          icon={<Plane className="w-4 h-4" />}
          label="Away win %"
          value={`${data.awayWinPct.toFixed(1)}%`}
          accent="#5a6080"
        />
        <MetricChip
          icon={<BarChartIcon />}
          label="Avg 1st-inn score"
          value={`${data.avgFirstInningsScore}`}
          accent="#22d3ee"
        />
        <MetricChip
          icon={<Zap className="w-4 h-4" />}
          label="Powerplay avg"
          value={`${data.avgPowerplayScore}/6`}
          accent="#f59e0b"
        />
        <MetricChip
          icon={<Flame className="w-4 h-4" />}
          label="Death-over RR"
          value={`${data.avgDeathOversRunRate.toFixed(1)}`}
          accent="#f43f5e"
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

      {/* DECISION INSIGHTS BAND */}
      {data.decisionInsights.length > 0 && (
        <Card className="bg-gradient-to-br from-accent/10 to-primary/5 border-accent/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-accent" />
              Strategic insights
            </CardTitle>
            <CardDescription>What the numbers tell coaches, captains and fans</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {data.decisionInsights.map((ins, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-white/10 bg-card/40 p-4 text-sm leading-relaxed group hover:border-accent/30 transition-colors"
                  data-testid={`insight-${i}`}
                >
                  <div
                    className="w-8 h-8 rounded-lg bg-accent/15 text-accent flex items-center justify-center mb-2 font-black tabular-nums text-sm"
                  >
                    {i + 1}
                  </div>
                  <span className="text-foreground/85">{ins}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* TABS */}
      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="bg-white/5 border border-white/10 p-1 h-auto flex-wrap">
          <TabsTrigger value="performance" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary px-4 py-2">
            <BarTrendIcon className="w-4 h-4 mr-2" /> Performance
          </TabsTrigger>
          <TabsTrigger value="rivals" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary px-4 py-2">
            <Swords className="w-4 h-4 mr-2" /> Rivalries
          </TabsTrigger>
          <TabsTrigger value="players" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary px-4 py-2">
            <Users className="w-4 h-4 mr-2" /> Squad 2026
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
                <CardDescription>All seasons combined · hover for details</CardDescription>
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
                      content={
                        <ChartTip
                          formatter={(v) => `${v} matches`}
                          insight={(p) => {
                            const total = pieData.reduce((s, x) => s + x.value, 0);
                            const top = p[0];
                            const pct = ((top.value / total) * 100).toFixed(1);
                            return `${pct}% of all matches.`;
                          }}
                        />
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-[-20px]">
                  <div className="text-3xl font-black tabular-nums" style={{ color: team.primaryColor }}>
                    {data.winPercentage.toFixed(0)}%
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Win Rate
                  </div>
                </div>
                <div className="flex justify-center gap-4 text-xs mt-2 flex-wrap">
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

            {/* Radar — team strengths */}
            <Card className="lg:col-span-3 bg-card/60 backdrop-blur-sm border-white/10 overflow-hidden">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="w-4 h-4 text-muted-foreground" />
                  Team strengths
                </CardTitle>
                <CardDescription>Phase-of-play scoring · 0-100 scale · hover for context</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={radarData} outerRadius="78%">
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis
                      dataKey="metric"
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 100]}
                      tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                      stroke="hsl(var(--border))"
                    />
                    <Radar
                      name={team.shortName}
                      dataKey="value"
                      stroke={team.primaryColor}
                      fill={team.primaryColor}
                      fillOpacity={0.35}
                      animationDuration={1400}
                    />
                    <RechartsTooltip
                      content={
                        <ChartTip
                          formatter={(v) => `${v}/100`}
                          insight={(p) => {
                            const v = p[0]?.value ?? 0;
                            if (v >= 85) return "Elite — top-3 in the league.";
                            if (v >= 75) return "Strong — above league average.";
                            if (v >= 65) return "Solid — competitive but not elite.";
                            return "Below par — improvement priority.";
                          }}
                        />
                      }
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Season-by-season form */}
          <Card className="bg-card/60 backdrop-blur-sm border-white/10 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Trophy className="w-4 h-4 text-muted-foreground" />
                Season-by-season form
              </CardTitle>
              <CardDescription>Win % across the last {seasonWinPct.length} seasons</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={seasonWinPct} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
                    domain={[0, 100]}
                    unit="%"
                  />
                  <RechartsTooltip
                    content={
                      <ChartTip
                        formatter={(v, k) =>
                          k === "pct" ? `${v}%` : k === "won" ? `${v} wins` : `${v}`
                        }
                        insight={(p, label) => {
                          const pct = p.find((x) => x.dataKey === "pct")?.value ?? 0;
                          if (label === 2026) return "Season in progress.";
                          if (pct >= 65) return "Title-contender season.";
                          if (pct >= 50) return "Playoff-bound campaign.";
                          if (pct >= 40) return "Mid-table grind.";
                          return "Tough campaign — rebuilding year.";
                        }}
                      />
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="pct"
                    name="Win %"
                    stroke={team.primaryColor}
                    strokeWidth={2.5}
                    fill={`url(#grad-${team.id})`}
                    animationDuration={1400}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Home vs Away + Played-vs-Won bar chart */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <Card className="lg:col-span-2 bg-card/60 backdrop-blur-sm border-white/10 overflow-hidden">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Home className="w-4 h-4 text-muted-foreground" />
                  Home advantage
                </CardTitle>
                <CardDescription>
                  Win rate split — {(data.homeWinPct - data.awayWinPct).toFixed(1)} pts gap
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={homeAwayData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="venue"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      domain={[0, 100]}
                      unit="%"
                    />
                    <RechartsTooltip
                      cursor={{ fill: "hsl(var(--muted) / 0.3)" }}
                      content={
                        <ChartTip
                          formatter={(v) => `${v}%`}
                          insight={(p, label) => {
                            const v = p[0]?.value ?? 0;
                            if (label === "Home") {
                              if (v >= 60) return "Fortress — book home games as W column.";
                              if (v >= 50) return "Solid home record.";
                              return "Surprisingly weak at home — improvement target.";
                            }
                            if (v >= 50) return "Strong on the road — true title contender trait.";
                            return "Travel struggles — playoffs require road wins.";
                          }}
                        />
                      }
                    />
                    <Bar dataKey="winPct" radius={[8, 8, 0, 0]}>
                      {homeAwayData.map((d, i) => (
                        <Cell key={i} fill={d.fill} />
                      ))}
                      <LabelList
                        dataKey="winPct"
                        position="top"
                        formatter={(v: number) => `${v.toFixed(1)}%`}
                        style={{ fill: "hsl(var(--foreground))", fontSize: 11, fontWeight: 700 }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="lg:col-span-3 bg-card/60 backdrop-blur-sm border-white/10 overflow-hidden">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarTrendIcon className="w-4 h-4 text-muted-foreground" />
                  Played vs Won — by season
                </CardTitle>
                <CardDescription>
                  The gap shows where the team underperformed vs the maximum possible
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
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
                      content={
                        <ChartTip
                          formatter={(v) => `${v}`}
                          insight={(p, label) => {
                            const w = p.find((x) => x.dataKey === "won")?.value ?? 0;
                            const pl = p.find((x) => x.dataKey === "played")?.value ?? 0;
                            const pct = pl > 0 ? Math.round((w / pl) * 100) : 0;
                            return `Win rate: ${pct}%${label === 2026 ? " (in progress)" : ""}.`;
                          }}
                        />
                      }
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="played" name="Played" fill="#3a4060" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="won" name="Won" fill={team.primaryColor} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* RIVALS TAB */}
        <TabsContent value="rivals" className="mt-6 space-y-6">
          <Card className="bg-card/60 backdrop-blur-sm border-white/10 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Swords className="w-4 h-4 text-muted-foreground" />
                Head-to-head record
              </CardTitle>
              <CardDescription>
                All-time wins vs losses against every other franchise · hover any bar for the full breakdown
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={340}>
                <BarChart data={h2hData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <RechartsTooltip
                    cursor={{ fill: "hsl(var(--muted) / 0.3)" }}
                    content={
                      <ChartTip
                        formatter={(v) => `${v}`}
                        insight={(p) => {
                          const w = p.find((x) => x.dataKey === "wins")?.value ?? 0;
                          const l = p.find((x) => x.dataKey === "losses")?.value ?? 0;
                          const total = w + l;
                          if (total === 0) return null;
                          const pct = Math.round((w / total) * 100);
                          if (pct >= 60) return `Dominant matchup (${pct}% W).`;
                          if (pct >= 50) return `Slight edge (${pct}% W).`;
                          if (pct >= 40) return `Closely fought (${pct}% W).`;
                          return `Bogey opponent (${pct}% W).`;
                        }}
                      />
                    }
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="wins" name="Wins" fill={team.primaryColor} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="losses" name="Losses" fill="#3a4060" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Best & Worst matchup callouts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(() => {
              const withPct = h2hData
                .filter((h) => h.wins + h.losses > 0)
                .map((h) => ({ ...h, pct: h.wins / (h.wins + h.losses) }));
              const best = withPct.reduce((a, b) => (b.pct > a.pct ? b : a), withPct[0]);
              const worst = withPct.reduce((a, b) => (b.pct < a.pct ? b : a), withPct[0]);
              if (!best || !worst) return null;
              return (
                <>
                  <MatchupCallout
                    title="Favourite opponent"
                    icon={<Crown className="w-5 h-5" />}
                    name={best.name}
                    record={`${best.wins}W – ${best.losses}L`}
                    pct={Math.round(best.pct * 100)}
                    color="#22c55e"
                  />
                  <MatchupCallout
                    title="Bogey team"
                    icon={<Flame className="w-5 h-5" />}
                    name={worst.name}
                    record={`${worst.wins}W – ${worst.losses}L`}
                    pct={Math.round(worst.pct * 100)}
                    color="#ef4444"
                  />
                </>
              );
            })()}
          </div>
        </TabsContent>

        {/* SQUAD TAB */}
        <TabsContent value="players" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PerformerCard
              title="All-time top batsman"
              player={data.topBatsman}
              accent={team.primaryColor}
              variant="batsman"
            />
            <PerformerCard
              title="All-time top bowler"
              player={data.topBowler}
              accent={team.secondaryColor || team.primaryColor}
              variant="bowler"
            />
          </div>

          {data.keyPlayers2026.length > 0 && (
            <Card className="bg-card/60 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  Current squad — Season 2026
                </CardTitle>
                <CardDescription>
                  Key players in this season's roster · hover for analyst notes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {data.keyPlayers2026.map((p) => (
                    <div
                      key={p.name}
                      className="group rounded-xl border border-white/10 bg-white/[0.03] p-4 hover:border-white/30 hover:bg-white/[0.06] transition-all hover:-translate-y-0.5"
                      data-testid={`squad-${p.name.replace(/\s+/g, "-").toLowerCase()}`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center text-white font-black"
                          style={{ background: `linear-gradient(135deg, ${team.primaryColor}, ${team.secondaryColor})` }}
                        >
                          {p.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-sm truncate">{p.name}</div>
                          <div
                            className="text-[10px] uppercase tracking-wider mt-0.5"
                            style={{ color: team.primaryColor }}
                          >
                            {p.role}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1.5 leading-snug">
                            {p.note}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* RECORDS TAB */}
        <TabsContent value="records" className="mt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RecordTile
              icon={<TrendingUp className="w-7 h-7 text-green-400" />}
              ringColor="border-green-500/30 bg-green-500/15"
              label="Highest Score"
              value={data.highestScore}
              testId="record-highest"
            />
            <RecordTile
              icon={<TrendingDown className="w-7 h-7 text-red-400" />}
              ringColor="border-red-500/30 bg-red-500/15"
              label="Lowest Score"
              value={data.lowestScore}
              testId="record-lowest"
            />
          </div>

          {team.titles > 0 ? (
            <div className="rounded-2xl border border-yellow-400/30 bg-gradient-to-br from-yellow-500/15 to-amber-700/10 p-6 flex items-center gap-4">
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
                  {team.name}{" "}
                  {team.titles >= 4
                    ? "is one of the most decorated franchises in IPL history."
                    : team.titles >= 2
                      ? "has lifted the trophy multiple times."
                      : "has tasted championship glory."}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-sm p-6 flex items-center gap-4">
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

          {/* Fun facts for fans */}
          {data.funFacts.length > 0 && (
            <Card className="bg-card/60 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  Did you know?
                </CardTitle>
                <CardDescription>Fan-favourite facts about {team.shortName}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {data.funFacts.map((fact, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-snug"
                      data-testid={`fun-fact-${i}`}
                    >
                      <div className="text-2xl mb-2">{["🏏", "🔥", "🏆", "⭐", "🎯"][i % 5]}</div>
                      <span className="text-foreground/85">{fact}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
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
              <h3 className="text-xl font-black">Compare with other teams</h3>
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

/* ---------- subcomponents ---------- */
function MetricChip({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-card/50 backdrop-blur-sm px-3 py-2.5 flex items-center gap-3 hover:border-white/20 transition-colors">
      <div
        className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center"
        style={{ backgroundColor: `${accent}22`, color: accent }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground truncate">{label}</div>
        <div className="font-black text-base tabular-nums">{value}</div>
      </div>
    </div>
  );
}

function MatchupCallout({
  title,
  icon,
  name,
  record,
  pct,
  color,
}: {
  title: string;
  icon: React.ReactNode;
  name: string;
  record: string;
  pct: number;
  color: string;
}) {
  return (
    <div
      className="rounded-2xl border p-5 flex items-center gap-4"
      style={{
        backgroundColor: `${color}10`,
        borderColor: `${color}40`,
      }}
    >
      <div
        className="w-12 h-12 rounded-xl shrink-0 flex items-center justify-center"
        style={{ backgroundColor: `${color}25`, color }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] uppercase tracking-[0.18em] font-bold" style={{ color }}>
          {title}
        </div>
        <div className="text-xl font-black mt-0.5">vs {name}</div>
        <div className="text-xs text-muted-foreground mt-0.5">
          {record} · {pct}% win rate
        </div>
      </div>
    </div>
  );
}

function RecordTile({
  icon,
  ringColor,
  label,
  value,
  testId,
}: {
  icon: React.ReactNode;
  ringColor: string;
  label: string;
  value: string;
  testId: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-sm p-6 flex items-center gap-4">
      <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center shrink-0 ${ringColor}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </div>
        <div className="text-xl font-black mt-1 truncate" data-testid={testId}>
          {value}
        </div>
      </div>
    </div>
  );
}

function BarTrendIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 3v18h18" />
      <rect x="6" y="12" width="3" height="6" rx="1" />
      <rect x="11" y="8" width="3" height="10" rx="1" />
      <rect x="16" y="4" width="3" height="14" rx="1" />
    </svg>
  );
}

function BarChartIcon() {
  return <BarTrendIcon className="w-4 h-4" />;
}
