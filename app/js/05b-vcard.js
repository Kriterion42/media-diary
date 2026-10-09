// Дополнение 05-cards: вертикальный список (vcard) для форка.
function vcardExtra(g) {
  const cf = curType().cardFields;
  if (cf) { const v = cf.map(k => g[k]).find(v => v != null && v !== ""); return v == null ? "" : esc(String(v)); }
  return g.creator ? esc(g.creator) : "";
}
function vcardHTML(g) {
  const st = g.state || "backlog";
  return `<article class="vcard" data-id="${g.id}" data-act="open">
  <div class="covwrap">${imgTag(g)}${st === "done" ? `<span class="donebadge">${ICON.check}</span>` : ""}${st === "active" ? `<span class="rotbadge">${ICON.play}</span>` : ""}</div>
  <div class="vbody"><div class="ctitle">${esc(g.title)}</div>
  <div class="cmeta"><span>${esc(curType().name)}</span>${g.year ? `<span>· ${g.year}</span>` : ""}${S.myScore[g.id] ? `<span class="scoreline mine">ваша ${S.myScore[g.id]}/10</span>` : ""}</div>
  <div class="ctime">${vcardExtra(g)}</div>
  <div class="cwhy">${esc(g.why || "")}</div>
  ${cardBtns(g)}</div></article>`;
}
