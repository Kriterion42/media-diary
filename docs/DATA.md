# Данные «Медиа дневник»

## localStorage `md1.state`
```
types: [{name:"Игры", fields:["title","year","platform","score","sizeGb","why"],
         cardFields:["year","platform"], labels?}, …]   cardFields — поля на плитке (опц.)
items: { "<Тип>": { "<id>": item } }
item:  {id, title, year?, studio?, country?, creator?, …поля типа, why?,
        state:"backlog|active|done|dropped", added:Date.now()}   теги элемента не здесь
plays: {id: число}                      фолбэк-счётчик (совместимость)
playLog: {id: [{d:"ГГГГ-ММ-ДД", h?:12.5}]}   журнал прохождений/просмотров (дата+часы)
myScore: {id: 1–10}
customCovers: {id: dataURL(image/jpeg 600×800)}
itemTags: {id: [tagId]}
tags:   [{id:"t…", name, color:"#hex"}]   форма тегов общая: S.tagShape
notes:  {id: [{d:timestamp, t:"текст"}]}
view: "backlog|active|done|dropped"   type: индекс типа
sort: "added|title|score|done|year|hours|plays"   done — по дате последнего просмотра
layout: "grid|vlist|compact|table"   theme: "dark|light"   seq/…
```
- Поля типов берутся из FIELD_LIB (+ studio «Студия», country «Страна»); в пресеты
  TYPE_PRESETS страна включена только у медиа-типов (Фильмы/Сериалы/Аниме/Мультфильмы/
  Мультсериалы) — у «Игры» её сознательно нет.
- Число просмотров: `playCount = playLog.length || plays[id] || 0`; дата последнего —
  `lastPlayDate` (max по датам, устойчив к несортированному массиву); часы — `sumHours`.
- `setState(id,"done")` автоматически добавляет запись playLog с сегодняшней датой
  (guard от дубля за день); «Ещё проход» в шторке — то же самое.

## Рецепты (python)
```python
import json
# состояние из экспорта
st = json.load(open("backup.json", encoding="utf-8"))
for tn, items in st["items"].items():
    print(tn, len(items), "шт., завершено:",
          sum(1 for g in items.values() if g.get("state") == "done"))
```

## Рецепты (браузерная консоль на открытой странице)
```js
QA.S.items                      // все элементы по типам
QA.itemsOf("done").length       // завершённые
QA.setState(id, "done")         // перевести состояние
QA.exportListMD(); QA.exportListXLSX()
```

## Экспорт
- Заметки: `.md` вида «Название (Год, Тип).md» (секции `## дата`).
- Список: `.md` (таблица) и `.xlsx` (OOXML, inline-строки) — колонки = поля типа + моя оценка + прохождения + теги.
- Резервная копия: JSON всего состояния; импорт замещает.
