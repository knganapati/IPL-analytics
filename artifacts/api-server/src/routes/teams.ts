import { Router, type IRouter } from "express";
import {
  ListTeamsResponse,
  GetTeamResponse,
  GetTeamParams,
} from "@workspace/api-zod";
import { IPL_TEAMS, findTeam } from "../data/iplTeams";
import { buildSummary } from "../data/buildSummary";

const router: IRouter = Router();

function teamLogoUrl(id: string): string {
  return `teams/${id}.png`;
}

router.get("/teams", (_req, res) => {
  const summaries = IPL_TEAMS.map((t) => ({
    id: t.id,
    name: t.name,
    shortName: t.shortName,
    primaryColor: t.primaryColor,
    secondaryColor: t.secondaryColor,
    homeCity: t.homeCity,
    founded: t.founded,
    titles: t.titles,
    logoUrl: teamLogoUrl(t.id),
  }));
  const data = ListTeamsResponse.parse(summaries);
  res.json(data);
});

router.get("/teams/:teamId", (req, res) => {
  const params = GetTeamParams.parse(req.params);
  const team = findTeam(params.teamId);

  if (!team) {
    res.status(404).json({
      error: "team_not_found",
      message: `No IPL team found with id "${params.teamId}".`,
    });
    return;
  }

  const winPercentage =
    team.matches > 0
      ? Math.round((team.wins / team.matches) * 1000) / 10
      : 0;

  // Enrich head-to-head with opponent metadata for the chart
  const headToHead = team.headToHead.map((h) => {
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

  const insight = {
    team: {
      id: team.id,
      name: team.name,
      shortName: team.shortName,
      primaryColor: team.primaryColor,
      secondaryColor: team.secondaryColor,
      homeCity: team.homeCity,
      founded: team.founded,
      titles: team.titles,
      logoUrl: teamLogoUrl(team.id),
    },
    matches: team.matches,
    wins: team.wins,
    losses: team.losses,
    noResult: team.noResult,
    winPercentage,
    highestScore: team.highestScore,
    lowestScore: team.lowestScore,
    topBatsman: team.topBatsman,
    topBowler: team.topBowler,
    seasonWins: team.seasonWins,
    summary: buildSummary(team),
    captain: team.captain,
    coach: team.coach,
    homeGround: team.homeGround,
    homeWinPct: team.homeWinPct,
    awayWinPct: team.awayWinPct,
    avgFirstInningsScore: team.avgFirstInningsScore,
    avgPowerplayScore: team.avgPowerplayScore,
    avgDeathOversRunRate: team.avgDeathOversRunRate,
    headToHead,
    keyPlayers2026: team.keyPlayers2026,
    strengths: team.strengths,
    funFacts: team.funFacts,
    decisionInsights: team.decisionInsights,
  };

  const data = GetTeamResponse.parse(insight);
  res.json(data);
});

export default router;
