import { NextResponse } from "next/server";
import { publicMatchLink, readWatchStore } from "../../../../lib/watch-store.js";

export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  const { matchId } = await params;
  const store = await readWatchStore();
  const wanted = new Set([String(matchId), String(matchId).startsWith("game-") ? String(matchId).slice(5) : `game-${matchId}`]);
  const watchLinks = store.matchLinks
    .filter((link) => link.isActive && wanted.has(link.matchId))
    .map(publicMatchLink);

  return NextResponse.json({ matchId, watchLinks }, {
    headers: {
      "Cache-Control": "no-store"
    }
  });
}
