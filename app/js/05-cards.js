// Модуль 05-cards. Карточки: обе оценки на обложке, теги, кнопки-иконки в один ряд.
"use strict";
function cardBadges(g) {
  const st = g.state || "backlog";
  let b = "";
  if (st === "done") b += `<span class="donebadge">${ICON.check}Завершено</span>`;
  if (st === "active") b += `<span class="rotbadge">${ICON.play}В процессе</span>`;
  if (st === "dropped") b += `<span class="donebadge dropb">${ICON.drop}Брошено</span>`;
  if (g.score) b += `<span class="scorebadge" title="Оценка критиков">${ICON.star}${g.score}</span>`;
  if (S.myScore[g.id]) b += `<span class="myscorebadge" title="Ваша оценка">★ ${S.myScore[g.id]}/10</span>`;
  return b;
}
function cardMeta(g) {
  const f = curType().fields || [];
  const parts = [`<span>${esc(curType().name)}</span>`];
  if (g.year) parts.push(`<span>· ${g.year}</span>`);           // год один раз
  if (g.creator) parts.push(`<span>· ${esc(g.creator)}</span>`);
  if (f.includes("score") && g.score) parts.push(`<span class="scoreline">оценка ${g.score}/100</span>`);
  if (S.myScore[g.id]) parts.push(`<span class="scoreline mine">ваша ${S.myScore[g.id]}/10</span>`);
  if (g.sizeGb) parts.push(`<span>· ${gb(g.sizeGb)}</span>`);
  return parts.join("");
}
function cardBtns(g) {
  const st = g.state || "backlog";
  return `<div class="cardbtns">
    ${st !== "done" ? `<button class="mini ic ${st === "done" ? "done" : "notdone"}" data-act="done" data-id="${g.id}" title="Завершено" aria-label="Завершено">${ICON.check}</button>` : ""}
    <button class="mini ic notes" data-act="open" data-id="${g.id}" title="Заметки" aria-label="Заметки">${ICON.pen}</button>
    <button class="mini ic copy" data-act="copy" data-id="${g.id}" title="Копировать название" aria-label="Копировать">${ICON.copy}</button>
    <button class="mini ic ${st === "dropped" ? "done" : "notdone"}" data-act="drop" data-id="${g.id}" title="${st === "dropped" ? "Вернуть из брошенных" : "Брошено"}" aria-label="Брошено">${ICON.drop}</button>
  </div>`;
}
function cardInner(g) {
  const st = g.state || "backlog";
  const n = (S.notes[g.id] || []).length;
  const cf = curType().cardFields;
  const extra = cf
    ? cf.map(k => g[k]).filter(v => v != null && v !== "").slice(0, 3).map(v => esc(v)).join(" · ")
    : (curType().fields || [])
        .filter(k => !["title", "why", "year", "creator", "score", "sizeGb"].includes(k) && g[k] != null && g[k] !== "")
        .slice(0, 2).map(k => esc(g[k])).join(" · ");
  return `
  <div class="covwrap">${imgTag(g)}
    ${st === "done" ? `<span class="donebadge">${ICON.check}Завершено</span>` : ""}
    ${st === "active" ? `<span class="rotbadge">${ICON.play}В процессе</span>` : ""}
    ${st === "dropped" ? `<span class="donebadge dropb">${ICON.drop}Брошено</span>` : ""}
    ${g.score ? `<span class="scorebadge" title="Оценка критиков">${ICON.star}${g.score}</span>` : ""}
    ${S.myScore[g.id] ? `<span class="myscorebadge" title="Ваша оценка">★ ${S.myScore[g.id]}/10</span>` : ""}
    <span class="covertags">${itemTagsHTML(g.id, true)}</span>
  </div>
  <div class="cardbody">
    <div class="ctitle">${esc(g.title)}</div>
    <div class="cmeta">${cardMeta(g)}</div>
    ${extra ? `<div class="ctime">${extra}</div>` : ""}
    <div class="cwhy">${esc(g.why || "")}</div>
    ${cardBtns(g)}
  </div>`;
}
const cardHTML = g => `<article class="card" data-id="${g.id}" data-act="open">${cardInner(g)}</article>`;
function tableHTML(g) {
  const lp = lastPlayDate(g.id);
  return `<article class="trow ${g.state === "dropped" ? "isdrop" : ""}" data-id="${g.id}" data-act="open">
    <span class="tt">${esc(g.title)}</span>
    <span class="ty">${g.year || "—"}</span>
    <span class="ts">${S.myScore[g.id] ? "★ " + S.myScore[g.id] : "—"}</span>
    <span class="td">${lp ? fmtPlayDate(lp) : "—"}</span>
    <span class="th">${sumHours(g.id) ? sumHours(g.id) + " ч" : "—"}</span>
    <span class="tp">${playCount(g.id)}</span></article>`;
}
const compactHTML = g => `<article class="rowitem ${g.state === "dropped" ? "isdrop" : ""}" data-id="${g.id}" data-act="open">
  <span class="rtitle">${esc(g.title)}</span>
  <span class="ryear">${g.year || "—"}</span>
  ${S.myScore[g.id] ? `<span class="rscore">★ ${S.myScore[g.id]}/10</span>` : `<span class="rscore"></span>`}
  <span class="rtags">${itemTagsHTML(g.id, true)}</span></article>`;
