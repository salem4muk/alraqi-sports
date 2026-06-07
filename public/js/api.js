const API_BASE = "/api/worldcup";
const AR_GROUP_LABEL = "\u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0629";

const beinSportsServers = [
  { name: "beIN SPORTS 1 VIP", url: "http://172.22.22.33:3220/live/Kings/777823388/2949.m3u8", quality: "HLS" },
  { name: "beIN SPORTS 2 VIP", url: "http://172.22.22.33:3220/live/Kings/777823388/2950.m3u8", quality: "HLS" },
  { name: "beIN SPORTS 6 VIP", url: "http://172.22.22.33:3220/live/Kings/777823388/2954.m3u8", quality: "HLS" }
];

const countryCodes = {
  Algeria: "DZ",
  Argentina: "AR",
  Australia: "AU",
  Austria: "AT",
  Belgium: "BE",
  Brazil: "BR",
  Canada: "CA",
  Colombia: "CO",
  Croatia: "HR",
  Ecuador: "EC",
  Egypt: "EG",
  England: "EN",
  France: "FR",
  Germany: "DE",
  Ghana: "GH",
  Iran: "IR",
  Iraq: "IQ",
  Japan: "JP",
  Jordan: "JO",
  Mexico: "MX",
  Morocco: "MA",
  Netherlands: "NL",
  Portugal: "PT",
  Qatar: "QA",
  "Saudi Arabia": "SA",
  "South Africa": "ZA",
  Spain: "ES",
  Tunisia: "TN",
  "United States": "US"
};

const stadiumImageByName = {
  "Seattle Stadium": "/assets/stadiums/seattle-stadium.png",
  "Lumen Field": "/assets/stadiums/seattle-stadium.png",
  "Miami Stadium": "/assets/stadiums/miami-stadium.png",
  "Hard Rock Stadium": "/assets/stadiums/miami-stadium.png",
  "BC Place Vancouver": "/assets/stadiums/vancouver-stadium.png",
  "BC Place": "/assets/stadiums/vancouver-stadium.png",
  "San Francisco Bay Area Stadium": "/assets/stadiums/san-francisco-stadium.png",
  "Levi's Stadium": "/assets/stadiums/san-francisco-stadium.png",
  "Estadio Monterrey": "/assets/stadiums/monterrey-stadium.png",
  "Estadio BBVA": "/assets/stadiums/monterrey-stadium.png",
  "Mexico City Stadium": "/assets/stadiums/mexico-city-stadium.png",
  "Estadio Azteca": "/assets/stadiums/mexico-city-stadium.png",
  "Estadio Guadalajara": "/assets/stadiums/guadalajara-stadium.png",
  "Estadio Akron": "/assets/stadiums/guadalajara-stadium.png",
  "Houston Stadium": "/assets/stadiums/houston-stadium.png",
  "NRG Stadium": "/assets/stadiums/houston-stadium.png",
  "Los Angeles Stadium": "/assets/stadiums/los-angeles-stadium.png",
  "SoFi Stadium": "/assets/stadiums/los-angeles-stadium.png",
  "Atlanta Stadium": "/assets/stadiums/atlanta-stadium.png",
  "Mercedes-Benz Stadium": "/assets/stadiums/atlanta-stadium.png",
  "Boston Stadium": "/assets/stadiums/boston-stadium.png",
  "Gillette Stadium": "/assets/stadiums/boston-stadium.png",
  "Kansas City Stadium": "/assets/stadiums/kansas-city-stadium.png",
  "GEHA Field at Arrowhead Stadium": "/assets/stadiums/kansas-city-stadium.png",
  "Philadelphia Stadium": "/assets/stadiums/philadelphia-stadium.png",
  "Lincoln Financial Field": "/assets/stadiums/philadelphia-stadium.png",
  "Dallas Stadium": "/assets/stadiums/dallas-stadium.png",
  "AT&T Stadium": "/assets/stadiums/dallas-stadium.png",
  "New York/New Jersey Stadium": "/assets/stadiums/new-york-new-jersey-stadium.png",
  "MetLife Stadium": "/assets/stadiums/new-york-new-jersey-stadium.png",
  "Toronto Stadium": "/assets/stadiums/toronto-stadium.png",
  "BMO Field": "/assets/stadiums/toronto-stadium.png"
};

