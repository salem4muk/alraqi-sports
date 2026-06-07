const state = {
  token: localStorage.getItem("alraqi-admin-token") || "",
  store: null,
  matches: [],
  selectedMatchId: "",
  matchSearch: "",
  activeTab: "channels"
};

const byId = (id) => document.getElementById(id);

function uid(prefix) {
  if (crypto.randomUUID) return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function headers() {
  return {
    "content-type": "application/json",
    "x-admin-token": state.token
  };
}

function setNotice(message, type = "") {
  const notice = byId("notice");
  notice.textContent = message;
  notice.className = `notice ${type}`.trim();
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, { cache: "no-store", ...options });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || payload.error || `HTTP ${response.status}`);
  return payload;
}

function matchId(game) {
  return game.externalMatchId || (game.id != null ? `game-${game.id}` : String(game._id || game.match_id || game.matchId || ""));
}

function pickTeamName(game, side) {
  const values =
    side === "home"
      ? [game.home_team_name_ar, game.home_team_name_en, game.homeTeam, game.home_team_name_fa]
      : [game.away_team_name_ar, game.away_team_name_en, game.awayTeam, game.away_team_name_fa];
  const name = values.map((value) => String(value || "").trim()).find(Boolean) || "";
  if (!name || ["home", "away"].includes(name.toLowerCase())) return "لم يحدد";
  return name;
}

function matchDate(game) {
  return String(game.local_date || `${game.date || ""} ${game.time || ""}`.trim()).trim();
}

function matchLabel(game) {
  const home = pickTeamName(game, "home");
  const away = pickTeamName(game, "away");
  const date = matchDate(game);
  return `${home} ضد ${away}${date ? ` - ${date}` : ""}`;
}

function matchSearchText(game) {
  return `${matchLabel(game)} ${matchId(game)}`.toLowerCase();
}

function activeChannels() {
  return state.store?.channels || [];
}

function categories() {
  state.store ||= { categories: [], channels: [], matchLinks: [] };
  state.store.categories ||= [{ id: "sports", name: "sports", isActive: true, sortOrder: 10 }];
  return state.store.categories;
}

function categoryIdFromName(name) {
  return String(name || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06ff]+/gi, "-")
    .replace(/^-+|-+$/g, "") || `category-${Date.now()}`;
}

function categoryOptions(selected) {
  const list = categories().filter((category) => category.isActive !== false);
  return list
    .map((category) => `<option value="${escapeHtml(category.id)}" ${category.id === selected ? "selected" : ""}>${escapeHtml(category.name)}</option>`)
    .join("");
}

function renderStats() {
  const channels = state.store?.channels || [];
  byId("channelsCount").textContent = channels.length;
  byId("channelLinksCount").textContent = channels.reduce((total, channel) => total + (channel.links?.length || 0), 0);
  byId("matchLinksCount").textContent = state.store?.matchLinks?.length || 0;
  byId("statsGrid").hidden = false;
}

function renderMatchSelects() {
  const query = state.matchSearch.trim().toLowerCase();
  const selectedGame = state.matches.find((game) => matchId(game) === state.selectedMatchId);
  const matches = (query ? state.matches.filter((game) => matchSearchText(game).includes(query)) : state.matches).slice(0, 12);
  byId("matchSelect").value = state.selectedMatchId;
  byId("selectedMatch").textContent = selectedGame ? `المحدد: ${matchLabel(selectedGame)}` : "اختر مباراة من القائمة";
  byId("matchPickerList").innerHTML = matches.length
    ? matches.map((game) => renderMatchChoice(game, matchId(game) === state.selectedMatchId)).join("")
    : `<div class="empty compact-empty">لا توجد مباريات مطابقة</div>`;
  byId("matchLinkChannel").innerHTML = `<option value="">بدون قناة</option>${activeChannels()
    .map((channel) => `<option value="${channel.id}">${channel.name}</option>`)
    .join("")}`;
}

