import { NextResponse } from "next/server";

const ALLOWED_RESOURCES = new Set(["games", "teams", "groups", "stadiums"]);
const API_BASE = "https://worldcup26.ir";

export const dynamic = "force-dynamic";

async function fetchWorldCupResource(resource) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${API_BASE}/get/${resource}`, {
      cache: "no-store",
      headers: {
        accept: "application/json"
      },
      signal: controller.signal
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "WORLD_CUP_API_ERROR", status: response.status },
        { status: 502 }
      );
    }

    const payload = await response.json();
    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: "WORLD_CUP_API_UNAVAILABLE", message: error?.message || "Request failed" },
      { status: 502 }
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function GET(_request, { params }) {
  const { resource } = await params;
  if (!ALLOWED_RESOURCES.has(resource)) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  return fetchWorldCupResource(resource);
}