let teamCatalogPromise = null;

function currentLanguage() {
  return "ar";
}

async function fetchJson(endpoint) {
  const response = await fetch(endpoint, { cache: "no-store" });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

async function getTeamCatalog() {
  if (!teamCatalogPromise) {
    teamCatalogPromise = fetch(new URL("../languages/teams.json", import.meta.url), { cache: "no-store" })
      .then((response) => response.json())
      .then((payload) => {
        const teams = Array.isArray(payload.teams) ? payload.teams : [];
        return {
          byId: new Map(teams.map((team) => [String(team.id), team])),
          byEnglish: new Map(teams.map((team) => [team.names.en, team]))
        };
      })
      .catch(() => ({ byId: new Map(), byEnglish: new Map() }));
  }
  return teamCatalogPromise;
}

function normalizeList(payload, key) {
  if (key && Array.isArray(payload?.[key])) return payload[key];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.result)) return payload.result;
  return [];
}

function teamCodeFallback(name = "", id = "") {
  if (countryCodes[name]) return countryCodes[name];
  const words = String(name).replace(/[^A-Za-z\s]/g, " ").trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) return `${words[0][0]}${words[1][0]}`.toUpperCase();
  if (words[0]) return words[0].slice(0, 2).toUpperCase();
  return String(id || "WC").slice(0, 2).toUpperCase();
}

function teamMeta(catalog, id, englishName) {
  return catalog?.byId.get(String(id)) || catalog?.byEnglish.get(englishName) || null;
}

function teamName(catalog, id, englishName, fallback) {
  const language = currentLanguage();
  const team = teamMeta(catalog, id, englishName);
  return team?.names?.[language] || team?.names?.ar || fallback || englishName;
}

function parseBoolean(value) {
  return String(value).toLowerCase() === "true";
}

function parseLocalDate(localDate = "") {
  const [datePart = "", timePart = ""] = String(localDate).split(" ");
  const [month, day, year] = datePart.split("/");
  return {
    date: year && month && day ? `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}` : datePart,
    time: timePart || ""
  };
}

function numberValue(value) {
  const number = Number.parseInt(value, 10);
  return Number.isNaN(number) ? 0 : number;
}

function groupDisplayName(groupName) {
  const key = String(groupName || "").trim();
  const label = currentLanguage() === "ar" ? AR_GROUP_LABEL : "Group";
  return key ? `${label} ${key}` : label;
}

function normalizeGame(game, catalog) {
  const homeEnglish = game.home_team_name_en || game.homeTeam || "";
  const awayEnglish = game.away_team_name_en || game.awayTeam || "";
  const homeInfo = teamMeta(catalog, game.home_team_id, homeEnglish);
  const awayInfo = teamMeta(catalog, game.away_team_id, awayEnglish);
  const localDate = parseLocalDate(game.local_date);
  const finished = parseBoolean(game.finished);
  const elapsed = String(game.time_elapsed || "").toLowerCase();
  const status = game.status || (finished ? "finished" : elapsed && elapsed !== "notstarted" ? "live" : "upcoming");
  const homeName = teamName(catalog, game.home_team_id, homeEnglish, game.home_team_name_ar || game.home_team_name_fa || game.homeTeam);
  const awayName = teamName(catalog, game.away_team_id, awayEnglish, game.away_team_name_ar || game.away_team_name_fa || game.awayTeam);

  return {
    id: `game-${game.id || game._id || `${homeName}-${awayName}`}`,
    homeTeam: homeName || "Home",
    awayTeam: awayName || "Away",
    homeCode: homeInfo?.fifaCode || game.home_team_code || game.homeCode || teamCodeFallback(homeEnglish || homeName, game.home_team_id),
    awayCode: awayInfo?.fifaCode || game.away_team_code || game.awayCode || teamCodeFallback(awayEnglish || awayName, game.away_team_id),
    homeFlag: homeInfo?.flag || game.home_flag || game.homeFlag || "",
    awayFlag: awayInfo?.flag || game.away_flag || game.awayFlag || "",
    homeScore: Number.parseInt(game.home_score ?? game.homeScore, 10),
    awayScore: Number.parseInt(game.away_score ?? game.awayScore, 10),
    date: game.date || localDate.date,
    time: game.time || localDate.time,
    status,
    stadium: game.stadium_name || game.stadium || `Stadium ${game.stadium_id || ""}`.trim(),
    stage: game.stage || (game.type === "group" ? `Group ${game.group} · Matchday ${game.matchday || ""}` : game.type || "World Cup 2026"),
    group: game.group || "",
    streamUrl: beinSportsServers[0].url,
    servers: beinSportsServers
  };
}

