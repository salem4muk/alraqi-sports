import { t } from "./i18n.js?v=next-21";

export function renderStandings(groups) {
  return groups
    .map(
      (group) => `
      <section class="standing-table">
        <div class="standing-title">${group.name}</div>
        <div class="standing-row header">
          <span>#</span>
          <span>${t("teams")}</span>
          <span>لعب</span>
          <span>ف</span>
          <span>ت</span>
          <span>خ</span>
          <span>أهداف</span>
          <span>ن</span>
        </div>
        ${(group.rows || [])
          .map(
            (row, index) => `
          <div class="standing-row">
            <strong>${index + 1}</strong>
            <strong>${row.team}</strong>
            <span>${row.played}</span>
            <span>${row.wins}</span>
            <span>${row.draws}</span>
            <span>${row.losses}</span>
            <span>${row.goals || `${row.goalsFor || 0}:${row.goalsAgainst || 0}`}</span>
            <strong>${row.points}</strong>
          </div>
        `
          )
          .join("")}
      </section>
    `
    )
    .join("");
}

export function renderStadiumCard(stadium) {
  const media = stadium.image
    ? `<img src="${stadium.image}" alt="${stadium.name}" loading="lazy" onerror="this.closest('.stadium-image').classList.add('image-error'); this.remove();" />`
    : `<svg viewBox="0 0 24 24"><path d="M4 12c0-4 4-7 8-7s8 3 8 7-4 7-8 7-8-3-8-7Z" /><path d="M4 12h16" /><path d="M8 8h8" /></svg>`;
  const meta = [stadium.city, stadium.country].filter(Boolean).join(", ");
  const details = [meta, Number(stadium.capacity).toLocaleString()].filter(Boolean).join(" - ");
  const secondary = [stadium.officialName, stadium.region].filter(Boolean).join(" - ");

  return `
    <article class="stadium-card">
      <div class="stadium-image">
        ${media}
      </div>
      <strong>${stadium.name}</strong>
      <small class="muted">${details}</small>
      <span class="stadium-meta">${secondary}</span>
    </article>
  `;
}





