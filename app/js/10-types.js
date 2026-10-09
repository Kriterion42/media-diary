// Модуль 10-types. Типы медиа: список, редактирование, переработанное создание.
"use strict";
function fieldLabel(k) {
  const map = {title: "Название*", year: "Год", creator: "Автор / студия", studio: "Студия", country: "Страна",
    platform: "Платформа", director: "Режиссёр", author: "Автор", artist: "Художник", seasons: "Сезонов",
    episodes: "Эпизодов / глав", volumes: "Томов", pages: "Страниц", duration: "Длительность",
    score: "Оценка критиков", sizeGb: "Объём, ГБ"};
  return map[k] || k;
}
function openTypeManager(editIndex) {
  const editing = editIndex != null;
  const t = editing ? S.types[editIndex] : null;
  $("#sheet").innerHTML = `<div class="grabber"></div>
  <h2 class="dtitle">${editing ? "Изменить тип медиа" : "Типы медиа"}</h2>
  ${editing ? `
    <label class="nfield"><span>Название типа</span><input class="ninput" id="tname" value="${esc(t.name)}"></label>
    <div class="flabel" style="margin:8px 0 6px">Поля карточки (в порядке отображения)</div>
    <div class="menurows" id="tflds">${t.fields.map((k, i) => k === "title" || k === "why" ? "" :
      `<div class="setrow"><label class="switch"><input type="checkbox" data-f="${k}" checked><span class="tr"></span><span class="th"></span></label>
       <div class="sl"><b>${esc(fieldLabel(k))}</b><span>${k}</span></div></div>`).join("")}
      <div class="setrow"><div class="sl"><b>Добавить поле</b></div>
        <select class="m3" id="taddfield">${Object.keys(FIELD_LIB).filter(k => k !== "title" && k !== "why" && !t.fields.includes(k)).map(k => `<option value="${k}">${esc(fieldLabel(k))}</option>`).join("")}</select>
        <button class="btn tonal" id="taddbtn">${ICON.plus}</button></div>
    </div>
    <div class="flabel" style="margin:8px 0 6px">Поля на плитке карточки</div>
    <div class="menurows" id="tcards">${t.fields.filter(k => k !== "title" && k !== "why").map(k => {
      const on = (t.cardFields || []).includes(k);
      const pos = (t.cardFields || []).indexOf(k);
      return `<div class="setrow"><label class="switch"><input type="checkbox" data-cf="${k}" ${on ? "checked" : ""}><span class="tr"></span><span class="th"></span></label>
       <div class="sl"><b>${esc(fieldLabel(k))}</b><span>${on ? "на карточке · " + (pos + 1) : "не показывать"}</span></div>
       <button class="btn tonal" data-cfup="${k}" ${on ? "" : "disabled"}>↑</button>
       <button class="btn tonal" data-cfdown="${k}" ${on ? "" : "disabled"}>↓</button></div>`;
    }).join("")}</div>
    <div class="hint" style="margin-top:4px">Ничего не выбрано — на плитке поля показываются как раньше (авто).</div>
    <div class="dbtns"><button class="btn primary" id="tsave">${ICON.check}Сохранить</button>
      <button class="btn ghost" id="tcancel">Отмена</button>
      <button class="btn ghost" id="tdel" style="color:var(--md-error)">${ICON.trash}Удалить тип</button></div>`
  : `
    <div class="intro">Выберите шаблон и при желании задайте своё имя. Поля можно менять после создания.</div>
    <div class="menugrid" id="presets">${TYPE_PRESETS.map((p, i) => `<button class="menucard ${p.name === "Игры" ? "on" : ""}" data-i="${i}">
      <span class="mtxt">${esc(p.name)}</span><span class="mcnt">${p.fields.length}</span></button>`).join("")}</div>
    <label class="nfield" style="margin-top:10px"><span>Своё название типа (необязательно)</span>
      <input class="ninput" id="newname" placeholder="например: Подкасты"></label>
    <div class="dbtns"><button class="btn primary" id="tcreate">${ICON.plus}Добавить тип</button>
      <button class="btn ghost" id="tcancel">Готово</button></div>`}`;
  $("#tcancel").onclick = () => { closeSheet(); renderNav(); renderTypes(); renderCurrent(); };
  if (editing) {
    $("#tcards").onchange = e => {
      const box = e.target.closest("input[data-cf]"); if (!box) return;
      const k = box.dataset.cf;
      t.cardFields = t.cardFields || [];
      const i = t.cardFields.indexOf(k);
      if (box.checked && i < 0) t.cardFields.push(k);
      if (!box.checked && i >= 0) t.cardFields.splice(i, 1);
      if (!t.cardFields.length) delete t.cardFields;
      save(); openTypeManager(editIndex);
    };
    $("#tcards").onclick = e => {
      const up = e.target.closest("[data-cfup]"), dn = e.target.closest("[data-cfdown]");
      if (!up && !dn) return;
      const k = up ? up.dataset.cfup : dn.dataset.cfdown;
      const arr = t.cardFields || [];
      const i = arr.indexOf(k), j = up ? i - 1 : i + 1;
      if (i < 0 || j < 0 || j >= arr.length) return;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      save(); openTypeManager(editIndex);
    };
    $("#tsave").onclick = () => {
      const nm = $("#tname").value.trim();
      if (!nm) { toast("Введите название типа"); return; }
      const oldName = t.name;
      const keep = [...$("#tflds").querySelectorAll("input:checked")].map(x => x.dataset.f);
      t.fields = ["title", ...keep, "why"];
      if (t.cardFields) { t.cardFields = t.cardFields.filter(k => t.fields.includes(k)); if (!t.cardFields.length) delete t.cardFields; }
      if (nm !== oldName) { S.items[nm] = S.items[oldName] || {}; delete S.items[oldName]; t.name = nm; if (S.type === editIndex) { } }
      save(); closeSheet(); renderTypes(); renderNav(); renderCurrent(); toast("Тип обновлён");
    };
    $("#taddbtn").onclick = () => {
      const k = $("#taddfield").value; if (!k) return;
      if (!t.fields.includes(k)) t.fields.splice(t.fields.length - 1, 0, k);
      save(); openTypeManager(editIndex);
    };
    $("#tdel").onclick = () => {
      if (S.types.length <= 1) { toast("Должен остаться хотя бы один тип"); return; }
      S.types.splice(editIndex, 1); if (S.type >= S.types.length) S.type = 0;
      save(); closeSheet(); renderTypes(); renderNav(); renderCurrent(); toast("Тип удалён (данные сохранены)");
    };
  } else {
    let chosen = 0;
    $("#presets").onclick = e => { const b = e.target.closest(".menucard"); if (!b) return;
      [...$("#presets").children].forEach(x => x.classList.remove("on")); b.classList.add("on"); chosen = +b.dataset.i; };
    $("#tcreate").onclick = () => {
      const preset = TYPE_PRESETS[chosen];
      const nm = $("#newname").value.trim() || preset.name;
      if (S.types.some(t => t.name === nm)) { toast("Такой тип уже есть"); return; }
      S.types.push({name: nm, fields: [...preset.fields]});
      S.type = S.types.length - 1; save(); closeSheet(); renderTypes(); renderNav(); renderCurrent();
      toast(`Тип «${nm}» добавлен`);
    };
  }
  $("#scim").classList.add("on"); $("#sheet").classList.add("on");
  document.body.style.overflow = "hidden";
}
