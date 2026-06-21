import { NextResponse } from "next/server";
import { readWatchStore, resolvePublicMatchLinks } from "../../../../lib/watch-store.js";

export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  const { matchId } = await params;
  const store = await readWatchStore();
  const wanted = new Set([String(matchId), String(matchId).startsWith("game-") ? String(matchId).slice(5) : `game-${matchId}`]);
  const selectedLinks = store.matchLinks.filter((link) => link.isActive && wanted.has(link.matchId));
  const watchLinks = resolvePublicMatchLinks(store, selectedLinks);

  return NextResponse.json({ matchId, watchLinks }, {
    headers: {
      "Cache-Control": "no-store"
    }
  });
}
