// Модуль 12-boot. Инициализация: каркас, навигация, типы, делегирование, свайп, назад.
"use strict";
function renderNav() {
  $("#nav").innerHTML = STATE_ORDER.map(k => {
    const cnt = itemsOf(k).length;
    return `<button class="tabitem ${S.view === k ? "on" : ""}" data-nav="${k}"><span class="nic">${STATE_ICON[k]}</span><span class="nlb">${STATE_NAME[k]}${cnt ? ` · ${cnt}` : ""}</span></button>`;
  }).join("");
}
function renderTypes() {
  $("#typeselwrap").innerHTML = `<span class="flabel" style="width:auto">Тип</span>
    <select class="m3" id="typesel" aria-label="Тип медиа">${S.types.map((t, i) => `<option value="${i}" ${S.type === i ? "selected" : ""}>${esc(t.name)}</option>`).join("")}</select>
    <button class="iconbtn inline" id="typemgr" title="Типы медиа">${ICON.menu}</button>`;
  $("#typesel").onchange = e => { S.type = +e.target.value; activeTagFilter = []; save(); renderCurrent(); };
  $("#typemgr").onclick = () => openTypeManager();
}
function renderAll() { renderNav(); renderTypes(); renderCurrent(); }
function setView(v) { S.view = v; S.q = $("#q").value = ""; activeTagFilter = []; save(); renderNav(); renderTypes(); renderCurrent(); scrollTo({top: 0}); }
if (location.search.includes("reset=1") && location.hash !== "#cleared") {
  try { localStorage.removeItem("md1.state"); } catch (e) {}
  location.hash = "#cleared";
  location.reload();
} else {
function boot() {
  document.getElementById("app").innerHTML = `
  <header class="topbar">
    <h1>Медиа <b>дневник</b></h1><div class="spacer"></div>
    <button class="iconbtn" id="bstats" title="Статистика" aria-label="Статистика">${ICON.stats}</button>
    <button class="iconbtn" id="bset" title="Настройки" aria-label="Настройки"><svg viewBox="0 0 24 24"><path d="M19.14 12.94a7.07 7.07 0 0 0 .05-.94 7.07 7.07 0 0 0-.05-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.61-.22l-2.39.96a7.03 7.03 0 0 0-1.62-.94l-.36-2.54A.5.5 0 0 0 13.9 2h-3.8a.5.5 0 0 0-.49.42l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96a.5.5 0 0 0-.61.22L2.71 8.84a.5.5 0 0 0 .12.64l2.03 1.58a7.07 7.07 0 0 0 0 1.88l-2.03 1.58a.5.5 0 0 0-.12.64l1.92 3.32c.14.24.42.34.61.22l2.39-.96c.49.38 1.03.7 1.62.94l.36 2.54a.5.5 0 0 0 .49.42h3.8a.5.5 0 0 0 .49-.42l.36-2.54a7.03 7.03 0 0 0 1.62-.94l2.39.96c.23.09.47 0 .61-.22l1.92-3.32a.5.5 0 0 0-.12-.64zM12 15.6A3.6 3.6 0 1 1 15.6 12 3.6 3.6 0 0 1 12 15.6z"/></svg></button>
    <div class="searchbox wide"><svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z"/></svg>
      <input id="q" type="search" placeholder="Поиск…" aria-label="Поиск"></div>
  </header>
  <nav class="tabbar" id="nav" aria-label="Состояния"></nav>
  <main>
    <div id="typeselwrap" class="frow" style="margin-bottom:10px"></div>
    <div class="viewhead" id="viewhead"></div>
    <div id="extra"></div>
    <div class="headrow"><span class="grow"></span><span id="count" style="font-size:13px;color:var(--on-surface-var);font-weight:700"></span></div>
    <div id="listbox"></div>
  </main>
  <div class="footer-note">Полностью офлайн · заметки в .md · экспорт .md/.xlsx · своя оценка и обложка · парсер по ссылке</div>
  <div id="scim" class="scim"></div><div id="sheet" class="sheet" role="dialog" aria-modal="true"></div>
  <div id="toast"></div>`;
  const q = $("#q");
  let qt; q.addEventListener("input", () => { clearTimeout(qt); qt = setTimeout(() => { S.q = q.value.trim(); renderCurrent(); }, 250); });
  $("#bset").onclick = openSettings;
  $("#bstats").onclick = openStats;
  $("#scim").onclick = closeSheet;
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeSheet(); });
  $("#nav").onclick = e => { const c = e.target.closest("[data-nav]"); if (c) setView(c.dataset.nav); };
  document.getElementById("app").addEventListener("click", e => {
    const b = e.target.closest("[data-act]"); if (!b || e.target.closest("a")) return;
    const id = b.dataset.id; const g = typeItems()[id];
    if (b.dataset.act === "open") openSheet(id);
    else if (b.dataset.act === "copy") { e.stopPropagation(); copyTitle(g); }
    else if (b.dataset.act === "done") { e.stopPropagation(); setState(id, "done"); S.plays[id] = Math.max(1, S.plays[id] || 1); renderNav(); renderCurrent(true); }
    else if (b.dataset.act === "drop") { e.stopPropagation(); setState(id, (g.state || "backlog") === "dropped" ? "backlog" : "dropped"); renderNav(); renderCurrent(true); }
    else if (b.dataset.act === "moveactive") { e.stopPropagation(); setState(id, "active"); renderNav(); renderCurrent(true); }
  });
  const sh = $("#sheet"); let sy = 0, dy = 0, drag = false;
  sh.addEventListener("touchstart", e => { if (sh.scrollTop > 2) return; sy = e.touches[0].clientY; dy = 0; drag = true; sh.classList.add("sheet-dragging"); }, {passive: true});
  sh.addEventListener("touchmove", e => { if (!drag) return; dy = Math.max(0, e.touches[0].clientY - sy); if (dy) { sh.style.transform = `translateY(${dy}px)`; sh.style.opacity = String(1 - Math.min(.5, dy / 600)); } }, {passive: true});
  sh.addEventListener("touchend", () => { if (!drag) return; drag = false; sh.classList.remove("sheet-dragging"); sh.style.transform = ""; sh.style.opacity = ""; if (dy > 110) closeSheet(); }, {passive: true});
  /* ── Свайп между вкладками состояний (как в Telegram), порог против скролла ── */
  const lb = $("#listbox");
  let tsx = 0, tsy = 0, tdx = 0, tdy = 0, tabDrag = false;
  lb.addEventListener("touchstart", e => { const t = e.touches[0]; tsx = t.clientX; tsy = t.clientY; tdx = 0; tdy = 0; tabDrag = true; }, {passive: true});
  lb.addEventListener("touchmove", e => { if (!tabDrag) return; const t = e.touches[0]; tdx = t.clientX - tsx; tdy = t.clientY - tsy; }, {passive: true});
  lb.addEventListener("touchend", () => {
    if (!tabDrag) return; tabDrag = false;
    if (Math.abs(tdx) < 60 || Math.abs(tdx) <= 2 * Math.abs(tdy)) return;
    const i = STATE_ORDER.indexOf(S.view);
    if (i < 0) return;
    const j = tdx < 0 ? (i + 1) % STATE_ORDER.length : (i + STATE_ORDER.length - 1) % STATE_ORDER.length;
    lb.classList.add(tdx < 0 ? "swipe-l" : "swipe-r");
    setTimeout(() => { lb.classList.remove("swipe-l", "swipe-r"); setView(STATE_ORDER[j]); }, 140);
  }, {passive: true});
  window.__back = function () { if ($("#sheet").classList.contains("on")) { closeSheet(); return "1"; } return "0"; };
  applyTheme(); renderAll();
}
window.addEventListener("DOMContentLoaded", boot);
window.QA = {
  get S() { return S; }, set S(v) { S = v; },
  get IDX() { return null; },
  setView, renderNav, renderCurrent, renderTypes, save, parsePage, openItemForm, openTypeManager,
  openStats, openSheet, closeSheet, exportListMD, exportListXLSX, importNoteMD, exportNoteMD,
  setState, itemsOf, filteredRows, toggleItemTag, createTag, deleteTag, stateOf,
  addPlay, playCount, lastPlayDate, sumHours, todayISO
};
}
