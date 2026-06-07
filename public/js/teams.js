function flagContent(value, label) {
  if (typeof value === "string" && /^https?:\/\//.test(value)) {
    return `<img src="${value}" alt="${label}" loading="lazy" />`;
  }
  return value || label;
}

function groupLabel(group) {
  return group ? `\u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0629 ${group}` : "";
}

export function renderTeamCard(team) {
  return `
    <article class="team-card">
      <span class="team-avatar">${flagContent(team.flag, team.code)}</span>
      <strong>${team.name}</strong>
      <small class="muted">${team.country} - ${team.code}</small>
      <small class="muted team-group">${groupLabel(team.group)}</small>
    </article>
  `;
}