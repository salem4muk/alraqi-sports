import { readFile } from "fs/promises";
import path from "path";

const OPEN_DATA_BASES = [
  process.env.WORLDCUP_OPEN_DATA_BASE,
  "https://raw.githubusercontent.com/26worldcup/26worldcup.github.io/main/public/data",
  "https://cdn.jsdelivr.net/gh/26worldcup/26worldcup.github.io@main/public/data"
].filter(Boolean);

const LEGACY_API_BASE = process.env.WORLDCUP_LEGACY_API_BASE || "https://worldcup26.ir";
const OPEN_DATA_TIMEOUT_MS = 8000;
const LEGACY_TIMEOUT_MS = 30000;
const MEMORY_CACHE_MS = 60000;
const memoryCache = new Map();
const LOCAL_CACHE_DIR = path.join(process.cwd(), "data", "worldcup-cache");

const RESOURCE_FILES = {
  games: ["matches.json", "teams.json", "venues.json", "meta.json"],
  teams: ["teams.json", "meta.json"],
  groups: ["standings.json", "teams.json", "meta.json"],
  stadiums: ["venues.json", "meta.json"]
};

const STAGE_LABELS = {
  group: "Group stage",
  r32: "Round of 32",
  round32: "Round of 32",
  r16: "Round of 16",
  round16: "Round of 16",
  qf: "Quarter-finals",
  quarterfinal: "Quarter-finals",
  sf: "Semi-finals",
  semifinal: "Semi-finals",
  third: "Third-place match",
  final: "Final"
};

const COUNTRY_NAMES = {
  CA: "Canada",
  MX: "Mexico",
  US: "United States"
};

