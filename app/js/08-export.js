// Модуль 08-export. Экспорт: заметки .md, весь список .md/.xlsx/.json. Импорт заметок .md.
"use strict";
function copyTitle(g) {
  if (!g) return;
  const ok = () => toast(`Скопировано: ${g.title}`);
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(g.title).then(ok, () => fallbackCopy(g.title, ok));
  else fallbackCopy(g.title, ok);
}
function fallbackCopy(t, done) { const ta = document.createElement("textarea"); ta.value = t; document.body.appendChild(ta); ta.select();
  try { document.execCommand("copy"); done(); } catch (e) { toast("Не удалось"); } ta.remove(); }
function mdFileName(g) {
  const base = `${g.title} (${g.year || "?"}, ${curType().name})`;
  return base.replace(/[\\/:*?"<>|]+/g, " ").replace(/\s+/g, " ").trim() + ".md";
}
function exportNoteMD(g) {
  const id = g.id, arr = S.notes[id] || [];
  if (!arr.length) { toast("Заметок пока нет"); return; }
  let md = `# ${g.title}\n\n- **Тип:** ${curType().name}\n- **Год:** ${g.year || "—"}`;
  if (g.creator) md += `\n- **Автор/студия:** ${g.creator}`;
  if (S.myScore[id]) md += `\n- **Моя оценка:** ${S.myScore[id]}/10`;
  const pl = S.playLog[id] || [];
  if (pl.length) md += `\n- **Прохождения:** ${pl.map(p => fmtPlayDate(p.d) + (p.h ? ` (${p.h} ч)` : "")).join("; ")}`;
  md += `\n\n`;
  for (const n of arr) md += `## ${new Date(n.d).toLocaleString("ru", {day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"})}\n\n${n.t}\n\n---\n\n`;
  window.downloadFile(mdFileName(g), md, "text/markdown");
  toast(`Сохранено: ${mdFileName(g)}`);
}
function importNoteMD(id, text) {
  const parts = String(text).split(/^## .*/m).slice(1).map(x => x.replace(/---\s*$/m, "").trim()).filter(Boolean);
  const arr = S.notes[id] = S.notes[id] || [];
  if (parts.length) for (const p of parts) arr.push({d: Date.now(), t: p});
  else arr.push({d: Date.now(), t: String(text).trim()});
  save(); toast(`Импортировано заметок: ${parts.length || 1}`);
}
window.downloadFile = (name, content, mime) => {
  const b64 = btoa(unescape(encodeURIComponent(content)));
  const a = document.createElement("a");
  a.href = `data:${mime};charset=utf-8;base64,${b64}#${encodeURIComponent(name)}`;
  a.download = name; document.body.appendChild(a); a.click(); a.remove();
};
/* ── Экспорт списка: .md и .xlsx ── */
function listRows(state) {
  const fields = (curType().fields || []).filter(k => k !== "why");
  const rows = itemsOf(state).map(g => {
    const tags = itemTags(g.id).map(t => t.name).join(", ");
    const r = [g.title];
    for (const k of fields) r.push(g[k] != null ? String(g[k]) : "");
    r.push(S.myScore[g.id] ? S.myScore[g.id] + "/10" : "");
    r.push(String(playCount(g.id)));
    const lp = lastPlayDate(g.id);
    r.push(lp ? fmtPlayDate(lp) : "");
    r.push(sumHours(g.id) ? String(sumHours(g.id)) : "");
    r.push(tags);
    return r;
  });
  const head = ["Название", ...fields.map(k => fieldLabel(k).replace("*", "")), "Моя оценка", "Прохождений", "Последнее прохождение", "Часы", "Теги"];
  return [head, ...rows];
}
function exportListMD() {
  const rows = listRows(S.view);
  if (rows.length <= 1) { toast("Список пуст"); return; }
  const [h, ...body] = rows;
  let md = `# ${curType().name} — ${STATE_NAME[S.view]}\n\n`;
  md += `| ${h.join(" | ")} |\n| ${h.map(() => "---").join(" | ")} |\n`;
  for (const r of body) md += `| ${r.map(c => c.replace(/\|/g, "\\|")).join(" | ")} |\n`;
  const name = `${curType().name} - ${STATE_NAME[S.view]}.md`.replace(/[\\/:*?"<>|]+/g, " ");
  window.downloadFile(name, md, "text/markdown");
  toast(`Экспортировано строк: ${body.length}`);
}
/* Мини-XLSX (zip STORE, без сжатия) */
const CRC_TABLE = (() => { const t = []; for (let n = 0; n < 256; n++) { let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
function crc32(buf) { let c = 0xFFFFFFFF; for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
function makeZip(files) {
  const enc = new TextEncoder(); const parts = []; const central = []; let offset = 0;
  const u16 = v => [v & 255, (v >> 8) & 255]; const u32 = v => [v & 255, (v >> 8) & 255, (v >> 16) & 255, (v >>> 24) & 255];
  for (const [name, content] of files) {
    const nb = enc.encode(name), cb = typeof content === "string" ? enc.encode(content) : content;
    const crc = crc32(cb); const o = offset;
    parts.push(new Uint8Array([80, 75, 3, 4, ...u16(20), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(crc), ...u32(cb.length), ...u32(cb.length), ...u16(nb.length), ...u16(0), ...nb]));
    parts.push(cb);
    central.push({nb, cb, crc, o});
    offset += 30 + nb.length + cb.length;
  }
  const cdStart = offset; let cdLen = 0;
  for (const {nb, cb, crc, o} of central) {
    parts.push(new Uint8Array([80, 75, 1, 2, ...u16(20), ...u16(20), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(crc), ...u32(cb.length), ...u32(cb.length), ...u16(nb.length), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(o), ...nb]));
    cdLen += 46 + nb.length;
  }
  parts.push(new Uint8Array([80, 75, 5, 6, ...u16(0), ...u16(0), ...u16(central.length), ...u16(central.length), ...u32(cdLen), ...u32(cdStart), ...u16(0)]));
  const total = parts.reduce((a, p) => a + p.length, 0);
  const out = new Uint8Array(total); let p = 0;
  for (const x of parts) { out.set(x, p); p += x.length; }
  return out;
}
function exportListXLSX() {
  const rows = listRows(S.view);
  if (rows.length <= 1) { toast("Список пуст"); return; }
  const escXml = t => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const cell = (v, r, c) => `<c r="${String.fromCharCode(65 + c) + (r + 1)}" t="inlineStr"><is><t xml:space="preserve">${escXml(v)}</t></is></c>`;
  const sheetData = rows.map((row, ri) => `<row r="${ri + 1}">${row.map((v, ci) => cell(v, ri, ci)).join("")}</row>`).join("");
  const files = [
    ["[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>`],
    ["_rels/.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`],
    ["xl/workbook.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="${escXml(curType().name).slice(0, 28)}" sheetId="1" r:id="rId1"/></sheets></workbook>`],
    ["xl/_rels/workbook.xml.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>`],
    ["xl/worksheets/sheet1.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${sheetData}</sheetData></worksheet>`]
  ];
  const xlsx = makeZip(files);
  const b64 = btoa(String.fromCharCode(...xlsx));
  const name = `${curType().name} - ${STATE_NAME[S.view]}.xlsx`.replace(/[\\/:*?"<>|]+/g, " ");
  const a = document.createElement("a");
  a.href = "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64," + b64 + "#" + encodeURIComponent(name);
  a.download = name; document.body.appendChild(a); a.click(); a.remove();
  toast(`Экспортировано строк: ${rows.length - 1}`);
}
