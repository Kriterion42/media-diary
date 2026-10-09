// Модуль 04-covers. Обложки: своя → процедурная. Подложка, чтобы углы не задевали карточку.
"use strict";
function coverURI(g) {
  const h = h32(g.id + g.title);
  const hue = h % 360;
  const c1 = `hsl(${hue},32%,34%)`, c2 = `hsl(${(hue + 40) % 360},44%,12%)`;
  const words = esc(g.title).split(/\s+/); const lines = []; let cur = "";
  for (const wd of words) { if ((cur + " " + wd).trim().length > 13 && cur) { lines.push(cur); cur = wd; } else cur = (cur + " " + wd).trim(); }
  if (cur) lines.push(cur); if (lines.length > 4) { lines.length = 4; lines[3] += "…"; }
  const maxLen = Math.max(...lines.map(l => l.length), 1);
  const fs = Math.max(32, Math.min(58, Math.floor(440 / (maxLen * 0.56))));
  const ty = 400 - (lines.length - 1) * fs * 0.55;
  const tspan = lines.map((l, i) => `<tspan x='46' dy='${i ? fs * 1.08 : 0}'>${l}</tspan>`).join("");
  return "data:image/svg+xml," + encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='800' viewBox='0 0 600 800'>` +
    `<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='${c1}'/><stop offset='1' stop-color='${c2}'/></linearGradient></defs>` +
    `<rect width='600' height='800' fill='url(#g)'/>` +
    `<circle cx='${(h >> 3) % 600}' cy='${(h >> 6) % 800}' r='210' fill='none' stroke='rgba(255,255,255,.07)' stroke-width='26'/>` +
    `<circle cx='${(h >> 9) % 600}' cy='${(h >> 12) % 800}' r='90' fill='none' stroke='rgba(255,255,255,.05)' stroke-width='14'/>` +
    `<text x='46' y='${ty}' font-size='${fs}' font-weight='800' fill='#F2EFFA' font-family='sans-serif' xml:space='preserve'>${tspan}</text>` +
    `<text x='46' y='736' font-size='24' font-weight='700' fill='rgba(242,239,250,.85)' font-family='sans-serif'>${esc(curType().name)}${g.year ? " · " + g.year : ""}</text>` +
    `</svg>`);
}
const Cov = { c: {}, get(id) { const g = typeItems()[id]; return g ? (this.c[id] || (this.c[id] = coverURI(g))) : ""; } };
function imgTag(g) {
  const cu = S.customCovers[g.id];
  const src = cu || Cov.get(g.id);
  return `<img loading="lazy" alt="Обложка: ${esc(g.title)}" src="${src}">`;
}
function coverFromFile(file, cb) {
  const rd = new FileReader();
  rd.onload = () => {
    const im = new Image();
    im.onload = () => {
      const W = 600, H = 800, cv = document.createElement("canvas");
      cv.width = W; cv.height = H;
      const cx = cv.getContext("2d");
      cx.fillStyle = "#FFFFFF"; cx.fillRect(0, 0, W, H);
      const sc = Math.min(W / im.width, H / im.height);           // вписать целиком
      const w = im.width * sc, h = im.height * sc;
      cx.imageSmoothingQuality = "high";
      cx.drawImage(im, (W - w) / 2, (H - h) / 2, w, h);
      cb(cv.toDataURL("image/jpeg", 0.82));
    };
    im.onerror = () => toast("Не удалось прочитать изображение");
    im.src = rd.result;
  };
  rd.readAsDataURL(file);
}
