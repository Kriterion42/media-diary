# Архитектура «Медиа дневник»

Однофайловое приложение: `media-diary.html` = shell + base.css + overrides.css + app/js/*.js.
Тот же файл — в `android/app/src/main/assets/index.html` → APK (WebView, без INTERNET).

## Модель: типы медиа × состояния
- **Типы медиа** (настраиваются): пресеты — Игры, Фильмы, Сериалы, Аниме, Манга, Манхва, Комиксы, Мультфильмы, Мультсериалы, Книги; можно добавлять свои (имя + набор полей из FIELD_LIB) и удалять. У каждого типа свои поля карточки (FIELD_LIB: title, year, creator, platform, director, author, artist, seasons, episodes, volumes, pages, duration, score, sizeGb, why).
- **Состояния** (вкладки, фиксированные): backlog «В планах» → active «В процессе» → done «Завершено»; боковое dropped «Брошено».
- Элемент: `{id, title, year, …поля типа, why, state, added, tags?}`; теги элемента — `S.itemTags[id]=[tagId]`.
- **Теги**: `S.tags=[{id,name,color}]` — форма задана глобально (`S.tagShape`); чипы на обложке и в компакт-виде; фильтр по тегам.
- **Оценки**: критиков (`item.score`, 0–100) и своя (`S.myScore`, 1–10) — обе на обложке.
- **Прохождения/просмотры**: `S.playLog[id] = [{d:"ГГГГ-ММ-ДД", h?}]` — запись авто при
  «Завершено» и «Ещё проход»; в шторке — журнал с датой/часами и удалением записей;
  `S.plays` остался фолбэк-счётчиком. Хелперы в 01-state: addPlay/playCount/
  lastPlayDate/sumHours/todayISO.
- **Шаблон карточки**: у типа `cardFields` — какие поля и в каком порядке показывать
  на плитке (grid-карточка до 3 значений, vlist — первое); не задан — авто-рендер.

## Модули (порядок склейки)
| Файл | Содержимое |
|---|---|
| 00-consts | STATE_*, FIELD_LIB (+studio, country), TYPE_PRESETS (country у медиа-типов), TPL, TAG_COLORS/SHAPES, ICON |
| 01-state | DEF, S (localStorage `md1.state`), save, $, esc, h32, toast, curType/typeItems/itemsOf/setState + playLog-хелперы |
| 02-tags | теги: tagById, itemTags, toggleItemTag, createTag, deleteTag, чипы |
| 02b-tagmanager | openTagManager: список/создание/редактирование/удаление, общая форма |
| 03-parser | transportFetch (WebView md-parser.local → direct → прокси), parsePage (Steam appdetails + generic og), parseHTML |
| 04-covers | coverURI (процедурный SVG), Cov, imgTag (customCovers приоритет), coverFromFile (вписать в 600×800, белый фон) |
| 05-cards (+05b) | cardInner/cardHTML (обе оценки, теги, 4 кнопки-иконки, extra по cardFields), tableHTML (табличный вид), cardMeta, compactHTML, vcardHTML (vcardExtra) |
| 06-list | filteredRows (поиск по всем полям + теги + сортировки added/title/score/done/year/hours/plays), renderCurrent (grid/vlist/compact/table с сортировкой по заголовку), renderTagFilter |
| 07-sheet | openSheet (детали, состояния, обложка, удаление, моя оценка, теги, журнал прохождений с формой даты/часов, экспорт .md), renderNotes, closeSheet, fmtPlayDate/playsHTML |
| 08-export | downloadFile, mdFileName, exportNoteMD (+Прохождения), importNoteMD, exportListMD, listRows (+Последнее прохождение, Часы), makeZip+crc32, exportListXLSX |
| 09-stats | openStats (проценты по состояниям, прохождения playCount, сумма часов sumHours, сводка по типам) |
| 10-types | openTypeManager: создание/редактирование/удаление типов, поля, «Поля на плитке карточки» (cardFields, ↑/↓), fieldLabel |
| 11-forms | openItemForm (+кнопка парсера), openSettings, applyTheme, fieldLabel |
| 12-boot | reset (параметр reset=1), renderNav, renderTypes, setView, boot (каркас, делегирование, свайп шторки, свайп вкладок состояний), __back, window.QA |

## Транспорт парсера
- APK: `fetch("https://md-parser.local/p?u=…")` перехватывается в MainActivity (shouldInterceptRequest) → Java HTTP GET → WebResourceResponse. Без CORS.
- Браузер: прямой fetch (только CORS-сайты, напр. Wikipedia API) → публичные прокси (best effort).
- Ошибки транспорта — человекочитаемый статус в форме.

## Сборка
`python build.py` → `media-diary.html` + копия в `android/app/src/main/assets/index.html`. Базовый CSS — снимок основного проекта; при обновлении стилей основного проекта обновить `app/base.css` вручную.
