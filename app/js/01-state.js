// Модуль 01-state. Состояние, сохранение, хелперы.
"use strict";
const DEF = {
  theme: "dark", view: "active", type: 0, q: "", sort: "added", layout: "grid",
  types: null, items: {}, notes: {}, myScore: {}, customCovers: {}, tags: [],
  itemTags: {}, plays: {}, playLog: {}, seq: 1
};
let S = Object.assign({}, DEF);
try { S = Object.assign(S, JSON.parse(localStorage.getItem("md1.state") || "{}")); } catch (e) {}
if (!S.types || !S.types.length) S.types = JSON.parse(JSON.stringify(DEFAULT_TYPES));
if (!S.items) S.items = {};
if (!S.notes) S.notes = {};
if (!S.myScore) S.myScore = {};
if (!S.customCovers) S.customCovers = {};
if (!S.itemTags) S.itemTags = {};
if (!S.plays) S.plays = {};
if (!S.playLog) S.playLog = {};
if (!S.tags) S.tags = [];
if (!S.tags.length) {
  S.tags = [
    {id: "t_gold", name: "Любимое", color: "#E8B04B", shape: "round"},
    {id: "t_next", name: "На очереди", color: "#5B9BD5", shape: "square"}
  ];
}
const save = (() => { let t; return () => { clearTimeout(t); t = setTimeout(() =>
  localStorage.setItem("md1.state", JSON.stringify(S)), 120); }; })();
const $ = s => document.querySelector(s);
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const h32 = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
const toast = m => { const t = $("#toast"); t.textContent = m; t.classList.add("on"); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("on"), 2600); };
const curType = () => S.types[S.type] || S.types[0];
const typeItems = () => S.items[curType().name] || {};
const ensureArr = id => { const a = S.items[curType().name] = S.items[curType().name] || {}; return a; };
const gb = v => v == null || v <= 0 ? "" : v >= 1 ? (Math.round(v * 10) / 10 + " ГБ") : Math.round(v * 1024) + " МБ";
function stateOf(id) { const g = typeItems()[id]; return g ? (g.state || "backlog") : null; }
function setState(id, st) {
  const g = typeItems()[id]; if (!g) return;
  g.state = st;
  if (st === "done") {
    if (!S.plays[id]) S.plays[id] = 1;
    if (!(S.playLog[id] || []).some(p => p.d === todayISO())) addPlay(id, todayISO(), null);
  }
  save();
}
/* ── Прохождения/просмотры: журнал фактов (дата ГГГГ-ММ-ДД + опциональные часы) ── */
const todayISO = () => { const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
function addPlay(id, d, h) {
  const arr = S.playLog[id] = S.playLog[id] || [];
  const rec = {d};
  if (h != null && +h > 0) rec.h = Math.round(+h * 10) / 10;
  arr.push(rec);
  arr.sort((a, b) => a.d < b.d ? -1 : a.d > b.d ? 1 : 0);
  save();
}
const playCount = id => (S.playLog[id] && S.playLog[id].length) || S.plays[id] || 0;
const lastPlayDate = id => (S.playLog[id] || []).reduce((m, p) => p.d > m ? p.d : m, "");
const sumHours = id => (S.playLog[id] || []).reduce((s, p) => s + (p.h || 0), 0);
function itemsOf(state) { return allOfType().filter(g => (g.state || "backlog") === state); }
function allOfType() { return Object.values(typeItems()); }