function renderCategories() {
  byId("categoryEditor").innerHTML = categories().length
    ? categories()
        .map(
          (category, index) => `
            <div class="category-chip ${category.isActive === false ? "muted-chip" : ""}">
              <input data-category="${index}" data-field="name" value="${escapeHtml(category.name)}" aria-label="اسم التصنيف" />
              <select data-category="${index}" data-field="isActive" aria-label="حالة التصنيف">
                <option value="true" ${category.isActive !== false ? "selected" : ""}>فعال</option>
                <option value="false" ${category.isActive === false ? "selected" : ""}>مخفي</option>
              </select>
              <button type="button" class="danger" data-remove-category="${index}">حذف</button>
            </div>
          `
        )
        .join("")
    : `<div class="empty compact-empty">لا توجد تصنيفات بعد</div>`;
}

function renderMatchChoice(game, active) {
  return `
    <button class="match-choice ${active ? "active" : ""}" type="button" data-pick-match="${escapeHtml(matchId(game))}">
      <span>${escapeHtml(pickTeamName(game, "home"))}</span>
      <strong>ضد</strong>
      <span>${escapeHtml(pickTeamName(game, "away"))}</span>
      <small>${escapeHtml(matchDate(game) || matchId(game))}</small>
    </button>
  `;
}

function renderChannels() {
  const channels = state.store?.channels || [];
  byId("channelsEditor").innerHTML = channels.length
    ? `
      <table class="channels-table">
        <thead>
          <tr>
            <th>اسم القناة</th>
            <th>التصنيف</th>
            <th>الشعار</th>
            <th>الترتيب</th>
            <th>الحالة</th>
            <th>الروابط</th>
            <th>إجراءات</th>
          </tr>
        </thead>
        <tbody>
          ${channels.map((channel, channelIndex) => renderChannelRow(channel, channelIndex)).join("")}
        </tbody>
      </table>
    `
    : `<div class="empty">لا توجد قنوات بعد</div>`;
}

function renderChannelRow(channel, channelIndex) {
  return `
    <tr class="channel-main-row">
      <td class="channel-name-cell">
        <input data-channel="${channelIndex}" data-field="name" value="${escapeHtml(channel.name)}" aria-label="اسم القناة" />
      </td>
      <td>
        <select data-channel="${channelIndex}" data-field="category" aria-label="التصنيف">
          ${categoryOptions(channel.category)}
        </select>
      </td>
      <td>
        <input data-channel="${channelIndex}" data-field="logo" value="${escapeHtml(channel.logo || "")}" aria-label="الشعار" />
      </td>
      <td>
        <input data-channel="${channelIndex}" data-field="sortOrder" type="number" value="${Number(channel.sortOrder || 0)}" aria-label="الترتيب" />
      </td>
      <td>
        <select data-channel="${channelIndex}" data-field="isActive" aria-label="حالة القناة">
          <option value="true" ${channel.isActive ? "selected" : ""}>فعالة</option>
          <option value="false" ${!channel.isActive ? "selected" : ""}>مخفية</option>
        </select>
      </td>
      <td>
        <span class="links-count">${channel.links?.length || 0} رابط</span>
      </td>
      <td class="actions-cell">
        <div class="channel-actions">
          <button type="button" data-add-channel-link="${channelIndex}">+ رابط</button>
          <button type="button" class="danger" data-remove-channel="${channelIndex}">حذف</button>
        </div>
      </td>
    </tr>
    <tr class="links-detail-row">
      <td colspan="7" class="links-detail-cell">
        <div class="links-detail-panel">
          <div class="links-detail-head">
            <span>روابط بث ${escapeHtml(channel.name)}</span>
            <button type="button" data-add-channel-link="${channelIndex}">+ إضافة رابط</button>
          </div>
          <div class="channel-link-stack">
            ${(channel.links || []).map((link, linkIndex) => renderChannelLink(channelIndex, linkIndex, link)).join("") || `<div class="empty compact-empty">لا توجد روابط لهذه القناة</div>`}
          </div>
        </div>
      </td>
    </tr>
  `;
}

