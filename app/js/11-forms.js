// Модуль 11-boot. Форма элемента (с парсером), настройки, применение темы, инициализация.
"use strict";
function openItemForm(id) {
  const g = id ? typeItems()[id] : null;
  const fields = (curType().fields || []).filter(k => k !== "why");
  window.__parsedCover = g && S.customCovers[id] ? S.customCovers[id] : null;
  $("#sheet").innerHTML = `<div class="grabber"></div><h2 class="dtitle">${g ? "Изменить — " + esc(curType().name) : "Добавить — " + esc(curType().name)}</h2>
    <div class="fbody" style="padding:0">
      <label class="nfield"><span>Парсер: ссылка на Steam / Kinopoisk / MyAnimeList / любой сайт</span>
        <div class="frow" style="flex-wrap:nowrap"><input class="ninput" id="curl" placeholder="https://…" style="flex:1">
        <button class="btn tonal" id="cparse" style="flex:none">Заполнить</button></div>
        <span class="hint" id="cparsest" style="font-weight:400"></span></label>
      ${fields.map(k => `<label class="nfield"><span>${esc(fieldLabel(k))}</span><input class="ninput" data-k="${k}" value="${g && g[k] != null ? esc(String(g[k])) : ""}"></label>`).join("")}
      <label class="nfield"><span>Описание</span><textarea id="cwhy" rows="3">${g ? esc(g.why || "") : ""}</textarea></label>
    </div>
    <div class="dbtns"><button class="btn primary" id="csave">${ICON.check}Сохранить</button><button class="btn ghost" id="ccancel">Отмена</button></div>`;
  $("#ccancel").onclick = () => { closeSheet(); if (id) openSheet(id); };
  $("#cparse").onclick = async () => {
    const url = $("#curl").value.trim(); const st = $("#cparsest");
    if (!url) { st.textContent = "Вставьте ссылку"; return; }
    st.textContent = "Загружаю через парсер…";
    try {
      const info = await parsePage(url);
      const set = (k, v) => { const el = $("#sheet").querySelector(`[data-k="${k}"]`); if (el && v) el.value = v; };
      set("title", info.title); set("year", info.year); set("creator", info.creator); set("duration", info.duration);
      $("#cwhy").value = info.why || $("#cwhy").value;
      if (info.cover) { window.__parsedCover = info.cover; st.textContent = "Найдено: " + (info.title || "данные") + " — проверьте поля, обложка приложится"; }
      else st.textContent = "Страница открыта — недостающее заполните вручную";
    } catch (e) { st.textContent = "Парсер недоступен (" + e.message + ") — заполните вручную"; }
  };
  $("#csave").onclick = () => {
    const title = $("#sheet").querySelector('[data-k="title"]').value.trim();
    if (!title) { toast("Введите название"); return; }
    const nid = id || ("u" + Date.now().toString(36));
    const arr = S.items[curType().name] = S.items[curType().name] || {};
    if (window.__parsedCover) S.customCovers[nid] = window.__parsedCover;
    const item = {id: nid, title, state: id ? (g.state || "backlog") : (S.view === "dropped" ? "backlog" : S.view || "backlog"), added: (g && g.added) || Date.now(), why: $("#cwhy").value.trim()};
    for (const k of fields) { const v = $("#sheet").querySelector(`[data-k="${k}"]`).value.trim(); if (v) item[k] = !isNaN(+v) && k !== "duration" && k !== "title" ? +v : v; }
    arr[nid] = item; save();
    toast(id ? "Обновлено" : "Добавлено"); closeSheet(); renderNav(); renderCurrent(true);
  };
  $("#scim").classList.add("on"); $("#sheet").classList.add("on");
  document.body.style.overflow = "hidden";
}
function openSettings() {
  $("#sheet").innerHTML = `<div class="grabber"></div><h2 class="dtitle" style="margin-bottom:14px">Настройки</h2>
  <div class="setrow"><div class="sl"><b>Тема</b></div>
    <select class="m3" id="stheme"><option value="dark" ${S.theme === "dark" ? "selected" : ""}>Тёмная</option><option value="light" ${S.theme === "light" ? "selected" : ""}>Светлая</option></select></div>
  <div class="setrow"><div class="sl"><b>Типы медиа</b><span>включение, отключение, редактирование, свои типы</span></div>
    <button class="btn tonal" id="stypes">Настроить</button></div>
  <div class="setrow"><div class="sl"><b>Теги</b><span>создание, редактирование, цвета</span></div>
    <button class="btn tonal" id="stags">Настроить</button></div>
  <div class="setrow"><div class="sl"><b>Сортировка списков</b></div>
    <select class="m3" id="ssort"><option value="added" ${S.sort === "added" ? "selected" : ""}>По добавлению</option><option value="title" ${S.sort === "title" ? "selected" : ""}>По названию</option><option value="score" ${S.sort === "score" ? "selected" : ""}>По моей оценке</option><option value="done" ${S.sort === "done" ? "selected" : ""}>По дате прохождения</option><option value="year" ${S.sort === "year" ? "selected" : ""}>По годам</option></select></div>
  <div class="setrow"><div class="sl"><b>Вид карточек</b><span>сетка / список / компактный / таблица</span></div>
    <div class="modeseg" id="slayout"><button data-l="grid" aria-pressed="${S.layout === "grid"}">Сетка</button><button data-l="list" aria-pressed="${S.layout === "list"}">Список</button><button data-l="compact" aria-pressed="${S.layout === "compact"}">Компакт</button><button data-l="table" aria-pressed="${S.layout === "table"}">Таблица</button></div></div>
  <div class="setrow"><div class="sl"><b>Резервная копия</b><span>всё состояние в JSON</span></div>
    <button class="btn tonal" id="sexp">Экспорт</button><button class="btn ghost" id="simp">Импорт</button><input type="file" id="sfile" accept=".json" style="display:none"></div>
  <div class="setrow"><div class="sl"><b>О приложении</b><span>Медиа дневник v1.2 · офлайн · парсер по ссылке · .md и .xlsx · прохождения и таблица</span></div></div>`;
  $("#stheme").onchange = e => { S.theme = e.target.value; save(); applyTheme(); };
  $("#ssort").onchange = e => { S.sort = e.target.value; save(); renderCurrent(); };
  $("#stypes").onclick = () => openTypeManager();
  $("#stags").onclick = () => openTagManager();
  $("#slayout").onclick = e => { const b = e.target.closest("button"); if (!b) return; S.layout = b.dataset.l; save(); openSettings(); renderCurrent(); };
  $("#sexp").onclick = () => window.downloadFile("media-diary-backup.json", JSON.stringify(S, null, 1), "application/json");
  $("#simp").onclick = () => $("#sfile").click();
  $("#sfile").onchange = e => { const f = e.target.files[0]; if (!f) return;
    const r = new FileReader(); r.onload = () => { try { const o = JSON.parse(r.result); S = Object.assign({}, DEF, o);
      save(); toast("Импортировано"); closeSheet(); renderAll(); } catch (x) { toast("Файл не распознан"); } }; r.readAsText(f); };
  $("#scim").classList.add("on"); $("#sheet").classList.add("on");
  document.body.style.overflow = "hidden";
}
function applyTheme() {
  document.documentElement.dataset.theme = S.theme === "light" ? "light" : "dark";
  document.querySelector('meta[name="theme-color"]').content = S.theme === "light" ? "#FCF8FF" : "#121318";
}
