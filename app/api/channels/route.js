import { NextResponse } from "next/server";
import { publicCategory, publicChannel, readWatchStore } from "../../lib/watch-store.js";

export const dynamic = "force-dynamic";

export async function GET() {
  const store = await readWatchStore();
  const channels = store.channels.filter((channel) => channel.isActive).map(publicChannel);
  const categories = store.categories.filter((category) => category.isActive).map(publicCategory);

  return NextResponse.json({ channels, categories }, {
    headers: {
      "Cache-Control": "no-store"
    }
  });
}