function renderChannelLink(channelIndex, linkIndex, link) {
  const serverName = link.name || `سيرفر ${linkIndex + 1}`;
  return `
    <div class="channel-link-inline">
      <label>
        <span>اسم السيرفر</span>
        <input data-channel="${channelIndex}" data-link="${linkIndex}" data-field="name" value="${escapeHtml(serverName)}" placeholder="سيرفر 1 / سيرفر دقة عالية" />
      </label>
      <label>
        <span>رابط البث</span>
        <input data-channel="${channelIndex}" data-link="${linkIndex}" data-field="url" value="${escapeHtml(link.url || "")}" placeholder="https://example.com/live.m3u8" />
      </label>
      <label>
        <span>الجودة</span>
        <input data-channel="${channelIndex}" data-link="${linkIndex}" data-field="quality" value="${escapeHtml(link.quality || "HLS")}" placeholder="HD / FHD / HLS" />
      </label>
      <label>
        <span>الحالة</span>
        <select data-channel="${channelIndex}" data-link="${linkIndex}" data-field="isActive">
          <option value="true" ${link.isActive ? "selected" : ""}>فعال</option>
          <option value="false" ${!link.isActive ? "selected" : ""}>متوقف</option>
        </select>
      </label>
      <button type="button" class="danger remove-link-button" data-remove-channel-link="${channelIndex}:${linkIndex}" aria-label="حذف رابط السيرفر">×</button>
    </div>
  `;
}

