// Модуль 07-sheet. Шторка: детали, обе оценки, теги, состояния, заметки, экспорт.
"use strict";
let curG = null;
const fmtPlayDate = d => String(d).split("-").reverse().join(".");
function playsHTML(id) {
  const arr = S.playLog[id] || [];
  if (!arr.length) return `<div class="pempty">Записей нет — добавьте дату ниже.</div>`;
  return arr.map((p, i) => `<div class="pitem"><span class="pd">${fmtPlayDate(p.d)}</span><span class="ph">${p.h ? p.h + " ч" : "—"}</span>
    <button data-pdel="${i}" title="Удалить запись">${ICON.trash}</button></div>`).join("");
}
function openSheet(id) {
  const g = typeItems()[id]; if (!g) return; curG = g;
  const st = g.state || "backlog";
  const ms = S.myScore[id];
  const fields = (curType().fields || []).filter(k => !["title", "why", "year"].includes(k) && g[k] != null && g[k] !== "");
  $("#sheet").innerHTML = `<div class="grabber"></div>
  <div class="dhead"><div class="covwrap">${imgTag(g)}${st === "done" ? `<span class="donebadge">${ICON.check}Завершено</span>` : ""}${st === "active" ? `<span class="rotbadge">${ICON.play}В процессе</span>` : ""}${st === "dropped" ? `<span class="donebadge dropb">${ICON.drop}Брошено</span>` : ""}${g.score ? `<span class="scorebadge">${ICON.star}${g.score}</span>` : ""}${ms ? `<span class="myscorebadge">★ ${ms}/10</span>` : ""}<span class="covertags">${itemTagsHTML(id, true)}</span></div>
    <div><h2 class="dtitle">${esc(g.title)} <button class="iconbtn inline" data-act="copy" data-id="${id}" title="Копировать название">${ICON.copy}</button></h2>
      <div class="dmeta"><span class="tag acc">${esc(curType().name)}</span>${g.year ? `<span class="tag">${g.year}</span>` : ""}
      ${fields.map(k => `<span class="tag">${esc(g[k])}</span>`).join("")}${ms ? `<span class="tag scoretag">${ICON.star}Моя ${ms}/10</span>` : ""}</div>
      ${st === "done" ? `<div class="setrow" style="border:none"><div class="sl"><b>Прохождения</b><span>факт — даты и часы; «Ещё проход» добавит сегодня</span></div></div>
      <div class="plist" id="playlog">${playsHTML(id)}</div>
      <div class="dbtns" style="margin-top:8px">
        <input type="date" id="pldate" class="ninput" style="flex:1;min-width:130px" value="${todayISO()}" aria-label="Дата прохождения">
        <input type="number" id="plhours" class="ninput" style="flex:none;width:92px" min="0" step="0.1" placeholder="часы" aria-label="Часы">
        <button class="btn tonal" id="pladd" style="flex:none">${ICON.plus}Добавить</button></div>` : ""}
      <div class="dbtns row">
        ${st !== "done" ? `<button class="btn done" id="btndone">${ICON.check}Завершено</button>` : `<button class="btn tonal" id="btnplus">${ICON.plus}Ещё проход</button>`}
        ${st !== "active" ? `<button class="btn rot" id="btnact">${ICON.play}В процесс</button>` : `<button class="btn ghost" id="btnback">${ICON.back}В планы</button>`}
        <button class="btn ghost" id="btndrop">${ICON.drop}${st === "dropped" ? "Вернуть" : "Брошено"}</button>
      </div>
      <div class="dbtns">
        <button class="btn ghost" id="btnedit">${ICON.edit}Изменить</button>
        <button class="btn ghost" id="btncov">${ICON.img}Обложка</button>
        <input type="file" id="covfile" accept="image/jpeg,image/png,image/webp" style="display:none">
        ${S.customCovers[id] ? `<button class="btn ghost" id="btncovreset">${ICON.trash}Сброс</button>` : ""}
        <button class="btn ghost" id="btndel" style="color:var(--md-error)">${ICON.trash}Удалить</button>
      </div></div></div>
    ${g.why ? `<div class="dwhy"><b>Описание</b>${esc(g.why)}</div>` : ""}
    <div class="setrow" style="border:none"><div class="sl"><b>Моя оценка</b><span>от 1 до 10</span></div>
      <select class="m3" id="myscore" style="min-width:120px"><option value="">— не оценено</option>
      ${[1,2,3,4,5,6,7,8,9,10].map(n => `<option value="${n}" ${ms == n ? "selected" : ""}>★ ${n}/10</option>`).join("")}</select></div>
    <div class="setrow" style="border:none"><div class="sl"><b>Теги</b><span>нажмите, чтобы назначить/снять</span></div></div>
    <div class="tchips" id="itemtags">${S.tags.map(t => {
      const on = (S.itemTags[id] || []).includes(t.id);
      return `<button class="tchip ${on ? "on" : ""}" data-t="${t.id}" style="${on ? `background:${t.color};border-color:${t.color};color:#fff` : ""}">${esc(t.name)}</button>`;
    }).join("")} <button class="tchip" id="tnew">+ новый</button></div>
    <div class="notesec"><h3>${ICON.pen}Заметки (${(S.notes[id] || []).length})</h3>
      <div class="tchips" id="tpls">${TPL.map((t, i) => `<button class="tchip" data-i="${i}">+ ${esc(t.n)}</button>`).join("")}</div>
      <div id="nform"></div>
      <textarea class="note" id="ntext" placeholder="Шаблон создаст поля — или пишите свободно…"></textarea>
      <div class="dbtns" style="margin-top:9px"><button class="btn primary" id="nadd">${ICON.pen}Добавить заметку</button>
        <button class="btn md" id="nexpmd">${ICON.copy}Экспорт .md</button>
        <button class="btn ghost" id="nimpmd">${ICON.pen}Импорт .md</button><input type="file" id="nfile" accept=".md,.markdown,.txt" style="display:none"></div>
      <div class="notelist" id="nlist"></div></div>`;
  renderNotes(id);
  const mv = to => () => { setState(id, to); openSheet(id); renderNav(); renderCurrent(true); };
  if ($("#btndone")) $("#btndone").onclick = () => { setState(id, "done"); S.plays[id] = Math.max(1, (S.plays[id] || 0)); openSheet(id); renderNav(); renderCurrent(true); };
  if ($("#btnact")) $("#btnact").onclick = mv("active");
  if ($("#btnback")) $("#btnback").onclick = mv("backlog");
  if ($("#btnplus")) $("#btnplus").onclick = () => { addPlay(id, todayISO(), null); toast(`Прохождений: ${playCount(id)}`); openSheet(id); renderCurrent(true); };
  $("#btndrop").onclick = () => { setState(id, st === "dropped" ? "backlog" : "dropped"); openSheet(id); renderNav(); renderCurrent(true); };
  $("#btncov").onclick = () => $("#covfile").click();
  $("#covfile").onchange = e => { const f = e.target.files[0]; if (!f) return;
    coverFromFile(f, dataUrl => { S.customCovers[id] = dataUrl; save(); toast("Обложка обновлена (600×800, вписана целиком)"); openSheet(id); renderCurrent(true); }); };
  const covr = $("#btncovreset"); if (covr) covr.onclick = () => { delete S.customCovers[id]; save(); openSheet(id); renderCurrent(true); };
  $("#btnedit").onclick = () => openItemForm(id);
  $("#btndel").onclick = () => { delete typeItems()[id]; delete S.notes[id]; delete S.myScore[id]; delete S.customCovers[id]; delete S.itemTags[id]; delete S.playLog[id]; save(); toast("Удалено"); closeSheet(); renderNav(); renderCurrent(); };
  $("#myscore").onchange = e => { const v = e.target.value; if (v) S.myScore[id] = +v; else delete S.myScore[id]; save(); openSheet(id); renderCurrent(true); };
  if ($("#playlog")) {
    $("#playlog").onclick = e => { const b = e.target.closest("[data-pdel]"); if (!b) return;
      const arr = S.playLog[id]; if (!arr) return;
      arr.splice(+b.dataset.pdel, 1); if (!arr.length) delete S.playLog[id];
      save(); openSheet(id); };
    $("#pladd").onclick = () => { const d = $("#pldate").value;
      if (!d) { toast("Укажите дату прохождения"); return; }
      const hv = $("#plhours").value;
      addPlay(id, d, hv ? +hv : null); toast("Прохождение добавлено"); openSheet(id); };
  }
  $("#itemtags").onclick = e => { const b = e.target.closest("[data-t]"); if (b) { toggleItemTag(id, b.dataset.t); openSheet(id); renderCurrent(true); } };
  const tn = $("#tnew"); if (tn) tn.onclick = () => openTagManager(id);
  $("#tpls").onclick = e => { const b = e.target.closest(".tchip"); if (!b) return;
    const tpl = TPL[+b.dataset.i]; const ta = $("#ntext"), form = $("#nform");
    if (!tpl.fields) { form.innerHTML = ""; ta.style.display = ""; ta.focus(); return; }
    ta.style.display = "none"; ta.value = "";
    form.innerHTML = tpl.fields.map(([label, ph]) => `<label class="nfield"><span>${esc(label)}</span><textarea rows="2" placeholder="${esc(ph || "")}"></textarea></label>`).join("");
    const f1 = form.querySelector("textarea"); if (f1) f1.focus(); };
  $("#nadd").onclick = () => {
    const ta = $("#ntext"), form = $("#nform");
    let text = ""; const fl = form.querySelectorAll("label");
    if (fl.length) {
      const parts = [...fl].map(l => [l.querySelector("span").textContent, l.querySelector("textarea").value.trim()]).filter(([, v]) => v);
      if (!parts.length) { toast("Поля пусты"); return; }
      text = parts.map(([k, v]) => `${k}\n${v}`).join("\n\n");
    } else text = ta.value.trim();
    if (!text) { toast("Заметка пуста"); return; }
    (S.notes[id] = S.notes[id] || []).unshift({d: Date.now(), t: text}); save();
    ta.value = ""; form.innerHTML = ""; ta.style.display = "";
    renderNotes(id); $("#sheet h3").innerHTML = `${ICON.pen}Заметки (${S.notes[id].length})`; toast("Заметка сохранена"); };
  $("#nexpmd").onclick = () => exportNoteMD(g);
  $("#nimpmd").onclick = () => $("#nfile").click();
  $("#nfile").onchange = e => { const f = e.target.files[0]; if (!f) return;
    const r = new FileReader(); r.onload = () => { importNoteMD(id, String(r.result)); renderNotes(id); }; r.readAsText(f); };
  $("#scim").classList.add("on"); $("#sheet").classList.add("on");
  document.body.style.overflow = "hidden";
}
function renderNotes(id) {
  const arr = S.notes[id] || [];
  $("#nlist").innerHTML = arr.length ? arr.map((n, i) => `<div class="noteitem">
    <div class="nd">${new Date(n.d).toLocaleString("ru", {day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"})}</div>${esc(n.t)}
    <div class="nact"><button data-i="${i}" data-a="e">${ICON.pen}</button><button data-i="${i}" data-a="d">${ICON.trash}</button></div></div>`).join("")
    : `<div class="nempty">Заметок нет. Шаблон «Сессия» создаст поля автоматически.</div>`;
  $("#nlist").onclick = e => { const b = e.target.closest("button"); if (!b) return;
    const i = +b.dataset.i, arr = S.notes[id];
    if (b.dataset.a === "d") { arr.splice(i, 1); save(); renderNotes(id); }
    else { const t = arr[i].t; arr.splice(i, 1); save(); renderNotes(id);
      const ta = $("#ntext"); $("#nform").innerHTML = ""; ta.style.display = ""; ta.value = t; ta.focus(); } };
}
function closeSheet() { $("#scim").classList.remove("on"); $("#sheet").classList.remove("on"); document.body.style.overflow = ""; curG = null; }
