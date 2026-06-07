import { NextResponse } from "next/server";
import { matchKeysFromGame, publicMatchLink, readWatchStore } from "../../lib/watch-store.js";

const API_BASE = "https://worldcup26.ir";

export const dynamic = "force-dynamic";

async function fetchGames() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${API_BASE}/get/games`, {
      cache: "no-store",
      headers: {
        accept: "application/json"
      },
      signal: controller.signal
    });

    if (!response.ok) {
      return { error: "WORLD_CUP_API_ERROR", status: response.status, games: [] };
    }

    const payload = await response.json();
    return { games: Array.isArray(payload?.games) ? payload.games : Array.isArray(payload) ? payload : [] };
  } catch (error) {
    return { error: "WORLD_CUP_API_UNAVAILABLE", message: error?.message || "Request failed", games: [] };
  } finally {
    clearTimeout(timeoutId);
  }
}

function linksForGame(game, matchLinks) {
  const keys = matchKeysFromGame(game);
  return matchLinks.filter((link) => keys.has(link.matchId)).map(publicMatchLink);
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const includeLinks = searchParams.get("includeLinks") === "1";
  const [gamesResult, store] = await Promise.all([fetchGames(), readWatchStore()]);
  const activeLinks = store.matchLinks.filter((link) => link.isActive);
  const games = gamesResult.games.map((game) => {
    const watchLinks = linksForGame(game, activeLinks);
    return {
      ...game,
      externalMatchId: game.id != null ? `game-${game.id}` : String(game._id || game.match_id || ""),
      hasWatchLinks: watchLinks.length > 0,
      ...(includeLinks ? { watchLinks } : {})
    };
  });

  return NextResponse.json(
    { games, source: gamesResult.error ? "partial" : "api", error: gamesResult.error, message: gamesResult.message, status: gamesResult.status },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
