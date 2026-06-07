import { getChannels, getGames, getGroups, getStadiums, getTeams } from "./api.js?v=next-21";
import { renderChannelCard, createChannelFilters, filterChannels } from "./channels.js?v=next-21";
import { loadLanguage, t } from "./i18n.js?v=next-21";
import { createMatchFilters, filterMatches, renderMatchCard, renderMatchHero } from "./matches.js?v=next-21";
import { openPlayer, initPlayer } from "./player.js?v=next-21";
import { globalSearch } from "./search.js?v=next-21";
import { renderStadiumCard, renderStandings } from "./standings.js?v=next-21";
import { renderTeamCard } from "./teams.js?v=next-21";

const state = {
  data: { games: [], teams: [], groups: [], stadiums: [], channels: [] },
  matchFilter: "all",
  channelFilter: "all",
  deferredInstallPrompt: null
};

const WORLD_CUP_START = new Date("2026-06-11T00:00:00");
const WORLD_CUP_END_LABEL = "19 يوليو 2026";
let countdownTimer = null;
const LEGACY_FAVORITES_KEY = "alraqi-favorites";

const byId = (id) => document.getElementById(id);

function toast(message) {
  const element = byId("toast");
  element.textContent = message;
  element.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => element.classList.remove("show"), 2600);
}

function skeleton(count = 3) {
  return Array.from({ length: count }, () => `<div class="skeleton"></div>`).join("");
}

function getCountdownParts() {
  const remaining = Math.max(0, WORLD_CUP_START.getTime() - Date.now());
  const secondsTotal = Math.floor(remaining / 1000);
  const days = Math.floor(secondsTotal / 86400);
  const hours = Math.floor((secondsTotal % 86400) / 3600);
  const minutes = Math.floor((secondsTotal % 3600) / 60);
  const seconds = secondsTotal % 60;
  return { days, hours, minutes, seconds };
}

function renderWorldCupCountdown() {
  const parts = getCountdownParts();
  const unitCards = [
    ["days", "أيام", parts.days],
    ["hours", "ساعات", parts.hours],
    ["minutes", "دقائق", parts.minutes],
    ["seconds", "ثواني", parts.seconds]
  ];

  return `
    <article class="worldcup-countdown" aria-label="عد تنازلي لكأس العالم 2026">
      <div class="countdown-date">🏆 11 يونيو - ${WORLD_CUP_END_LABEL}</div>
      <h2>FIFA World Cup 2026</h2>
      <p>أكبر حدث كروي في العالم: 48 منتخبًا، 104 مباريات في الولايات المتحدة وكندا والمكسيك.</p>
      <div class="countdown-grid">
        ${unitCards
          .map(
            ([key, label, value]) => `
          <div class="countdown-unit" data-countdown="${key}">
            <strong>${String(value).padStart(key === "days" ? 1 : 2, "0")}</strong>
            <span>${label}</span>
          </div>
        `
          )
          .join("")}
      </div>
    </article>
  `;
}

function renderFeaturedHome() {
  if (Date.now() < WORLD_CUP_START.getTime()) {
    byId("featuredMatch").innerHTML = renderWorldCupCountdown();
    return;
  }

  const featured = state.data.games.find((match) => match.status === "live") || state.data.games[0];
  byId("featuredMatch").innerHTML = renderMatchHero(featured);
}

function getPlayable(type, id) {
  if (type === "match") {
    const match = state.data.games.find((item) => item.id === id);
    return match ? { ...match, title: `${match.homeTeam} ضد ${match.awayTeam}` } : null;
  }
  return state.data.channels.find((item) => item.id === id);
}

function renderHome() {
  renderFeaturedHome();
  const homeMatches = state.data.games
    .filter((match) => match.status === "live" || match.status === "upcoming")
    .slice(0, 5);
  byId("liveMatchesList").innerHTML = homeMatches.length ? homeMatches.map(renderMatchCard).join("") : `<div class="empty-state">${t("noResults")}</div>`;
  byId("popularChannels").innerHTML = state.data.channels.length ? state.data.channels.slice(0, 3).map(renderChannelCard).join("") : `<div class="empty-state">${t("noResults")}</div>`;
}

function startCountdownTicker() {
  clearInterval(countdownTimer);
  countdownTimer = setInterval(() => {
    if (document.querySelector("#homeView.active") || Date.now() >= WORLD_CUP_START.getTime()) {
      renderFeaturedHome();
    }
    if (Date.now() >= WORLD_CUP_START.getTime()) clearInterval(countdownTimer);
  }, 1000);
}

