import { t } from "./i18n.js?v=next-21";

export const statusLabels = {
  upcoming: "upcoming",
  live: "live",
  finished: "finished"
};

export function formatTime12(time = "") {
  const [hourText, minuteText = "00"] = String(time).split(":");
  const hour = Number.parseInt(hourText, 10);
  if (Number.isNaN(hour)) return time;
  const period = hour >= 12 ? "\u0645" : "\u0635";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minuteText.padStart(2, "0")} ${period}`;
}

export function formatScore(match) {
  if (match.status === "upcoming" || match.homeScore == null || match.awayScore == null) return formatTime12(match.time);
  return `${match.homeScore} - ${match.awayScore}`;
}

function matchResult(match) {
  const homeScore = Number.isFinite(Number(match.homeScore)) ? Number(match.homeScore) : 0;
  const awayScore = Number.isFinite(Number(match.awayScore)) ? Number(match.awayScore) : 0;
  return `${homeScore} - ${awayScore}`;
}

function flagContent(value, label) {
  if (typeof value === "string" && /^https?:\/\//.test(value)) {
    return `<img src="${value}" alt="${label}" loading="lazy" />`;
  }
  return value || label;
}

function groupLabel(match) {
  return match.group ? `المجموعة ${match.group}` : "كأس العالم";
}

function matchdayLabel(match) {
  const matchday = String(match.stage || "").match(/Matchday\s+(\d+)/i)?.[1];
  return matchday ? `الجولة ${matchday}` : t(statusLabels[match.status], match.status);
}

export function renderMatchHero(match) {
  if (!match) return "";
  const liveBadge =
    match.status === "live"
      ? `<span class="badge live"><span class="live-dot"></span>${t("liveNow")}</span>`
      : `<span class="badge">${t(statusLabels[match.status])}</span>`;

  return `
    <article class="match-hero">
      <div class="hero-head">
        ${liveBadge}
        <span class="stage-name">${match.stage} · ${match.stadium}</span>
      </div>
      <div class="versus">
        <div class="team-side">
          <span class="team-logo">${flagContent(match.homeFlag, match.homeCode)}</span>
          <strong>${match.homeTeam}</strong>
          <small>${match.homeCode}</small>
        </div>
        <div class="score-box">${formatScore(match)}</div>
        <div class="team-side">
          <span class="team-logo">${flagContent(match.awayFlag, match.awayCode)}</span>
          <strong>${match.awayTeam}</strong>
          <small>${match.awayCode}</small>
        </div>
      </div>
      <div class="hero-actions">
        <button class="primary-action" type="button" data-play="match" data-id="${match.id}">${t("watchMatch")}</button>
      </div>
    </article>
  `;
}

export function renderMatchCard(match) {
  const canWatch = match.status === "live";
  return `
    <article class="match-card fixture-card">
      <div class="match-card-head">
        <span class="match-group-pill">${groupLabel(match)}</span>
        <span class="matchday-label">${matchdayLabel(match)}</span>
      </div>
      <div class="match-card-body">
        <div class="match-card-team">
          <span class="match-card-flag">${flagContent(match.homeFlag, match.homeCode)}</span>
          <strong>${match.homeTeam}</strong>
          <small>${match.homeCode}</small>
        </div>
        <span class="match-vs">VS</span>
        <div class="match-card-team">
          <span class="match-card-flag">${flagContent(match.awayFlag, match.awayCode)}</span>
          <strong>${match.awayTeam}</strong>
          <small>${match.awayCode}</small>
        </div>
        <div class="match-card-score">${match.status === "upcoming" ? formatTime12(match.time) : matchResult(match)}</div>
      </div>
      <div class="match-card-footer">
        <span>${match.date} · ${formatTime12(match.time)}</span>
        <span>${match.stadium}</span>
      </div>
      <div class="match-card-actions">
        ${canWatch ? `<button class="watch-mini" type="button" data-play="match" data-id="${match.id}">${t("watch")}</button>` : ""}
      </div>
    </article>
  `;
}

export function createMatchFilters(active = "all") {
  return ["all", "live", "upcoming", "finished"]
    .map((status) => `<button class="chip ${active === status ? "active" : ""}" type="button" data-match-filter="${status}">${t(status)}</button>`)
    .join("");
}

export function filterMatches(matches, active) {
  if (active === "all") return matches;
  return matches.filter((match) => match.status === active);
}





