import { NextResponse } from "next/server";
import { isAdminRequest, readWatchStore, writeWatchStore } from "../../../lib/watch-store.js";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
}

export async function GET(request) {
  if (!isAdminRequest(request)) return unauthorized();
  const store = await readWatchStore();

  return NextResponse.json({ store }, {
    headers: {
      "Cache-Control": "no-store"
    }
  });
}

export async function PUT(request) {
  if (!isAdminRequest(request)) return unauthorized();

  try {
    const payload = await request.json();
    const store = await writeWatchStore(payload?.store || payload);
    return NextResponse.json({ store }, {
      headers: {
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: "INVALID_STORE", message: error?.message || "Invalid payload" },
      { status: 400 }
    );
  }
}
