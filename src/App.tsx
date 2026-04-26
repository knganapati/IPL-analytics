import { useState, useMemo, useEffect } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { IPL_TEAMS } from "./data/teams";
import { Activity, Search, Trophy, Sparkles, BarChart3, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import TeamInsight from "./components/team-insight";

const queryClient = new QueryClient();

const HERO_BANNER = `${import.meta.env.BASE_URL}hero/ipl-banner.jpg`;
const resolveAsset = (p: string) => `${import.meta.env.BASE_URL}${p.replace(/^\//, "")}`;

function Header({
  selectedTeamId,
  onClear,
}: {
  selectedTeamId: string;
  onClear: () => void;
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-background/70 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <button
          onClick={onClear}
          className="flex items-center gap-2.5 group"
          data-testid="button-home"
        >
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <div className="font-black text-base leading-none gradient-text">IPL Insight</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-[0.18em] mt-0.5">
              Franchise Intelligence
            </div>
          </div>
        </button>

        <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground">
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          <span>10 franchises · 19 seasons · season 2026</span>
        </div>

        {selectedTeamId && (
          <button
            onClick={onClear}
            className="text-xs px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 transition-colors font-medium"
            data-testid="button-back-to-teams"
          >
            ← All Teams
          </button>
        )}
      </div>
    </header>
  );
}

function HeroSection({ totalTeams }: { totalTeams: number }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 mb-10">
      <div className="absolute inset-0">
        <img
          src={HERO_BANNER}
          alt="TATA IPL"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-transparent to-background/50" />
      </div>

      <div className="relative px-6 py-12 md:px-12 md:py-20">
        <div className="max-w-2xl">
          <Badge
            variant="outline"
            className="mb-4 px-3 py-1 border-primary/40 bg-primary/10 text-primary uppercase tracking-wider font-bold text-[10px]"
          >
            <Sparkles className="w-3 h-3 mr-1.5" />
            Season 2026 · Deep Insights
          </Badge>

          <h1 className="text-4xl md:text-6xl font-black leading-[1.05] tracking-tight mb-4">
            Every IPL franchise.
            <br />
            <span className="gradient-text">One dashboard.</span>
          </h1>

          <p className="text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed">
            Pick a team to dive into 19 seasons of stats — championship history, season-by-season form,
            head-to-head rivalries, current 2026 squads, and the strategic insights behind every cup run.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center">
                <Trophy className="w-4 h-4 text-accent" />
              </div>
              <div>
                <div className="font-bold leading-tight">{totalTeams} franchises</div>
                <div className="text-xs text-muted-foreground">covered in depth</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="font-bold leading-tight">19 seasons</div>
                <div className="text-xs text-muted-foreground">of historical data</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center">
                <Users className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="font-bold leading-tight">2026 squads</div>
                <div className="text-xs text-muted-foreground">current rosters</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type TeamCardData = {
  id: string;
  name: string;
  shortName: string;
  primaryColor: string;
  secondaryColor: string;
  homeCity: string;
  founded: number;
  titles: number;
  logoUrl: string;
};

function TeamCard({ team, onClick }: { team: TeamCardData; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl border border-white/10 hover:border-white/30 transition-all duration-300 text-left hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/20"
      data-testid={`card-team-${team.id}`}
    >
      <div
        className="absolute inset-0 opacity-90 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `linear-gradient(135deg, ${team.primaryColor} 0%, ${team.secondaryColor} 100%)`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500"
        style={{ background: "linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.4) 50%, transparent 60%)" }}
      />

      <div className="relative p-5 h-[210px] flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <img
            src={resolveAsset(team.logoUrl)}
            alt={`${team.name} logo`}
            className="w-16 h-16 object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-300"
            loading="lazy"
          />
          {team.titles > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/40 backdrop-blur-sm border border-white/20">
              <Trophy className="w-3 h-3 text-yellow-400" />
              <span className="text-xs font-bold text-white">{team.titles}</span>
            </div>
          )}
        </div>

        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">
            {team.shortName} · Est. {team.founded}
          </div>
          <div className="text-xl font-black text-white leading-tight mt-1 drop-shadow-lg">
            {team.name}
          </div>
          <div className="text-xs text-white/80 mt-1">{team.homeCity}</div>

          {/* Hover reveal: prompt */}
          <div className="mt-2 max-h-0 group-hover:max-h-12 overflow-hidden transition-all duration-300 opacity-0 group-hover:opacity-100">
            <div className="text-[11px] font-bold uppercase tracking-wider text-white inline-flex items-center gap-1">
              View deep insights
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

function TeamGrid({
  teams,
  isLoading,
  onSelect,
}: {
  teams: TeamCardData[] | undefined;
  isLoading: boolean;
  onSelect: (id: string) => void;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!teams) return [];
    const q = query.trim().toLowerCase();
    if (!q) return teams;
    return teams.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.shortName.toLowerCase().includes(q) ||
        t.homeCity.toLowerCase().includes(q),
    );
  }, [teams, query]);

  return (
    <section>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-1.5">
            Step 1 · Choose your team
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">
            All 10 IPL franchises
          </h2>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or city..."
            className="pl-9 bg-white/5 border-white/10"
            data-testid="input-team-search"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="h-[210px] rounded-2xl bg-white/5 border border-white/10 animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border border-dashed border-white/10 rounded-2xl">
          No teams matched "{query}"
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((team) => (
            <TeamCard key={team.id} team={team} onClick={() => onSelect(team.id)} />
          ))}
        </div>
      )}
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5 bg-card/30 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Activity className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-semibold text-foreground/80">IPL Insight</span>
          <span className="opacity-60">— deep franchise intelligence for fans, analysts and decision-makers.</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="opacity-70">Data current through 2026 season</span>
          <span className="opacity-30">•</span>
          <span className="opacity-70">Built with React + Vite + Recharts</span>
        </div>
      </div>
    </footer>
  );
}

function readHashTeam(): string {
  if (typeof window === "undefined") return "";
  const h = window.location.hash.replace(/^#\/?team\//, "");
  return h && /^[a-z]+$/i.test(h) ? h.toLowerCase() : "";
}

function Home() {
  const teams = useMemo(() => IPL_TEAMS.map(t => ({ ...t, logoUrl: `teams/${t.id}.png` })), []);
  const isLoading = false;
  const [selectedTeamId, setSelectedTeamIdRaw] = useState<string>(readHashTeam());

  // Listen for back/forward navigation
  useEffect(() => {
    const onHash = () => setSelectedTeamIdRaw(readHashTeam());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const setSelectedTeamId = (id: string) => {
    setSelectedTeamIdRaw(id);
    if (typeof window !== "undefined") {
      const next = id ? `#/team/${id}` : "";
      if (window.location.hash !== next) {
        history.replaceState(null, "", `${window.location.pathname}${window.location.search}${next}`);
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <Header selectedTeamId={selectedTeamId} onClear={() => setSelectedTeamId("")} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {!selectedTeamId ? (
          <div className="animate-in fade-in duration-500">
            <HeroSection totalTeams={teams?.length ?? 10} />
            <TeamGrid
              teams={teams as TeamCardData[] | undefined}
              isLoading={isLoading}
              onSelect={setSelectedTeamId}
            />
          </div>
        ) : (
          <TeamInsight
            teamId={selectedTeamId}
            onChangeTeam={setSelectedTeamId}
            allTeams={(teams ?? []) as TeamCardData[]}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
