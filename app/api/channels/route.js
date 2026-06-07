import { NextResponse } from "next/server";

const channels = [
  {
    id: "channel-bein-sports-1",
    name: "beIN SPORTS 1 VIP",
    logo: "1",
    category: "sports",
    streamUrl: "http://172.22.22.33:3220/live/Kings/777823388/2949.m3u8",
    servers: [
      { name: "beIN SPORTS 1 VIP", url: "http://172.22.22.33:3220/live/Kings/777823388/2949.m3u8", quality: "HLS" }
    ]
  },
  {
    id: "channel-bein-sports-2",
    name: "beIN SPORTS 2 VIP",
    logo: "2",
    category: "sports",
    streamUrl: "http://172.22.22.33:3220/live/Kings/777823388/2950.m3u8",
    servers: [
      { name: "beIN SPORTS 2 VIP", url: "http://172.22.22.33:3220/live/Kings/777823388/2950.m3u8", quality: "HLS" }
    ]
  },
  {
    id: "channel-bein-sports-6",
    name: "beIN SPORTS 6 VIP",
    logo: "6",
    category: "sports",
    streamUrl: "http://172.22.22.33:3220/live/Kings/777823388/2954.m3u8",
    servers: [
      { name: "beIN SPORTS 6 VIP", url: "http://172.22.22.33:3220/live/Kings/777823388/2954.m3u8", quality: "HLS" }
    ]
  }
];

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ channels }, {
    headers: {
      "Cache-Control": "no-store"
    }
  });
}
