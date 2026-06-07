import { t } from "./i18n.js?v=next-21";

export const channelCategories = ["all", "sports"];

function renderChannelLogo(channel) {
  const number = String(channel.name || "").match(/(\d+)$/)?.[1] || channel.logo || "";
  if (String(channel.name || "").toLowerCase().includes("bein")) {
    return `
      <span class="channel-logo bein-logo" aria-label="${channel.name}">
        <span class="bein-word">beIN</span>
        <span class="bein-sport">SPORTS ${number}</span>
      </span>
    `;
  }
  return `<span class="channel-logo">${channel.logo || "TV"}</span>`;
}

export function renderChannelCard(channel) {
  return `
    <article class="channel-card">
      <div class="card-head">
        ${renderChannelLogo(channel)}
      </div>
      <div>
        <strong>${channel.name}</strong>
        <small class="muted">${t(channel.category, channel.category)}</small>
      </div>
      <button class="watch-mini" type="button" data-play="channel" data-id="${channel.id}">${t("watch")}</button>
    </article>
  `;
}

export function createChannelFilters(active = "all") {
  return channelCategories
    .map((category) => `<button class="chip ${active === category ? "active" : ""}" type="button" data-channel-filter="${category}">${t(category)}</button>`)
    .join("");
}

export function filterChannels(channels, active) {
  if (active === "all") return channels;
  return channels.filter((channel) => channel.category === active);
}