function values(record) {
  return record && typeof record === "object" && !Array.isArray(record) ? Object.values(record) : [];
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

async function fetchJson(url, timeoutMs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        accept: "application/json"
      },
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

async function fetchOpenFile(file) {
  const cached = memoryCache.get(file);
  if (cached && cached.expiresAt > Date.now()) return cached.payload;

  const errors = [];
  for (const base of OPEN_DATA_BASES) {
    try {
      const payload = await fetchJson(`${base}/${file}`, OPEN_DATA_TIMEOUT_MS);
      memoryCache.set(file, { payload, expiresAt: Date.now() + MEMORY_CACHE_MS });
      return payload;
    } catch (error) {
      errors.push(`${base}: ${error?.message || "Request failed"}`);
    }
  }

  try {
    const payload = JSON.parse(await readFile(path.join(LOCAL_CACHE_DIR, file), "utf8"));
    memoryCache.set(file, { payload, expiresAt: Date.now() + MEMORY_CACHE_MS });
    return payload;
  } catch (error) {
    errors.push(`local cache: ${error?.message || "Read failed"}`);
  }

  throw new Error(errors.join("; "));
}

async function fetchOpenFiles(files) {
  const payloads = await Promise.all(files.map((file) => fetchOpenFile(file)));
  return Object.fromEntries(files.map((file, index) => [file, payloads[index]]));
}

function localizedName(team, language = "en") {
  return team?.name?.[language] || team?.name?.en || team?.code || "";
}

function teamIndex(teamsPayload) {
  const teams = teamsPayload?.teams || {};
  return new Map(values(teams).map((team) => [String(team.code || ""), team]));
}

function venueIndex(venuesPayload) {
  const venues = venuesPayload?.venues || {};
  return new Map(values(venues).map((venue) => [String(venue.id || ""), venue]));
}

function datePartsAtVenue(isoDate, timeZone) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return { date: "", time: "" };

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timeZone || "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  });
  const parts = Object.fromEntries(formatter.formatToParts(date).map((part) => [part.type, part.value]));

  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${parts.hour}:${parts.minute}`
  };
}

function groupMatchdays(matches) {
  const matchdays = new Map();
  const byGroup = new Map();

  matches
    .filter((match) => match.stage === "group" && match.group)
    .forEach((match) => {
      const entries = byGroup.get(match.group) || [];
      entries.push(match);
      byGroup.set(match.group, entries);
    });

  byGroup.forEach((entries) => {
    entries
      .sort((a, b) => Date.parse(a.date) - Date.parse(b.date) || Number(a.n || 0) - Number(b.n || 0))
      .forEach((match, index) => matchdays.set(String(match.id), Math.floor(index / 2) + 1));
  });

  return matchdays;
}

function normalizedStatus(status) {
  if (status === "live") return "live";
  if (status === "finished") return "finished";
  return "upcoming";
}

function gameTeam(code, placeholder, teams) {
  const team = teams.get(String(code || ""));
  return {
    id: team?.fifaId || "",
    code: team?.code || code || "",
    englishName: localizedName(team, "en") || placeholder || "TBD",
    arabicName: localizedName(team, "ar") || placeholder || "يتحدد لاحقًا",
    flag: team?.flag || ""
  };
}

function transformGames(matchesPayload, teamsPayload, venuesPayload) {
  const matches = asArray(matchesPayload?.matches);
  const teams = teamIndex(teamsPayload);
  const venues = venueIndex(venuesPayload);
  const matchdays = groupMatchdays(matches);

  return matches.map((match) => {
    const home = gameTeam(match.home?.code, match.phA, teams);
    const away = gameTeam(match.away?.code, match.phB, teams);
    const venue = venues.get(String(match.venueId || ""));
    const local = datePartsAtVenue(match.date, venue?.tz);
    const status = normalizedStatus(match.status);
    const matchday = matchdays.get(String(match.id)) || "";
    const stageKey = String(match.stage || "").toLowerCase();
    const stage = stageKey === "group"
      ? `Group ${match.group || ""} · Matchday ${matchday}`.trim()
      : STAGE_LABELS[stageKey] || match.stage || "World Cup 2026";

    return {
      id: String(match.id || ""),
      match_id: String(match.id || ""),
      legacy_id: String(match.n || ""),
      n: match.n ?? null,
      home_team_id: String(home.id),
      away_team_id: String(away.id),
      home_team_code: home.code,
      away_team_code: away.code,
      home_team_name_en: home.englishName,
      away_team_name_en: away.englishName,
      home_team_name_ar: home.arabicName,
      away_team_name_ar: away.arabicName,
      home_flag: home.flag,
      away_flag: away.flag,
      home_score: match.home?.score ?? null,
      away_score: match.away?.score ?? null,
      home_penalty_score: match.home?.pen ?? null,
      away_penalty_score: match.away?.pen ?? null,
      group: match.group || "",
      matchday: String(matchday),
      date: local.date,
      time: local.time,
      local_date: local.date && local.time ? `${local.date} ${local.time}` : "",
      utc_date: match.date || "",
      stadium_id: String(match.venueId || ""),
      stadium_name: venue?.fifaName?.en || venue?.realName || "",
      stadium_name_ar: venue?.fifaName?.ar || venue?.fifaName?.en || venue?.realName || "",
      finished: status === "finished" ? "TRUE" : "FALSE",
      time_elapsed: match.time || status,
      status,
      type: stageKey === "group" ? "group" : stageKey,
      stage,
      attendance: match.attendance ?? null
    };
  });
}

function transformTeams(teamsPayload) {
  return values(teamsPayload?.teams).map((team) => ({
    id: String(team.fifaId || team.code || ""),
    team_id: String(team.fifaId || team.code || ""),
    name: localizedName(team, "en"),
    name_en: localizedName(team, "en"),
    name_ar: localizedName(team, "ar"),
    name_fa: localizedName(team, "fa"),
    fifa_code: team.code || "",
    code: team.code || "",
    flag: team.flag || "",
    groups: team.group || "",
    group: team.group || "",
    iso2: team.iso2 || "",
    ranking: team.ranking ?? null
  }));
}

function transformGroups(standingsPayload, teamsPayload) {
  const teams = teamIndex(teamsPayload);
  const groups = standingsPayload?.groups || {};

  return Object.entries(groups)
    .sort(([a], [b]) => a.localeCompare(b, "en"))
    .map(([name, rows]) => ({
      name,
      teams: asArray(rows).map((row) => {
        const team = teams.get(String(row.code || ""));
        return {
          team_id: String(team?.fifaId || row.code || ""),
          team_code: row.code || "",
          mp: row.p ?? 0,
          w: row.w ?? 0,
          d: row.d ?? 0,
          l: row.l ?? 0,
          gf: row.gf ?? 0,
          ga: row.ga ?? 0,
          gd: row.gd ?? 0,
          pts: row.pts ?? 0,
          rank: row.rank ?? 0
        };
      })
    }));
}

function venueRegion(venue) {
  const timeZone = String(venue?.tz || "");
  if (/Los_Angeles|Vancouver/.test(timeZone)) return "Western";
  if (/Chicago|Mexico_City|Monterrey/.test(timeZone)) return "Central";
  return "Eastern";
}

function transformStadiums(venuesPayload) {
  return values(venuesPayload?.venues).map((venue) => ({
    id: String(venue.id || ""),
    name: venue.realName || venue.fifaName?.en || "Stadium",
    name_en: venue.realName || venue.fifaName?.en || "Stadium",
    name_ar: venue.fifaName?.ar || venue.realName || "ملعب",
    real_name_en: venue.realName || "",
    fifa_name: venue.fifaName?.en || venue.realName || "Stadium",
    fifa_name_ar: venue.fifaName?.ar || venue.fifaName?.en || venue.realName || "ملعب",
    city_en: venue.cityName?.en || venue.city || "",
    city_ar: venue.cityName?.ar || venue.city || "",
    country_en: COUNTRY_NAMES[venue.country] || venue.country || "",
    capacity: venue.capacity ?? 0,
    region: venueRegion(venue),
    latitude: venue.lat ?? null,
    longitude: venue.lon ?? null
  }));
}

function transformResource(resource, files) {
  if (resource === "games") {
    return { games: transformGames(files["matches.json"], files["teams.json"], files["venues.json"]) };
  }
  if (resource === "teams") {
    return { teams: transformTeams(files["teams.json"]) };
  }
  if (resource === "groups") {
    return { groups: transformGroups(files["standings.json"], files["teams.json"]) };
  }
  if (resource === "stadiums") {
    return { stadiums: transformStadiums(files["venues.json"]) };
  }
  throw new Error(`Unsupported resource: ${resource}`);
}

function validateResource(resource, payload) {
  const list = payload?.[resource];
  if (!Array.isArray(list) || !list.length) {
    throw new Error(`Open dataset returned no ${resource}`);
  }
}

async function fetchLegacyResource(resource) {
  return fetchJson(`${LEGACY_API_BASE}/get/${resource}`, LEGACY_TIMEOUT_MS);
}

export async function getWorldCupResource(resource) {
  const files = RESOURCE_FILES[resource];
  if (!files) throw new Error(`Unsupported resource: ${resource}`);

  let openDataError;
  try {
    const payloads = await fetchOpenFiles(files);
    const payload = transformResource(resource, payloads);
    validateResource(resource, payload);
    return {
      payload: {
        ...payload,
        source: "26worldcup",
        updatedAt: payloads["meta.json"]?.updatedAt || null
      },
      source: "26worldcup"
    };
  } catch (error) {
    openDataError = error;
  }

  try {
    const payload = await fetchLegacyResource(resource);
    validateResource(resource, payload);
    return {
      payload: {
        ...payload,
        source: "worldcup26.ir",
        fallbackReason: openDataError?.message || "Open dataset unavailable"
      },
      source: "worldcup26.ir"
    };
  } catch (legacyError) {
    const error = new Error("All World Cup data sources are unavailable");
    error.code = "WORLD_CUP_API_UNAVAILABLE";
    error.details = {
      openData: openDataError?.message || "Request failed",
      legacy: legacyError?.message || "Request failed"
    };
    throw error;
  }
}
