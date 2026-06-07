import { formatTime12 } from "./matches.js?v=next-21";

const searchableText = (value) =>
  Object.values(value)
    .filter((item) => typeof item === "string" || typeof item === "number")
    .join(" ")
    .toLowerCase();

export function globalSearch(query, data) {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];

  const buckets = [
    ...data.teams.map((item) => ({ type: "team", title: item.name, subtitle: item.group ? `المجموعة ${item.group}` : "", item })),
    ...data.games.map((item) => ({ type: "match", title: `${item.homeTeam} × ${item.awayTeam}`, subtitle: `${formatTime12(item.time)} · ${item.stadium}`, item })),
    ...data.channels.map((item) => ({ type: "channel", title: item.name, subtitle: item.category, item })),
    ...data.stadiums.map((item) => ({ type: "stadium", title: item.name, subtitle: `${item.city}, ${item.country}`, item }))
  ];

  return buckets.filter((entry) => searchableText(entry).includes(needle)).slice(0, 8);
}





