import { Router, type IRouter } from "express";
import { GetLiveMatchesResponse } from "@workspace/api-zod";
import { logger } from "../lib/logger";

const router: IRouter = Router();

interface CricketDataMatch {
  id: string;
  name: string;
  matchType?: string;
  status: string;
  venue?: string;
  date?: string;
  teams?: string[];
}

interface CricketDataResponse {
  status?: string;
  data?: CricketDataMatch[];
}

let cache:
  | { ts: number; payload: ReturnType<typeof GetLiveMatchesResponse.parse> }
  | null = null;

const CACHE_TTL_MS = 60 * 1000; // 1 minute — protect the 100 hits/day quota

router.get("/live", async (_req, res) => {
  const apiKey = process.env["CRICKET_API_KEY"];

  if (!apiKey) {
    const data = GetLiveMatchesResponse.parse({
      configured: false,
      message:
        "Add a CRICKET_API_KEY secret (free at cricketdata.org) to see live matches here.",
      matches: [],
    });
    res.json(data);
    return;
  }

  if (cache && Date.now() - cache.ts < CACHE_TTL_MS) {
    res.json(cache.payload);
    return;
  }

  try {
    const url = `https://api.cricapi.com/v1/currentMatches?apikey=${encodeURIComponent(apiKey)}&offset=0`;
    const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
    const json = (await r.json()) as CricketDataResponse;

    if (json.status !== "success" || !Array.isArray(json.data)) {
      const data = GetLiveMatchesResponse.parse({
        configured: true,
        message:
          "CricketData API returned no usable data right now. Try again in a minute.",
        matches: [],
      });
      cache = { ts: Date.now(), payload: data };
      res.json(data);
      return;
    }

    const matches = json.data
      .slice(0, 10)
      .map((m) => ({
        id: m.id,
        name: m.name,
        matchType: m.matchType ?? "",
        status: m.status,
        venue: m.venue ?? "",
        date: m.date ?? "",
        teams: Array.isArray(m.teams) ? m.teams : [],
      }));

    const data = GetLiveMatchesResponse.parse({
      configured: true,
      message: null,
      matches,
    });
    cache = { ts: Date.now(), payload: data };
    res.json(data);
  } catch (err) {
    logger.error({ err }, "Failed to fetch live matches");
    const data = GetLiveMatchesResponse.parse({
      configured: true,
      message: "Could not reach CricketData right now.",
      matches: [],
    });
    res.json(data);
  }
});

export default router;
