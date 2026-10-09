// Модуль 03-parser. Парсер страниц по ссылке: WebView-транспорт (md-parser.local) + браузерные прокси.
"use strict";
let parsedCover = null;
const PARSER_HOST = "md-parser.local";
const isWebView = () => /Android/i.test(navigator.userAgent);
async function transportFetch(url) {
  const attempts = [];
  // 1) В APK: перехват md-parser.local в MainActivity (без CORS)
  if (isWebView()) attempts.push(() => fetch(`https://${PARSER_HOST}/p?u=${encodeURIComponent(url)}`));
  // 2) Прямой запрос — работает для сайтов с CORS (Wikipedia API и др.)
  attempts.push(() => fetch(url));
  // 3) Публичные прокси (best effort)
  attempts.push(() => fetch("https://api.allorigins.win/raw?url=" + encodeURIComponent(url)));
  attempts.push(() => fetch("https://corsproxy.io/?url=" + encodeURIComponent(url)));
  attempts.push(() => fetch("https://r.jina.ai/" + url));
  let lastErr = null;
  for (const a of attempts) {
    try {
      const r = await a();
      if (!r.ok) { lastErr = new Error("HTTP " + r.status); continue; }
      return r;
    } catch (e) { lastErr = e; }
  }
  throw lastErr || new Error("нет доступного транспорта");
}
async function parsePage(url) {
  if (!/^https?:\/\//.test(url)) throw new Error("нужен http(s)");
  const sm = /store\.steampowered\.com\/app\/(\d+)/.exec(url);
  if (sm) return parseSteam(sm[1]);
  const kp = /kinopoisk\.[a-z]+\/(film|series)\/(\d+)/.exec(url);
  if (kp) return parseGeneric(url, {yearBias: 1});
  const html = await (await transportFetch(url)).text();
  return parseHTML(html, url);
}
async function parseSteam(appid) {
  const raw = await (await transportFetch(`https://store.steampowered.com/api/appdetails?appids=${appid}&l=ru`)).text();
  const dd = ((JSON.parse(raw) || {})[appid] || {}).data;
  if (!dd) throw new Error("Steam не отдал данные");
  const yr = (re => re ? +re[1] : 0)(/(\d{4})/.exec((dd.release_date || {}).date || ""));
  return {
    title: dd.name || "", year: yr,
    why: (dd.short_description || "").replace(/<[^>]*>/g, "").slice(0, 250),
    cover: (dd.header_image || "").replace(/\\/, ""),
    platform: "PC", creator: (dd.developers && dd.developers[0]) || ""
  };
}
function parseHTML(html, baseUrl) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const meta = sel => { const el = doc.querySelector(sel); return el ? (el.getAttribute("content") || "").trim() : ""; };
  const title = (meta('meta[property="og:title"]') || doc.title || "").replace(/\s*[|\-–—]\s*(Steam|Kinopoisk|Кинопоиск|IMDb|MyAnimeList|Shikimori).*$/i, "").trim().slice(0, 90);
  const desc = meta('meta[property="og:description"]') || meta("description") || "";
  const cover = meta('meta[property="og:image"]') || meta('meta[name="og:image"]') || "";
  const abs = cover && !/^https?:/.test(cover) ? new URL(cover, baseUrl).href : cover;
  const yr = (re => re ? +re[1] : 0)(/(19\d\d|20\d\d)/.exec(title + " " + desc));
  return { title, year: yr, why: desc.trim().slice(0, 250), cover: abs };
}
