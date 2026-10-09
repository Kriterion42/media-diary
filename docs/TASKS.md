# Рецепты типовых задач (форк)

## 1. Добавить поле в карточку
1. `app/js/00-consts.js` → FIELD_LIB: добавить `key:{t,n}`.
2. Добавить поле в нужный TYPE_PRESET (или через UI-менеджер типов у существующего типа).
3. Отобразить: `app/js/05-cards.js` → cardInner (extra) и `app/js/07-sheet.js` → `.dmeta` (fields уже фильтруют title/why/year).

## 2. Добавить тип медиа по умолчанию
`app/js/00-consts.js` → TYPE_PRESETS: `{name, fields:[...]}` + включить в DEFAULT_TYPES. Существующие пользователи добавят тип через менеджер.

## 3. Новый экспорт
`app/js/08-export.js` — по образцу exportListMD/exportListXLSX (listRows даёт строки с заголовком).

## 4. Изменить парсер
`app/js/03-parser.js`: parsePage — распознавание URL (steam/kp/mal/generic), transportFetch — цепочка (WebView → direct → прокси). Не ломать порядок: WebView-перехват первый.

## 5. Правки вёрстки
`app/overrides.css` (специфика форка). Базовые компоненты — `app/base.css` (снимок из основного проекта; не редактировать без необходимости — при обновлении основного стиля переносить изменения вручную).

## 6. Иконка/название
Иконка: `android/.../drawable/ic_md_fore.xml` + colors.xml; название: `android/.../values/strings.xml`.