function normalizeTeam(team, catalog) {
  const englishName = team.name_en || team.country || team.name || "";
  const translated = teamName(catalog, team.id, englishName, team.name_fa || team.name_ar || team.name || englishName);
  const info = teamMeta(catalog, team.id, englishName);
  return {
    id: `team-${team.id || team._id || englishName}`,
    name: translated || englishName,
    code: info?.fifaCode || team.fifa_code || team.code || teamCodeFallback(englishName, team.id),
    flag: info?.flag || team.flag || "",
    group: info?.group || team.groups || team.group || "",
    country: englishName || translated
  };
}

function normalizeGroup(group, catalog) {
  if (Array.isArray(group.rows)) return group;
  const rows = (Array.isArray(group.teams) ? group.teams : []).map((row, index) => {
    const info = teamMeta(catalog, row.team_id, "");
    return {
      team: info?.names?.[currentLanguage()] || info?.names?.ar || `Team ${row.team_id}`,
      played: numberValue(row.mp),
      wins: numberValue(row.w),
      draws: numberValue(row.d),
      losses: numberValue(row.l),
      goalsFor: numberValue(row.gf),
      goalsAgainst: numberValue(row.ga),
      goalDifference: numberValue(row.gd),
      goals: `${numberValue(row.gf)}:${numberValue(row.ga)}`,
      points: numberValue(row.pts),
      order: index
    };
  });

  return {
    name: groupDisplayName(group.name),
    key: group.name,
    rows: rows.sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor || a.order - b.order)
  };
}

function normalizeStadium(stadium) {
  const name = stadium.fifa_name || stadium.name_en || stadium.name_fa || stadium.name || "Stadium";
  const image = stadium.image || stadium.image_url || stadium.photo || stadium.thumbnail || stadiumImageByName[name] || stadiumImageByName[stadium.name_en] || "";

  return {
    id: `stadium-${stadium.id || stadium._id || stadium.name_en || stadium.name}`,
    name,
    officialName: stadium.name_en || "",
    country: stadium.country_en || stadium.country_fa || stadium.country || "",
    city: stadium.city_en || stadium.city_fa || stadium.city || "",
    capacity: numberValue(stadium.capacity),
    image,
    region: stadium.region || ""
  };
}

export async function getGames() {
  try {
    const [catalog, payload] = await Promise.all([getTeamCatalog(), fetchJson(`${API_BASE}/games`)]);
    return { data: normalizeList(payload, "games").map((game) => normalizeGame(game, catalog)), source: "api" };
  } catch (error) {
    return { data: [], source: "error", error };
  }
}

export async function getTeams() {
  try {
    const [catalog, payload] = await Promise.all([getTeamCatalog(), fetchJson(`${API_BASE}/teams`)]);
    return { data: normalizeList(payload, "teams").map((team) => normalizeTeam(team, catalog)), source: "api" };
  } catch (error) {
    return { data: [], source: "error", error };
  }
}

export async function getGroups() {
  try {
    const [catalog, payload] = await Promise.all([getTeamCatalog(), fetchJson(`${API_BASE}/groups`)]);
    const groups = normalizeList(payload, "groups")
      .map((group) => normalizeGroup(group, catalog))
      .sort((a, b) => String(a.key || a.name).localeCompare(String(b.key || b.name), "en", { numeric: true }));
    return { data: groups, source: "api" };
  } catch (error) {
    return { data: [], source: "error", error };
  }
}

export async function getStadiums() {
  try {
    const payload = await fetchJson(`${API_BASE}/stadiums`);
    return { data: normalizeList(payload, "stadiums").map(normalizeStadium), source: "api" };
  } catch (error) {
    return { data: [], source: "error", error };
  }
}

export async function getChannels() {
  try {
    const payload = await fetchJson("/api/channels");
    return { data: normalizeList(payload, "channels"), source: "api" };
  } catch (error) {
    return { data: [], source: "error", error };
  }
}
