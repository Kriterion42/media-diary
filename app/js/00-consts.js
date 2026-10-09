// Модуль 00-consts. Состояния, типы медиа, шаблоны, иконки, теги.
"use strict";
const STATE_ORDER = ["backlog", "active", "done", "dropped"];
const STATE_NAME = {backlog: "В планах", active: "В процессе", done: "Завершено", dropped: "Брошено"};
const STATE_ICON = {
  backlog: '<svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z"/></svg>',
  active: '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',
  done: '<svg viewBox="0 0 24 24"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>',
  dropped: '<svg viewBox="0 0 24 24"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2zm-2 8H9V9h6v2z"/></svg>'
};
const FIELD_LIB = {
  title: {t: "text", n: "Название*", req: 1},
  year: {t: "year", n: "Год"},
  creator: {t: "text", n: "Автор / студия"},
  studio: {t: "text", n: "Студия"},
  country: {t: "text", n: "Страна"},
  platform: {t: "text", n: "Платформа"},
  director: {t: "text", n: "Режиссёр"},
  author: {t: "text", n: "Автор"},
  artist: {t: "text", n: "Художник"},
  seasons: {t: "num", n: "Сезонов"},
  episodes: {t: "num", n: "Эпизодов / глав"},
  volumes: {t: "num", n: "Томов"},
  pages: {t: "num", n: "Страниц"},
  duration: {t: "text", n: "Длительность"},
  score: {t: "score", n: "Оценка критиков (0–100)"},
  sizeGb: {t: "numf", n: "Объём, ГБ"}
};
const TYPE_PRESETS = [
  {name: "Игры", fields: ["title", "year", "platform", "score", "sizeGb", "why"]},
  {name: "Фильмы", fields: ["title", "year", "country", "director", "duration", "score", "why"]},
  {name: "Сериалы", fields: ["title", "year", "country", "studio", "seasons", "episodes", "score", "why"]},
  {name: "Аниме", fields: ["title", "year", "country", "studio", "episodes", "score", "why"]},
  {name: "Манга", fields: ["title", "author", "artist", "volumes", "score", "why"]},
  {name: "Манхва", fields: ["title", "author", "artist", "volumes", "score", "why"]},
  {name: "Комиксы", fields: ["title", "author", "artist", "volumes", "score", "why"]},
  {name: "Мультфильмы", fields: ["title", "year", "country", "studio", "duration", "score", "why"]},
  {name: "Мультсериалы", fields: ["title", "year", "country", "studio", "seasons", "episodes", "score", "why"]},
  {name: "Книги", fields: ["title", "author", "year", "pages", "score", "why"]}
];
const DEFAULT_TYPES = ["Игры", "Фильмы", "Сериалы", "Аниме", "Манга", "Мультфильмы"]
  .map(n => TYPE_PRESETS.find(t => t.name === n));
const TPL = [
  {n: "Сессия", fields: [["🎯 Текущая цель", ""], ["✅ Что сделал", ""], ["⏱ Время", "дата · сколько · что именно"], ["📌 План на следующий раз", ""]]},
  {n: "Первые впечатления", fields: [["👀 Первые минуты", ""], ["👍 Что цепляет", ""], ["👎 Что мешает", ""], ["⚖ Вердикт: продолжать?", ""]]},
  {n: "Сложный момент", fields: [["🧱 Где застрял", ""], ["🔧 Что пробовал", ""], ["🗝 Как победил / план", ""]]},
  {n: "Финал — итоги", fields: [["🏁 Финал и впечатление", ""], ["⭐ Личная оценка /10", ""], ["🔁 Вернуться ли", ""]]},
  {n: "Свободная заметка", fields: null}
];
const TAG_COLORS = ["#E8B04B", "#7BC47F", "#5B9BD5", "#E57373", "#BA68C8", "#4DD0E1", "#FFD54F", "#AED581", "#F48FB1", "#90A4AE"];
const TAG_SHAPES = [["round", "Круг"], ["square", "Квадрат"], ["diamond", "Ромб"], ["flag", "Флаг"]];
const ICON = {
  check: '<svg viewBox="0 0 24 24"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>',
  pen: '<svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.8 9.94l-3.75-3.75L3 17.25zM20.7 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>',
  copy: '<svg viewBox="0 0 24 24"><path d="M16 1H4a2 2 0 0 0-2 2v14h2V3h12V1zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16H8V7h11v14z"/></svg>',
  chev: '<svg class="chev" viewBox="0 0 24 24" fill="#C7C5D0"><path d="M7.4 8.6 12 13.2l4.6-4.6L18 10l-6 6-6-6z"/></svg>',
  play: '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',
  trash: '<svg viewBox="0 0 24 24"><path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6zM19 4h-3.5l-1-1h-5l-1 1H5v2h14z"/></svg>',
  star: '<svg viewBox="0 0 24 24"><path d="m12 17.3-6.2 3.7 1.6-7L2 9.2l7.1-.6L12 2l2.9 6.6 7.1.6-5.4 4.8 1.6 7z"/></svg>',
  plus: '<svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z"/></svg>',
  img: '<svg viewBox="0 0 24 24"><path d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2zM8.5 13.5l2.5 3 3.5-4.5 4.5 6H5z"/></svg>',
  drop: '<svg viewBox="0 0 24 24"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2zm-2 8H9V9h6v2z"/></svg>',
  menu: '<svg viewBox="0 0 24 24"><path d="M3 5h18v2H3zm0 6h18v2H3zm0 6h18v2H3z"/></svg>',
  wipe: '<svg viewBox="0 0 24 24"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zM4 12c0-4.4 3.6-8 8-8 1.9 0 3.6.6 4.9 1.7L5.7 16.9C4.6 15.6 4 13.9 4 12zm8 8c-1.9 0-3.6-.6-4.9-1.7L18.3 7.1C19.4 8.4 20 10.1 20 12c0 4.4-3.6 8-8 8z"/></svg>',
  sad: '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM8.5 8A1.5 1.5 0 1 1 7 9.5 1.5 1.5 0 0 1 8.5 8zm7 0A1.5 1.5 0 1 1 14 9.5 1.5 1.5 0 0 1 15.5 8zM7 14h10a5 5 0 0 1-10 0z"/></svg>',
  stats: '<svg viewBox="0 0 24 24"><path d="M5 21V9h4v12H5zm7 0V3h4v18h-4zm7 0v-8h4v8h-4z"/></svg>',
  tags: '<svg viewBox="0 0 24 24"><path d="M21.4 11.6l-9-9C12 2.2 11.5 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .5.2 1 .6 1.4l9 9c.4.4.9.6 1.4.6s1-.2 1.4-.6l7-7c.4-.4.6-.9.6-1.4s-.2-1-.6-1.4zM6.5 8C5.7 8 5 7.3 5 6.5S5.7 5 6.5 5 8 5.7 8 6.5 7.3 8 6.5 8z"/></svg>',
  edit: '<svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.8 9.94l-3.75-3.75L3 17.25zM20.7 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>'
};
