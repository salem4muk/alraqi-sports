import { t } from "./i18n.js?v=next-22";

let currentItem = null;
let currentServer = null;
let hlsInstance = null;
let mpegtsInstance = null;

const sheet = () => document.getElementById("playerSheet");
const video = () => document.getElementById("videoPlayer");
const title = () => document.getElementById("playerTitle");
const meta = () => document.getElementById("playerMeta");
const state = () => document.getElementById("streamState");
const serverRow = () => document.getElementById("serverRow");

function destroyHls() {
  if (hlsInstance) {
    hlsInstance.destroy();
    hlsInstance = null;
  }
  if (mpegtsInstance) {
    mpegtsInstance.pause();
    mpegtsInstance.unload();
    mpegtsInstance.detachMediaElement();
    mpegtsInstance.destroy();
    mpegtsInstance = null;
  }
}

function getServers(item) {
  if (Array.isArray(item.servers) && item.servers.length) return item.servers;
  return [{ name: "Server 1", url: item.streamUrl, quality: item.streamUrl?.includes(".m3u8") ? "HLS" : "MP4" }];
}

function loadSource(server) {
  destroyHls();
  const player = video();
  const streamUrl = server.url;
  const streamType = String(server.type || "").toLowerCase();
  const isHls = streamType === "m3u8" || streamType === "hls" || streamUrl?.includes(".m3u8");
  const isDirectTs =
    streamType === "mpegts" ||
    streamType === "ts" ||
    (!streamUrl?.includes(".m3u8") && /\/\d+(?:\?.*)?$/.test(streamUrl || ""));
  currentServer = server;
  state().textContent = t("loading");
  meta().textContent = `${server.name} · ${server.quality || ""}`;

  if (!streamUrl) {
    state().textContent = "No stream";
    return;
  }

  if (streamType === "external") {
    state().textContent = "Opening external stream";
    window.open(streamUrl, "_blank", "noopener,noreferrer");
    return;
  }

  if (isDirectTs && window.mpegts?.getFeatureList?.().mseLivePlayback) {
    mpegtsInstance = window.mpegts.createPlayer(
      {
        type: "mpegts",
        isLive: true,
        url: streamUrl
      },
      {
        enableWorker: true,
        liveBufferLatencyChasing: true
      }
    );
    mpegtsInstance.attachMediaElement(player);
    mpegtsInstance.load();
    player.onloadedmetadata = () => {
      state().textContent = t("ready");
      mpegtsInstance?.play().catch(() => {});
    };
    mpegtsInstance.on(window.mpegts.Events.ERROR, () => {
      state().textContent = "Stream error";
    });
  } else if (isHls && window.Hls?.isSupported()) {
    hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
    hlsInstance.loadSource(streamUrl);
    hlsInstance.attachMedia(player);
    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, () => {
      state().textContent = t("ready");
      player.play().catch(() => {});
    });
    hlsInstance.on(window.Hls.Events.ERROR, (_, data) => {
      state().textContent = data.fatal ? "Stream error" : t("loading");
    });
  } else {
    player.src = streamUrl;
    player.onloadedmetadata = () => {
      state().textContent = t("ready");
      player.play().catch(() => {});
    };
  }
}

function renderServers(item) {
  const servers = getServers(item);
  serverRow().innerHTML = servers
    .map((server, index) => `<button class="${index === 0 ? "active" : ""}" type="button" data-server-index="${index}">${server.name} · ${server.quality || ""}</button>`)
    .join("");
  serverRow().querySelectorAll("[data-server-index]").forEach((button) => {
    button.addEventListener("click", () => {
      serverRow().querySelectorAll("button").forEach((entry) => entry.classList.remove("active"));
      button.classList.add("active");
      loadSource(servers[Number(button.dataset.serverIndex)]);
    });
  });
  loadSource(servers[0]);
}

export function openPlayer(item) {
  currentItem = item;
  title().textContent = item.title || item.name || `${item.homeTeam} × ${item.awayTeam}`;
  sheet().classList.add("open");
  sheet().setAttribute("aria-hidden", "false");
  renderServers(item);
}

export function closePlayer() {
  destroyHls();
  const player = video();
  player.pause();
  player.removeAttribute("src");
  player.load();
  currentItem = null;
  sheet().classList.remove("open");
  sheet().setAttribute("aria-hidden", "true");
}

export function initPlayer() {
  document.getElementById("closePlayer").addEventListener("click", closePlayer);
  document.getElementById("reloadStream").addEventListener("click", () => currentServer && loadSource(currentServer));
  document.getElementById("pipButton").addEventListener("click", async () => {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
    } else if (document.pictureInPictureEnabled) {
      await video().requestPictureInPicture();
    }
  });
  document.getElementById("fullscreenButton").addEventListener("click", () => {
    const player = video();
    if (document.fullscreenElement) document.exitFullscreen();
    else player.requestFullscreen?.();
  });
  sheet().addEventListener("click", (event) => {
    if (event.target === sheet()) closePlayer();
  });
}





