import type { Team } from "../data/teams";

/**
 * Logic-based 2-3 line performance summary.
 * Deterministic, zero-cost, reflects current 2026 standings.
 */
export function buildSummary(team: Team): string {
  const winPct = (team.wins / Math.max(team.matches, 1)) * 100;
  const sorted = [...team.seasonWins].sort((a, b) => b.season - a.season);
  const recent = sorted.slice(0, 3);
  const recentWinPct =
    recent.length > 0
      ? (recent.reduce((s, r) => s + r.won, 0) /
          Math.max(
            recent.reduce((s, r) => s + r.played, 0),
            1,
          )) *
        100
      : winPct;

  let tier: string;
  if (winPct >= 55) tier = "one of the league's most consistent sides";
  else if (winPct >= 50) tier = "a slightly above-average performer overall";
  else if (winPct >= 45) tier = "a roughly even-money side across seasons";
  else tier = "a side that has historically struggled to convert form into wins";

  const titleLine =
    team.titles >= 4
      ? `${team.titles} IPL titles to their name place them in the league's pantheon.`
      : team.titles >= 1
        ? `With ${team.titles} title${team.titles > 1 ? "s" : ""} in the cabinet, they have tasted championship success.`
        : `They are still chasing that elusive maiden IPL trophy.`;

  let trendLine: string;
  if (recentWinPct - winPct >= 5) {
    trendLine = `Their last three campaigns show clear upward momentum — winning at a higher rate than their all-time average.`;
  } else if (recentWinPct - winPct <= -5) {
    trendLine = `Their last three campaigns suggest a dip in form, underperforming the long-term average.`;
  } else {
    trendLine = `Recent form has tracked their long-term average closely, suggesting a settled — if unspectacular — trajectory.`;
  }

  const stars = `${team.topBatsman.name} (${team.topBatsman.runs ?? "—"} runs) and ${team.topBowler.name} (${team.topBowler.wickets ?? "—"} wickets) headline their record book.`;

  return `${team.name} have played ${team.matches} matches and won ${team.wins} (${winPct.toFixed(1)}%), making them ${tier}. ${titleLine} ${trendLine} ${stars}`;
}