function renderMatchLinks() {
  const links = state.store?.matchLinks || [];
  const matchById = new Map(state.matches.map((game) => [matchId(game), game]));
  byId("matchLinksEditor").innerHTML = links.length
    ? links
        .map((link, index) => {
          const game = matchById.get(link.matchId);
          return `
            <article class="editor-card">
              <span class="match-title">${game ? matchLabel(game) : link.matchId}</span>
              <div class="editor-grid">
                <label class="wide">
                  <span>معرّف المباراة</span>
                  <input data-match-link="${index}" data-field="matchId" value="${escapeHtml(link.matchId)}" />
                </label>
                <label>
                  <span>العنوان</span>
                  <input data-match-link="${index}" data-field="title" value="${escapeHtml(link.title)}" />
                </label>
                <label>
                  <span>الجودة</span>
                  <input data-match-link="${index}" data-field="quality" value="${escapeHtml(link.quality || "")}" />
                </label>
                <label class="wide">
                  <span>الرابط</span>
                  <input data-match-link="${index}" data-field="url" value="${escapeHtml(link.url)}" />
                </label>
                <label>
                  <span>النوع</span>
                  <input data-match-link="${index}" data-field="type" value="${escapeHtml(link.type || "m3u8")}" />
                </label>
                <label>
                  <span>الحالة</span>
                  <select data-match-link="${index}" data-field="isActive">
                    <option value="true" ${link.isActive ? "selected" : ""}>فعال</option>
                    <option value="false" ${!link.isActive ? "selected" : ""}>متوقف</option>
                  </select>
                </label>
              </div>
              <div class="row-actions">
                <button type="button" class="danger" data-remove-match-link="${index}">حذف الرابط</button>
              </div>
            </article>
          `;
        })
        .join("")
    : `<div class="empty">لا توجد روابط مباريات بعد</div>`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderTabs() {
  document.querySelectorAll("[data-admin-tab]").forEach((button) => {
    button.classList.toggle("active", button.dataset.adminTab === state.activeTab);
  });
  document.querySelectorAll("[data-admin-page]").forEach((page) => {
    page.classList.toggle("active", page.dataset.adminPage === state.activeTab);
  });
}

function renderAll() {
  renderStats();
  renderCategories();
  renderMatchSelects();
  renderChannels();
  renderMatchLinks();
  renderTabs();
  byId("adminLayout").hidden = false;
  byId("saveStore").disabled = false;
}

async function loadData() {
  state.token = byId("adminToken").value.trim();
  localStorage.setItem("alraqi-admin-token", state.token);
  setNotice("جاري تحميل البيانات...");

  const [storePayload, matchesPayload] = await Promise.all([
    fetchJson("/api/admin/store", { headers: headers() }),
    fetchJson("/api/matches?includeLinks=1")
  ]);

  state.store = storePayload.store || { channels: [], matchLinks: [] };
  state.matches = matchesPayload.games || [];
  renderAll();
  setNotice("تم تحميل البيانات بنجاح.", "success");
}

async function saveData() {
  setNotice("جاري حفظ التغييرات...");
  const payload = await fetchJson("/api/admin/store", {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify({ store: state.store })
  });
  state.store = payload.store;
  renderAll();
  setNotice("تم حفظ التغييرات وتحديث API.", "success");
}

function updateChannel(target) {
  const channel = state.store.channels[Number(target.dataset.channel)];
  if (!channel) return;
  const linkIndex = target.dataset.link;
  const targetObject = linkIndex == null ? channel : channel.links?.[Number(linkIndex)];
  if (!targetObject) return;
  targetObject[target.dataset.field] = target.dataset.field === "isActive" ? target.value === "true" : target.value;
  if (target.dataset.field === "sortOrder") targetObject.sortOrder = Number.parseInt(target.value, 10) || 0;
  renderStats();
  renderMatchSelects();
}

function updateCategory(target) {
  const category = categories()[Number(target.dataset.category)];
  if (!category) return;
  category[target.dataset.field] = target.dataset.field === "isActive" ? target.value === "true" : target.value;
  renderCategories();
  renderChannels();
  renderMatchSelects();
}

function fallbackCategoryId(exceptIndex = -1) {
  const fallback = categories().find((category, index) => index !== exceptIndex && category.isActive !== false) || categories().find((_, index) => index !== exceptIndex);
  return fallback?.id || "sports";
}

function updateMatchLink(target) {
  const link = state.store.matchLinks[Number(target.dataset.matchLink)];
  if (!link) return;
  link[target.dataset.field] = target.dataset.field === "isActive" ? target.value === "true" : target.value;
}

function bindEvents() {
  byId("adminToken").value = state.token;
  byId("loadStore").addEventListener("click", () => loadData().catch((error) => setNotice(error.message, "error")));
  byId("saveStore").addEventListener("click", () => saveData().catch((error) => setNotice(error.message, "error")));

  byId("categoryForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const name = byId("categoryName").value.trim();
    if (!name) {
      setNotice("اكتب اسم التصنيف أولًا.", "error");
      return;
    }
    const id = categoryIdFromName(name);
    if (categories().some((category) => category.id === id || category.name.trim().toLowerCase() === name.toLowerCase())) {
      setNotice("هذا التصنيف موجود بالفعل.", "error");
      return;
    }
    categories().push({
      id,
      name,
      isActive: true,
      sortOrder: (categories().length + 1) * 10
    });
    byId("categoryName").value = "";
    renderAll();
    setNotice("تمت إضافة التصنيف. لا تنس حفظ التغييرات.", "success");
  });

  byId("addChannel").addEventListener("click", () => {
    const defaultCategory = categories().find((category) => category.isActive !== false)?.id || "sports";
    state.store.channels.push({
      id: uid("channel"),
      name: "قناة جديدة",
      logo: "",
      category: defaultCategory,
      isActive: true,
      sortOrder: (state.store.channels.length + 1) * 10,
      links: []
    });
    renderAll();
  });

  byId("matchLinkForm").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!byId("matchSelect").value) {
      setNotice("اختر مباراة أولًا من نتائج البحث.", "error");
      byId("matchSearch").focus();
      return;
    }
    state.store.matchLinks.push({
      id: uid("match-link"),
      matchId: byId("matchSelect").value,
      title: byId("matchLinkTitle").value.trim(),
      url: byId("matchLinkUrl").value.trim(),
      type: byId("matchLinkType").value,
      quality: byId("matchLinkQuality").value.trim() || "HLS",
      language: byId("matchLinkLanguage").value.trim() || "ar",
      channelId: byId("matchLinkChannel").value,
      isActive: true,
      sortOrder: state.store.matchLinks.length * 10
    });
    event.currentTarget.reset();
    state.matchSearch = "";
    byId("matchSearch").value = "";
    byId("matchSelect").value = state.selectedMatchId;
    byId("matchLinkQuality").value = "HLS";
    byId("matchLinkLanguage").value = "ar";
    renderAll();
  });

  document.body.addEventListener("input", (event) => {
    if (event.target.id === "matchSearch") {
      state.matchSearch = event.target.value;
      renderMatchSelects();
    }
    if (event.target.matches("[data-channel]")) updateChannel(event.target);
    if (event.target.matches("[data-category]")) updateCategory(event.target);
    if (event.target.matches("[data-match-link]")) updateMatchLink(event.target);
  });

  document.body.addEventListener("change", (event) => {
    if (event.target.matches("[data-channel]")) updateChannel(event.target);
    if (event.target.matches("[data-category]")) updateCategory(event.target);
    if (event.target.matches("[data-match-link]")) updateMatchLink(event.target);
  });

  document.body.addEventListener("click", (event) => {
    const adminTab = event.target.closest("[data-admin-tab]");
    if (adminTab) {
      state.activeTab = adminTab.dataset.adminTab;
      renderTabs();
    }

    const pickMatch = event.target.closest("[data-pick-match]");
    if (pickMatch) {
      state.selectedMatchId = pickMatch.dataset.pickMatch;
      state.matchSearch = "";
      byId("matchSearch").value = "";
      renderMatchSelects();
    }

    const removeChannel = event.target.closest("[data-remove-channel]");
    if (removeChannel) {
      state.store.channels.splice(Number(removeChannel.dataset.removeChannel), 1);
      renderAll();
    }

    const removeCategory = event.target.closest("[data-remove-category]");
    if (removeCategory) {
      const index = Number(removeCategory.dataset.removeCategory);
      const removed = categories()[index];
      const fallbackId = fallbackCategoryId(index);
      state.store.channels.forEach((channel) => {
        if (channel.category === removed?.id) channel.category = fallbackId;
      });
      categories().splice(index, 1);
      if (!categories().length) categories().push({ id: "sports", name: "sports", isActive: true, sortOrder: 10 });
      renderAll();
    }

    const addChannelLink = event.target.closest("[data-add-channel-link]");
    if (addChannelLink) {
      const channel = state.store.channels[Number(addChannelLink.dataset.addChannelLink)];
      channel.links ||= [];
      channel.links.push({
        id: uid("channel-link"),
        name: `سيرفر ${channel.links.length + 1}`,
        url: "",
        type: "m3u8",
        quality: "HLS",
        isActive: true,
        sortOrder: channel.links.length * 10
      });
      renderAll();
    }

    const removeChannelLink = event.target.closest("[data-remove-channel-link]");
    if (removeChannelLink) {
      const [channelIndex, linkIndex] = removeChannelLink.dataset.removeChannelLink.split(":").map(Number);
      state.store.channels[channelIndex]?.links?.splice(linkIndex, 1);
      renderAll();
    }

    const removeMatchLink = event.target.closest("[data-remove-match-link]");
    if (removeMatchLink) {
      state.store.matchLinks.splice(Number(removeMatchLink.dataset.removeMatchLink), 1);
      renderAll();
    }
  });
}

bindEvents();
