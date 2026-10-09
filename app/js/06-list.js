// Модуль 06-list. Рендер списков: grid / vlist / compact (только название+год), фильтр по тегам.
"use strict";
let activeTagFilter = [];
function filteredRows() {
  let rows = itemsOf(S.view).slice();
  if (S.q) { const q = S.q.toLowerCase();
    rows = rows.filter(g => Object.values(g).join(" ").toLowerCase().includes(q)); }
  if (activeTagFilter.length)
    rows = rows.filter(g => (S.itemTags[g.id] || []).some(t => activeTagFilter.includes(t)));
  const cmp = {
    added: (a, b) => (b.added || 0) - (a.added || 0),
    title: (a, b) => a.title.localeCompare(b.title, "ru"),
    score: (a, b) => (S.myScore[b.id] || 0) - (S.myScore[a.id] || 0),
    year: (a, b) => (b.year || 0) - (a.year || 0),
    done: (a, b) => (lastPlayDate(b.id) || "").localeCompare(lastPlayDate(a.id) || ""),
    hours: (a, b) => sumHours(b.id) - sumHours(a.id),
    plays: (a, b) => playCount(b.id) - playCount(a.id)
  }[S.sort];
  return rows.sort(cmp);
}
function renderCurrent() {
  const head = $("#viewhead"), box = $("#listbox"), extra = $("#extra");
  extra.innerHTML = ""; $("#listbox").innerHTML = "";
  $("#typeselwrap").style.display = "flex";
  const rows = filteredRows();
  $("#count").textContent = rows.length ? `${rows.length} шт.` : "";
  head.innerHTML = `<h2>${esc(STATE_NAME[S.view])}${S.q ? `: «${esc(S.q)}»` : ""}</h2>
    <p>${{backlog: "Отложено на потом — из парсера или вручную.", active: "Прямо сейчас читаете, смотрите или играете.", done: "Завершённое: просмотрено, прочитано, пройдено.", dropped: "Брошено — можно вернуться в любой момент."}[S.view]}</p>`;
  if (S.view === "backlog") {
    extra.innerHTML = `<div class="dbtns" style="margin-bottom:12px">
      <button class="btn primary" id="addmine">${ICON.plus}Добавить</button>
      <button class="btn tonal" id="expmd">${ICON.copy}Экспорт .md</button>
      <button class="btn tonal" id="expxls">${ICON.copy}Экспорт .xlsx</button></div>`;
    $("#addmine").onclick = () => openItemForm();
    $("#expmd").onclick = () => exportListMD();
    $("#expxls").onclick = () => exportListXLSX();
  }
  renderTagFilter(extra);
  if (!rows.length) {
    box.innerHTML = `<div class="empty">${ICON.sad}<div>${{backlog: "Пусто. Добавьте что-то в планы — вручную или парсером.", active: "Ничего в процессе. Отметьте элемент из «В планах».", done: "Завершённых пока нет.", dropped: "Брошенных нет — и это прекрасно."}[S.view]}</div></div>`;
    return;
  }
  if (S.layout === "compact") {
    box.innerHTML = `<div class="rowslist">
      <div class="rowhead"><span>Название</span><span>Год</span><span>Оценка</span><span>Теги</span></div>
      ${rows.map(compactHTML).join("")}</div>`;
    return;
  }
  if (S.layout === "table") {
    const cols = [["title", "Название", ""], ["year", "Год", "right"], ["score", "Оценка", "right"],
      ["done", "Дата", "right"], ["hours", "Часы", "right"], ["plays", "Кол-во", "center"]];
    box.innerHTML = `<div class="tablelist">
      <div class="thead">${cols.map(([k, n, al]) =>
        `<button class="tcol ${S.sort === k ? "on" : ""}" data-sort="${k}" ${al ? `style="text-align:${al}"` : ""}>${n}</button>`).join("")}</div>
      ${rows.map(tableHTML).join("")}</div>`;
    box.querySelector(".thead").onclick = e => { const b = e.target.closest("[data-sort]"); if (!b) return;
      S.sort = b.dataset.sort; save(); renderCurrent(); };
    return;
  }
  box.innerHTML = S.layout === "grid"
    ? `<div class="grid">${rows.map(cardHTML).join("")}</div>`
    : `<div class="vlist">${rows.map(vcardHTML).join("")}</div>`;
}
function renderTagFilter(extra) {
  if (!S.tags.length) return;
  const wrap = document.createElement("div");
  wrap.className = "frow";
  wrap.style.marginBottom = "10px";
  wrap.innerHTML = `<span class="flabel" style="width:auto">Теги</span><div class="gchips" id="tagfilter">
    ${S.tags.map(t => `<button class="tagchip-btn ${activeTagFilter.includes(t.id) ? "on" : ""}" data-t="${t.id}">
      <span class="tagchip sm" style="background:${t.color};border-radius:${{round:"99px",square:"4px",diamond:"2px",flag:"99px 4px 4px 99px"}[tagShape()] || "99px"}">${esc(t.name)}</span></button>`).join("")}
    ${activeTagFilter.length ? `<button class="linkbtn" id="tagclear">сбросить</button>` : ""}</div>`;
  extra.appendChild(wrap);
  wrap.querySelector("#tagfilter").onclick = e => {
    const b = e.target.closest("[data-t]"); if (!b) return;
    const t = b.dataset.t;
    const i = activeTagFilter.indexOf(t);
    i < 0 ? activeTagFilter.push(t) : activeTagFilter.splice(i, 1);
    renderCurrent();
  };
  const cl = wrap.querySelector("#tagclear");
  if (cl) cl.onclick = () => { activeTagFilter = []; renderCurrent(); };
}
