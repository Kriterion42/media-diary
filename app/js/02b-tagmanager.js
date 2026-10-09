// Модуль 02b-tagmanager. Менеджер тегов: список, создание, редактирование, удаление. Единая форма.
"use strict";
function tagShape() { return S.tagShape || "round"; }
function setTagShape(shape) { S.tagShape = shape; save(); }
function openTagManager(returnToId) {
  const back = () => { closeSheet(); if (returnToId) openSheet(returnToId); else openSettings(); };
  const rows = S.tags.map(t => `
    <div class="setrow" data-t="${t.id}">
      <span class="tagchip demo" style="background:${t.color};border-radius:${t.shape === "square" ? "6px" : t.shape === "diamond" ? "2px" : t.shape === "flag" ? "99px 4px 4px 99px" : "99px"}">${esc(t.name)}</span>
      <input class="ninput tname" data-t="${t.id}" value="${esc(t.name)}" style="flex:1;min-width:120px">
      <input type="color" class="tcolor" data-t="${t.id}" value="${t.color}" title="Цвет тега" style="width:38px;height:34px;border:none;background:none;cursor:pointer">
      <button class="btn ghost" data-a="save" data-t="${t.id}">${ICON.check}</button>
      <button class="btn ghost" data-a="del" data-t="${t.id}" style="color:var(--md-error)">${ICON.trash}</button>
    </div>`).join("");
  $("#sheet").innerHTML = `<div class="grabber"></div><h2 class="dtitle">Теги</h2>
    <div class="intro">Теги помечают элементы в любом типе медиа. Форма у всех тегов единая — выбирается ниже.</div>
    <div class="setrow"><div class="sl"><b>Форма тегов</b><span>общая для всех</span></div>
      <select class="m3" id="tagshape">${TAG_SHAPES.map(([v, n]) => `<option value="${v}" ${tagShape() === v ? "selected" : ""}>${n}</option>`).join("")}</select></div>
    <div class="menurows" id="tagrows">${rows || '<div class="nempty">Тегов пока нет</div>'}</div>
    <div class="setrow"><div class="sl"><b>Новый тег</b><span>имя и цвет</span></div>
      <input class="ninput" id="tagnewname" placeholder="имя тега" style="flex:1;min-width:120px">
      <input type="color" id="tagnewcolor" value="${TAG_COLORS[0]}" style="width:38px;height:34px;border:none;background:none;cursor:pointer">
      <button class="btn primary" id="tagadd">${ICON.plus}</button></div>
    <div class="dbtns"><button class="btn tonal" id="tagback">${ICON.check}Готово</button></div>`;
  $("#tagshape").onchange = e => { setTagShape(e.target.value); openTagManager(returnToId); };
  $("#tagadd").onclick = () => {
    const nm = $("#tagnewname").value.trim();
    if (!nm) { toast("Введите имя тега"); return; }
    createTag(nm, $("#tagnewcolor").value, tagShape());
    openTagManager(returnToId);
  };
  $("#tagrows").onclick = e => {
    const b = e.target.closest("[data-a]"); if (!b) return;
    const id = b.dataset.t;
    if (b.dataset.a === "del") {
      deleteTag(id); openTagManager(returnToId); toast("Тег удалён");
    } else if (b.dataset.a === "save") {
      const t = tagById(id); const nm = $(`.tname[data-t="${id}"]`).value.trim();
      const col = $(`.tcolor[data-t="${id}"]`).value;
      if (t && nm) { t.name = nm; t.color = col; save(); toast("Тег обновлён"); }
      openTagManager(returnToId);
    }
  };
  $("#tagback").onclick = back;
  $("#scim").classList.add("on"); $("#sheet").classList.add("on");
  document.body.style.overflow = "hidden";
}
