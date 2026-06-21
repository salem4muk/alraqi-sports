import { randomUUID } from "crypto";
import { mkdir, readFile, rename, writeFile } from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "watch-store.json");

const defaultStore = {
  categories: [
    {
      id: "sports",
      name: "sports",
      isActive: true,
      sortOrder: 10
    }
  ],
  channels: [],
  matchLinks: []
};

function asText(value, fallback = "") {
  if (value == null) return fallback;
  return String(value).trim();
}

function asBoolean(value, fallback = true) {
  if (typeof value === "boolean") return value;
  if (value == null || value === "") return fallback;
  return String(value).toLowerCase() === "true";
}

function asNumber(value, fallback = 0) {
  const number = Number.parseInt(value, 10);
  return Number.isFinite(number) ? number : fallback;
}

function sortByOrderThenName(a, b) {
  return (a.sortOrder || 0) - (b.sortOrder || 0) || String(a.name || a.title || "").localeCompare(String(b.name || b.title || ""), "ar");
}

function cleanLink(link = {}, fallbackName = "Server") {
  return {
    id: asText(link.id) || randomUUID(),
    name: asText(link.name, fallbackName),
    url: asText(link.url),
    type: asText(link.type, "m3u8"),
    quality: asText(link.quality, "HLS"),
    isActive: asBoolean(link.isActive, true),
    sortOrder: asNumber(link.sortOrder, 0)
  };
}

function cleanChannel(channel = {}) {
  const name = asText(channel.name, "Channel");
  return {
    id: asText(channel.id) || randomUUID(),
    name,
    logo: asText(channel.logo),
    category: asText(channel.category, "sports"),
    isActive: asBoolean(channel.isActive, true),
    sortOrder: asNumber(channel.sortOrder, 0),
    links: Array.isArray(channel.links) ? channel.links.map((link) => cleanLink(link, name)).filter((link) => link.url) : []
  };
}

function slug(value) {
  return asText(value)
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06ff]+/gi, "-")
    .replace(/^-+|-+$/g, "") || randomUUID();
}

function cleanCategory(category = {}, index = 0) {
  const name = asText(category.name || category.id, "sports");
  return {
    id: asText(category.id) || slug(name),
    name,
    isActive: asBoolean(category.isActive, true),
    sortOrder: asNumber(category.sortOrder, (index + 1) * 10)
  };
}

function categoriesFromStore(store = defaultStore) {
  const explicit = Array.isArray(store.categories) ? store.categories : [];
  const categoryMap = new Map();

  explicit.forEach((category, index) => {
    const clean = cleanCategory(category, index);
    categoryMap.set(clean.id, clean);
  });

  (Array.isArray(store.channels) ? store.channels : []).forEach((channel, index) => {
    const categoryId = asText(channel.category, "sports");
    if (!categoryMap.has(categoryId)) {
      categoryMap.set(categoryId, cleanCategory({ id: categoryId, name: categoryId, sortOrder: (index + 1) * 10 }));
    }
  });

  if (!categoryMap.size) categoryMap.set("sports", cleanCategory({ id: "sports", name: "sports", sortOrder: 10 }));
  return [...categoryMap.values()].sort(sortByOrderThenName);
}

function cleanMatchLink(link = {}) {
  return {
    id: asText(link.id) || randomUUID(),
    matchId: asText(link.matchId),
    title: asText(link.title, "رابط مشاهدة"),
    url: asText(link.url),
    type: asText(link.type, "m3u8"),
    quality: asText(link.quality, "HLS"),
    language: asText(link.language, "ar"),
    channelId: asText(link.channelId),
    note: asText(link.note),
    isActive: asBoolean(link.isActive, true),
    sortOrder: asNumber(link.sortOrder, 0)
  };
}

export function cleanStore(store = defaultStore) {
  const categories = categoriesFromStore(store);
  return {
    categories,
    channels: (Array.isArray(store.channels) ? store.channels : []).map(cleanChannel).sort(sortByOrderThenName),
    matchLinks: (Array.isArray(store.matchLinks) ? store.matchLinks : [])
      .map(cleanMatchLink)
      .filter((link) => link.matchId && (link.url || link.channelId))
      .sort(sortByOrderThenName)
  };
}

export async function readWatchStore() {
  try {
    const raw = await readFile(STORE_PATH, "utf8");
    return cleanStore(JSON.parse(raw));
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
    await writeWatchStore(defaultStore);
    return cleanStore(defaultStore);
  }
}

export async function writeWatchStore(store) {
  const clean = cleanStore(store);
  await mkdir(DATA_DIR, { recursive: true });
  const tmpPath = `${STORE_PATH}.tmp`;
  await writeFile(tmpPath, `${JSON.stringify(clean, null, 2)}\n`, "utf8");
  await rename(tmpPath, STORE_PATH);
  return clean;
}

export function publicChannel(channel) {
  const servers = channel.links.filter((link) => link.isActive && link.url).sort(sortByOrderThenName);
  return {
    id: channel.id,
    name: channel.name,
    logo: channel.logo,
    category: channel.category,
    streamUrl: servers[0]?.url || "",
    servers: servers.map((server) => ({
      id: server.id,
      name: server.name,
      url: server.url,
      type: server.type,
      quality: server.quality
    }))
  };
}

export function publicCategory(category) {
  return {
    id: category.id,
    name: category.name
  };
}

export function publicMatchLink(link) {
  return {
    id: link.id,
    matchId: link.matchId,
    title: link.title,
    name: link.title,
    url: link.url,
    type: link.type,
    quality: link.quality,
    language: link.language,
    channelId: link.channelId
  };
}

export function resolvePublicMatchLinks(store, matchLinks = []) {
  const channels = new Map(
    (Array.isArray(store?.channels) ? store.channels : [])
      .filter((channel) => channel.isActive)
      .map((channel) => [channel.id, channel])
  );

  return matchLinks.flatMap((link) => {
    if (link.url) return [publicMatchLink(link)];

    const channel = channels.get(link.channelId);
    if (!channel) return [];

    return channel.links
      .filter((server) => server.isActive && server.url)
      .sort(sortByOrderThenName)
      .map((server) => ({
        id: `${link.id}-${server.id}`,
        matchId: link.matchId,
        title: channel.name,
        name: server.name || channel.name,
        url: server.url,
        type: server.type,
        quality: server.quality,
        language: link.language,
        channelId: channel.id
      }));
  });
}

export function matchKeysFromGame(game = {}) {
  const keys = new Set();
  [game.id, game._id, game.match_id, game.matchId, game.legacy_id, game.n].forEach((value) => {
    if (value == null || value === "") return;
    keys.add(String(value));
    keys.add(`game-${value}`);
  });
  return keys;
}

export function isAdminRequest(request) {
  const configuredToken = process.env.ADMIN_TOKEN || (process.env.NODE_ENV !== "production" ? "alraqi-admin" : "");
  if (!configuredToken) return false;

  const headerToken = request.headers.get("x-admin-token") || "";
  const authHeader = request.headers.get("authorization") || "";
  const bearerToken = authHeader.toLowerCase().startsWith("bearer ") ? authHeader.slice(7).trim() : "";
  return headerToken === configuredToken || bearerToken === configuredToken;
}
