const API_BASE = "/api/worldcup";
const AR_GROUP_LABEL = "\u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0629";
const GROUP_ORDER = "ABCDEFGHIJKL".split("");

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

const stadiumArabicByName = {
  "Los Angeles Stadium": "ملعب لوس أنجلوس",
  "SoFi Stadium": "ملعب صوفي",
  "Atlanta Stadium": "ملعب أتلانتا",
  "Mercedes-Benz Stadium": "ملعب مرسيدس بنز",
  "Seattle Stadium": "ملعب سياتل",
  "Lumen Field": "لومن فيلد",
  "Mexico City Stadium": "ملعب مدينة مكسيكو",
  "Estadio Azteca": "ملعب أزتيكا",
  "Monterrey Stadium": "ملعب مونتيري",
  "Estadio Monterrey": "ملعب مونتيري",
  "Estadio BBVA": "ملعب بي بي في إيه",
  "Toronto Stadium": "ملعب تورونتو",
  "BMO Field": "ملعب بي إم أو",
  "BC Place Vancouver": "ملعب بي سي بليس فانكوفر",
  "BC Place": "ملعب بي سي بليس",
  "Philadelphia Stadium": "ملعب فيلادلفيا",
  "Lincoln Financial Field": "لينكولن فاينانشال فيلد",
  "Boston Stadium": "ملعب بوسطن",
  "Gillette Stadium": "ملعب جيليت",
  "Houston Stadium": "ملعب هيوستن",
  "NRG Stadium": "ملعب إن آر جي",
  "Guadalajara Stadium": "ملعب غوادالاخارا",
  "Estadio Guadalajara": "ملعب غوادالاخارا",
  "Estadio Akron": "ملعب أكرون",
  "Kansas City Stadium": "ملعب كانساس سيتي",
  "GEHA Field at Arrowhead Stadium": "ملعب أروهيد",
  "San Francisco Bay Area Stadium": "ملعب منطقة خليج سان فرانسيسكو",
  "Levi's Stadium": "ملعب ليفاي",
  "Miami Stadium": "ملعب ميامي",
  "Hard Rock Stadium": "ملعب هارد روك",
  "Dallas Stadium": "ملعب دالاس",
  "AT&T Stadium": "ملعب إيه تي آند تي",
  "New York/New Jersey Stadium": "ملعب نيويورك ونيوجيرسي",
  "MetLife Stadium": "ملعب ميتلايف"
};

const cityArabicByName = {
  Atlanta: "أتلانتا",
  Boston: "بوسطن",
  Dallas: "دالاس",
  Guadalajara: "غوادالاخارا",
  Houston: "هيوستن",
  "Kansas City": "كانساس سيتي",
  "Los Angeles": "لوس أنجلوس",
  Miami: "ميامي",
  Monterrey: "مونتيري",
  "Mexico City": "مدينة مكسيكو",
  "New Jersey": "نيوجيرسي",
  Philadelphia: "فيلادلفيا",
  Seattle: "سياتل",
  "San Francisco Bay Area": "منطقة خليج سان فرانسيسكو",
  Toronto: "تورونتو",
  Vancouver: "فانكوفر"
};

const countryArabicByName = {
  Canada: "كندا",
  Mexico: "المكسيك",
  "United States": "الولايات المتحدة"
};

const regionArabicByName = {
  Central: "المنطقة الوسطى",
  Eastern: "المنطقة الشرقية",
  Western: "المنطقة الغربية"
};

function arabicStadiumName(value = "") {
  return (stadiumArabicByName[value] || value).replace(/^استاد\s+/, "ملعب ");
}

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

function isPlaceholderTeamName(value = "") {
  return ["home", "away", "tbd", "to be determined"].includes(String(value).trim().toLowerCase());
}

function displayTeamName(value, fallback = "يتحدد لاحقًا") {
  const name = String(value || "").trim();
  return !name || isPlaceholderTeamName(name) ? fallback : name;
}

function cleanTeamCode(value, fallback = "") {
  const code = String(value || "").trim();
  if (!code || code === "0" || isPlaceholderTeamName(code)) return fallback;
  return code;
}

