import { NextResponse } from "next/server";
import { getWorldCupResource } from "../../../lib/worldcup-data.js";

const ALLOWED_RESOURCES = new Set(["games", "teams", "groups", "stadiums"]);

export const dynamic = "force-dynamic";

async function fetchWorldCupResource(resource) {
  try {
    const result = await getWorldCupResource(resource);
    return NextResponse.json(result.payload, {
      headers: {
        "Cache-Control": "no-store",
        "X-World-Cup-Source": result.source
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error?.code || "WORLD_CUP_API_UNAVAILABLE",
        message: error?.message || "Request failed",
        details: error?.details
      },
      { status: 502 }
    );
  }
}

export async function GET(_request, { params }) {
  const { resource } = await params;
  if (!ALLOWED_RESOURCES.has(resource)) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  return fetchWorldCupResource(resource);
}
