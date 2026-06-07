import { NextResponse } from "next/server";
import { publicMatchLink, readWatchStore } from "../../lib/watch-store.js";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const matchId = searchParams.get("matchId");
  const store = await readWatchStore();
  const matchLinks = store.matchLinks
    .filter((link) => link.isActive)
    .filter((link) => !matchId || link.matchId === matchId)
    .map(publicMatchLink);

  return NextResponse.json({ matchLinks }, {
    headers: {
      "Cache-Control": "no-store"
    }
  });
}