function renderMatches() {
  byId("matchFilters").innerHTML = createMatchFilters(state.matchFilter);
  const matches = filterMatches(state.data.games, state.matchFilter);
  byId("matchesList").innerHTML = matches.length ? matches.map(renderMatchCard).join("") : `<div class="empty-state">${t("noResults")}</div>`;
}

function renderChannels() {
  byId("channelFilters").innerHTML = createChannelFilters(state.channelFilter);
  const channels = filterChannels(state.data.channels, state.channelFilter);
  byId("channelsList").innerHTML = channels.length ? channels.map(renderChannelCard).join("") : `<div class="empty-state">${t("noResults")}</div>`;
}

function renderStandingsView() {
  byId("standingsList").innerHTML = state.data.groups.length ? renderStandings(state.data.groups) : `<div class="empty-state">${t("noResults")}</div>`;
  byId("stadiumsList").innerHTML = state.data.stadiums.length ? state.data.stadiums.map(renderStadiumCard).join("") : `<div class="empty-state">${t("noResults")}</div>`;
}

function renderMore() {
  byId("teamsList").innerHTML = state.data.teams.length ? state.data.teams.map(renderTeamCard).join("") : `<div class="empty-state">${t("noResults")}</div>`;
}

function renderAll() {
  renderHome();
  renderMatches();
  renderChannels();
  renderStandingsView();
  renderMore();
}

function setView(view) {
  document.querySelectorAll(".view").forEach((section) => section.classList.toggle("active", section.dataset.view === view));
  document.querySelectorAll(".nav-item").forEach((button) => button.classList.toggle("active", button.dataset.go === view));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderSearchResults(query) {
  const results = globalSearch(query, state.data);
  const container = byId("searchResults");
  container.hidden = !query.trim();
  if (!query.trim()) {
    container.innerHTML = "";
    return;
  }
  container.innerHTML = results.length
    ? results.map((entry) => `<button class="search-item" type="button" data-search-type="${entry.type}" data-search-id="${entry.item.id}"><span>${entry.title}</span><small class="muted">${entry.subtitle}</small></button>`).join("")
    : `<div class="empty-state">${t("noResults")}</div>`;
}

async function loadData() {
  if (Date.now() < WORLD_CUP_START.getTime()) renderFeaturedHome();
  else byId("featuredMatch").innerHTML = skeleton(1);
  byId("liveMatchesList").innerHTML = skeleton(2);

  const [games, teams, groups, stadiums, channels] = await Promise.all([getGames(), getTeams(), getGroups(), getStadiums(), getChannels()]);
  state.data = {
    games: games.data,
    teams: teams.data,
    groups: groups.data,
    stadiums: stadiums.data,
    channels: channels.data
  };
  if ([games, teams, groups, stadiums, channels].some((result) => result.source === "error")) toast(t("noResults"));
  renderAll();
  startCountdownTicker();
}

function bindEvents() {
  document.body.addEventListener("click", (event) => {
    const go = event.target.closest("[data-go]");
    if (go) setView(go.dataset.go);

    const play = event.target.closest("[data-play]");
    if (play) {
      const item = getPlayable(play.dataset.play, play.dataset.id);
      if (item) openPlayer(item);
    }


    const matchFilter = event.target.closest("[data-match-filter]");
    if (matchFilter) {
      state.matchFilter = matchFilter.dataset.matchFilter;
      renderMatches();
    }

    const channelFilter = event.target.closest("[data-channel-filter]");
    if (channelFilter) {
      state.channelFilter = channelFilter.dataset.channelFilter;
      renderChannels();
    }

    const searchItem = event.target.closest("[data-search-type]");
    if (searchItem) {
      const viewMap = { match: "matches", channel: "channels", team: "more", stadium: "standings" };
      setView(viewMap[searchItem.dataset.searchType] || "home");
      byId("searchInput").value = "";
      renderSearchResults("");
    }
  });

  byId("searchInput").addEventListener("input", (event) => renderSearchResults(event.target.value));
  byId("globalSearch").addEventListener("submit", (event) => event.preventDefault());

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    state.deferredInstallPrompt = event;
    byId("installButton").hidden = false;
  });

  byId("installButton").addEventListener("click", async () => {
    if (!state.deferredInstallPrompt) return;
    state.deferredInstallPrompt.prompt();
    await state.deferredInstallPrompt.userChoice;
    state.deferredInstallPrompt = null;
    byId("installButton").hidden = true;
  });
}

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(registrations.map((registration) => registration.unregister()));
  if ("caches" in window) {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
  }
}

async function boot() {
  localStorage.removeItem(LEGACY_FAVORITES_KEY);
  await loadLanguage();
  bindEvents();
  initPlayer();
  renderFeaturedHome();
  startCountdownTicker();
  await loadData();
  await registerServiceWorker();
}

boot();




