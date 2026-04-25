import { useState } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { useListTeams, useGetLiveMatches } from "@workspace/api-client-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, Trophy, Tv2 } from "lucide-react";
import TeamInsight from "./components/team-insight";

const queryClient = new QueryClient();

function LiveMatches() {
  const { data: liveData, isLoading } = useGetLiveMatches();

  if (isLoading) {
    return <div className="text-sm text-muted-foreground animate-pulse p-4">Loading live matches...</div>;
  }

  if (!liveData) return null;

  return (
    <div className="bg-card border-t py-4 px-4 sm:px-6 md:px-8 mt-auto">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-primary font-semibold">
          <Tv2 className="w-5 h-5" />
          <span>Live Cricket</span>
        </div>
        
        {!liveData.configured ? (
          <div className="text-sm text-muted-foreground italic">
            {liveData.message || "Cricket API key not configured. Add CRICKET_API_KEY to see live matches."}
          </div>
        ) : (
          <div className="flex flex-wrap gap-4 items-center text-sm overflow-x-auto pb-2 md:pb-0 scrollbar-hide w-full md:w-auto">
            {liveData.matches.length === 0 ? (
              <span className="text-muted-foreground">No live matches at the moment.</span>
            ) : (
              liveData.matches.slice(0, 5).map((match) => (
                <div key={match.id} className="flex items-center gap-2 bg-muted/50 rounded-full px-3 py-1 whitespace-nowrap">
                  <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                  <span className="font-medium">{match.teams.join(" vs ")}</span>
                  <span className="text-muted-foreground text-xs">{match.status}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Home() {
  const { data: teams, isLoading: isLoadingTeams } = useListTeams();
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");

  return (
    <div className="min-h-[100dvh] w-full flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <h1 className="text-lg md:text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              IPL Team Insight
            </h1>
          </div>
          
          <div className="w-full max-w-[200px] md:max-w-[280px]">
            <Select
              value={selectedTeamId}
              onValueChange={setSelectedTeamId}
              disabled={isLoadingTeams}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={isLoadingTeams ? "Loading teams..." : "Select a team"} />
              </SelectTrigger>
              <SelectContent>
                {teams?.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: team.primaryColor }}
                      />
                      <span>{team.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:px-6 md:px-8 py-8">
        {!selectedTeamId ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20 animate-in fade-in zoom-in duration-500">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <Trophy className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="space-y-2 max-w-md">
              <h2 className="text-2xl font-bold tracking-tight">Select a Franchise</h2>
              <p className="text-muted-foreground">
                Choose an IPL team from the dropdown above to view deep performance insights, historical stats, and top performers.
              </p>
            </div>
          </div>
        ) : (
          <TeamInsight teamId={selectedTeamId} />
        )}
      </main>

      {/* Footer / Live matches */}
      <LiveMatches />
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