function cleanFlag(value) {
  const flag = String(value || "").trim();
  return flag === "0" ? "" : flag;
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

function parseYemenDate(utcDate = "") {
  const date = new Date(utcDate);
  if (!utcDate || Number.isNaN(date.getTime())) return null;

  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Aden",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    })
      .formatToParts(date)
      .map((part) => [part.type, part.value])
  );

  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${parts.hour}:${parts.minute}`
  };
}

function numberValue(value) {
  const number = Number.parseInt(value, 10);
  return Number.isNaN(number) ? 0 : number;
}

function isFiniteScore(value) {
  return Number.isFinite(Number(value));
}

function groupDisplayName(groupName) {
  const key = String(groupName || "").trim();
  const label = currentLanguage() === "ar" ? AR_GROUP_LABEL : "Group";
  return key ? `${label} ${key}` : label;
}

function groupSortValue(groupName = "") {
  const key = String(groupName || "").trim().toUpperCase();
  const index = GROUP_ORDER.indexOf(key);
  return index === -1 ? GROUP_ORDER.length : index;
}

function compareGroups(a, b) {
  const aKey = a?.key || a?.name || "";
  const bKey = b?.key || b?.name || "";
  return groupSortValue(aKey) - groupSortValue(bKey) || String(aKey).localeCompare(String(bKey), "en", { numeric: true });
}

function compareStandingsRows(a, b) {
  return (
    b.points - a.points ||
    b.goalDifference - a.goalDifference ||
    b.goalsFor - a.goalsFor ||
    a.goalsAgainst - b.goalsAgainst ||
    b.wins - a.wins ||
    a.order - b.order
  );
}

function watchLinksByMatchId(links = []) {
  const byMatch = new Map();
  links.forEach((link) => {
    const key = String(link.matchId || "");
    if (!key) return;
    const entries = byMatch.get(key) || [];
    entries.push(link);
    byMatch.set(key, entries);
  });
  return byMatch;
}

function linksForMatch(watchLinks, id, rawId) {
  const specific = watchLinks.get(id) || watchLinks.get(String(rawId || "")) || [];
  return specific.length ? specific : watchLinks.get("*") || [];
}

function linkServers(links = []) {
  return links.map((link, index) => ({
    id: link.id,
    name: link.name || link.title || `Server ${index + 1}`,
    url: link.url,
    type: link.type || "m3u8",
    quality: link.quality || "HLS"
  }));
}

function normalizeGame(game, catalog, watchLinks = new Map()) {
  const homeEnglish = game.home_team_name_en || game.homeTeam || "";
  const awayEnglish = game.away_team_name_en || game.awayTeam || "";
  const homeInfo = teamMeta(catalog, game.home_team_id, homeEnglish);
  const awayInfo = teamMeta(catalog, game.away_team_id, awayEnglish);
  const localDate = parseLocalDate(game.local_date);
  const yemenDate = parseYemenDate(game.utc_date || game.utcDate);
  const finished = parseBoolean(game.finished);
  const elapsed = String(game.time_elapsed || "").toLowerCase();
  const status = game.status || (finished ? "finished" : elapsed && elapsed !== "notstarted" ? "live" : "upcoming");
  const rawHomeName = teamName(catalog, game.home_team_id, homeEnglish, game.home_team_name_ar || game.home_team_name_fa || game.homeTeam);
  const rawAwayName = teamName(catalog, game.away_team_id, awayEnglish, game.away_team_name_ar || game.away_team_name_fa || game.awayTeam);
  const homeName = displayTeamName(rawHomeName);
  const awayName = displayTeamName(rawAwayName);
  const id = `game-${game.id || game._id || `${homeName}-${awayName}`}`;
  const servers = linkServers(linksForMatch(watchLinks, id, game.id));
  const fallbackHomeCode = isPlaceholderTeamName(rawHomeName) ? "" : teamCodeFallback(homeEnglish || homeName, game.home_team_id);
  const fallbackAwayCode = isPlaceholderTeamName(rawAwayName) ? "" : teamCodeFallback(awayEnglish || awayName, game.away_team_id);

  return {
    id,
    homeTeamId: String(game.home_team_id || game.homeTeamId || ""),
    awayTeamId: String(game.away_team_id || game.awayTeamId || ""),
    homeTeam: homeName,
    awayTeam: awayName,
    homeCode: cleanTeamCode(homeInfo?.fifaCode || game.home_team_code || game.homeCode, fallbackHomeCode),
    awayCode: cleanTeamCode(awayInfo?.fifaCode || game.away_team_code || game.awayCode, fallbackAwayCode),
    homeFlag: cleanFlag(homeInfo?.flag || game.home_flag || game.homeFlag || ""),
    awayFlag: cleanFlag(awayInfo?.flag || game.away_flag || game.awayFlag || ""),
    homeScore: Number.parseInt(game.home_score ?? game.homeScore, 10),
    awayScore: Number.parseInt(game.away_score ?? game.awayScore, 10),
    date: yemenDate?.date || game.date || localDate.date,
    time: yemenDate?.time || game.time || localDate.time,
    utcDate: game.utc_date || game.utcDate || "",
    status,
    stadium: arabicStadiumName(game.stadium_name_ar || game.stadium_name || game.stadium) || `ملعب ${game.stadium_id || ""}`.trim(),
    stage: game.stage || (game.type === "group" ? `Group ${game.group} · Matchday ${game.matchday || ""}` : game.type || "World Cup 2026"),
    group: game.group || "",
    hasWatchLinks: servers.length > 0,
    streamUrl: servers[0]?.url || "",
    servers
  };
}

function normalizeTeam(team, catalog) {
  const englishName = team.name_en || team.country || team.name || "";
  const translated = teamName(catalog, team.id, englishName, team.name_ar || team.name_fa || team.name || englishName);
  const info = teamMeta(catalog, team.id, englishName);
  return {
    id: `team-${team.id || team._id || englishName}`,
    externalTeamId: String(team.id || team.team_id || team._id || ""),
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
    rows: rows.sort(compareStandingsRows)
  };
}

function emptyStandingRow(team, order) {
  return {
    id: team.externalTeamId || team.id,
    team: team.name,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    goals: "0:0",
    points: 0,
    order
  };
}

function addResult(row, goalsFor, goalsAgainst) {
  row.played += 1;
  row.goalsFor += goalsFor;
  row.goalsAgainst += goalsAgainst;
  row.goalDifference = row.goalsFor - row.goalsAgainst;
  row.goals = `${row.goalsFor}:${row.goalsAgainst}`;
  if (goalsFor > goalsAgainst) {
    row.wins += 1;
    row.points += 3;
  } else if (goalsFor === goalsAgainst) {
    row.draws += 1;
    row.points += 1;
  } else {
    row.losses += 1;
  }
}

export function buildStandingsGroups(games = [], teams = [], fallbackGroups = []) {
  const groups = new Map();
  const rowByTeamId = new Map();
  const teamsByGroup = new Map();

  teams.forEach((team) => {
    const groupKey = String(team.group || "").trim().toUpperCase();
    if (!GROUP_ORDER.includes(groupKey)) return;
    const entries = teamsByGroup.get(groupKey) || [];
    entries.push(team);
    teamsByGroup.set(groupKey, entries);
  });

  teamsByGroup.forEach((groupTeams, groupKey) => {
    const sortedTeams = [...groupTeams].sort((a, b) => numberValue(a.externalTeamId) - numberValue(b.externalTeamId));
    const rows = sortedTeams.map((team, index) => {
      const row = emptyStandingRow(team, index);
      if (team.externalTeamId) rowByTeamId.set(team.externalTeamId, row);
      return row;
    });
    groups.set(groupKey, { name: groupDisplayName(groupKey), key: groupKey, rows });
  });

  games.forEach((game) => {
    const groupKey = String(game.group || "").trim().toUpperCase();
    if (!groups.has(groupKey) || !["live", "finished"].includes(game.status)) return;
    if (!isFiniteScore(game.homeScore) || !isFiniteScore(game.awayScore)) return;

    const homeRow = rowByTeamId.get(String(game.homeTeamId || ""));
    const awayRow = rowByTeamId.get(String(game.awayTeamId || ""));
    if (!homeRow || !awayRow) return;

    const homeScore = Number(game.homeScore);
    const awayScore = Number(game.awayScore);
    addResult(homeRow, homeScore, awayScore);
    addResult(awayRow, awayScore, homeScore);
  });

  const computedGroups = [...groups.values()].map((group) => ({
    ...group,
    rows: [...group.rows].sort(compareStandingsRows)
  }));

  if (computedGroups.length) return computedGroups.sort(compareGroups);
  return [...fallbackGroups].sort(compareGroups);
}

function normalizeStadium(stadium) {
  const englishName = stadium.fifa_name || stadium.name_en || stadium.name || "Stadium";
  const name = arabicStadiumName(stadium.fifa_name_ar || stadium.name_ar || stadiumArabicByName[englishName] || stadium.name_fa || englishName);
  const image = stadium.image || stadium.image_url || stadium.photo || stadium.thumbnail || stadiumImageByName[englishName] || stadiumImageByName[stadium.name_en] || "";
  const officialEnglish = stadium.real_name_en || stadium.name_en || "";

  return {
    id: `stadium-${stadium.id || stadium._id || stadium.name_en || stadium.name}`,
    name,
    officialName: stadiumArabicByName[officialEnglish] || arabicStadiumName(stadium.name_ar) || officialEnglish,
    country: stadium.country_ar || countryArabicByName[stadium.country_en] || stadium.country_fa || stadium.country_en || stadium.country || "",
    city: stadium.city_ar || cityArabicByName[stadium.city_en] || stadium.city_fa || stadium.city_en || stadium.city || "",
    capacity: numberValue(stadium.capacity),
    image,
    region: regionArabicByName[stadium.region] || stadium.region || ""
  };
}

export async function getGames() {
  try {
    const [catalog, payload, watchPayload] = await Promise.all([
      getTeamCatalog(),
      fetchJson(`${API_BASE}/games`),
      fetchJson("/api/watch-links").catch(() => ({ matchLinks: [] }))
    ]);
    const watchLinks = watchLinksByMatchId(normalizeList(watchPayload, "matchLinks"));
    return { data: normalizeList(payload, "games").map((game) => normalizeGame(game, catalog, watchLinks)), source: "api" };
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
      .sort(compareGroups);
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
    return { data: normalizeList(payload, "channels"), categories: normalizeList(payload, "categories"), source: "api" };
  } catch (error) {
    return { data: [], categories: [], source: "error", error };
  }
}
