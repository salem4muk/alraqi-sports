import { NextResponse } from "next/server";
import { matchKeysFromGame, readWatchStore, resolvePublicMatchLinks } from "../../lib/watch-store.js";
import { getWorldCupResource } from "../../lib/worldcup-data.js";

export const dynamic = "force-dynamic";

async function fetchGames() {
  try {
    const result = await getWorldCupResource("games");
    const games = Array.isArray(result.payload?.games) ? result.payload.games : [];
    return { games, source: result.source, updatedAt: result.payload?.updatedAt };
  } catch (error) {
    return {
      error: error?.code || "WORLD_CUP_API_UNAVAILABLE",
      message: error?.message || "Request failed",
      details: error?.details,
      games: []
    };
  }
}

function linksForGame(game, store, matchLinks) {
  const keys = matchKeysFromGame(game);
  return resolvePublicMatchLinks(store, matchLinks.filter((link) => keys.has(link.matchId)));
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const includeLinks = searchParams.get("includeLinks") === "1";
  const [gamesResult, store] = await Promise.all([fetchGames(), readWatchStore()]);
  const activeLinks = store.matchLinks.filter((link) => link.isActive);
  const games = gamesResult.games.map((game) => {
    const watchLinks = linksForGame(game, store, activeLinks);
    return {
      ...game,
      externalMatchId: game.id != null ? `game-${game.id}` : String(game._id || game.match_id || ""),
      hasWatchLinks: watchLinks.length > 0,
      ...(includeLinks ? { watchLinks } : {})
    };
  });

  return NextResponse.json(
    {
      games,
      source: gamesResult.error ? "partial" : gamesResult.source,
      updatedAt: gamesResult.updatedAt,
      error: gamesResult.error,
      message: gamesResult.message,
      details: gamesResult.details
    },
    {
      headers: {
        "Cache-Control": "no-store",
        ...(gamesResult.source ? { "X-World-Cup-Source": gamesResult.source } : {})
      }
    }
  );
}
