# AGENTS.md — «Медиа дневник» (форк)

Автономный проект. НЕ зависит от папки основного проекта (`../src`, `../app-data` не нужны).
Один сценарий для агента: правки в `app/js/NN-*.js` → `python build.py` → QA → APK.

## ЖЕЛЕЗНЫЕ ПРАВИЛА
1. НЕ читать целиком файлы >150 КБ (`media-diary.html` — собранный). Читать исходники: `app/js/NN-*.js`, `app/*.css`.
2. Правки кода — в `app/js/NN-*.js` (склеиваются по порядку имён в build.py). Не создавать монолит.
3. Состояние — localStorage `md1.state`. Структура в `docs/DATA.md`.
4. Сборка после правок: `python build.py` → открой `media-diary.html`; QA — `qa.html` (22 сценария, итог в `window.__QARESULT`).
5. Стиль: единый M3, элементы не касаются друг друга, обложки вписаны целиком (contain), кнопки-иконки без текста.
6. Русский язык UI и комментариев. Парсер требует сеть только в момент добавления.

## КОМАНДЫ
```bash
python build.py        # сборка media-diary.html + копия в android assets
python -m http.server 8125 --bind 127.0.0.1   # просмотр: http://127.0.0.1:8125/media-diary.html
```
APK: см. `docs/BUILD.md` (Gradle-проект `android/`, applicationId `ru.kriterion.mediadiary`, сборка CLI через локальный Gradle 8.7).

## КАРТА ПРОЕКТА
| Нужно | Файл |
|---|---|
| Правила + карта | `AGENTS.md` (этот файл) |
| Архитектура и модули | `docs/ARCHITECTURE.md` |
| Схема данных и localStorage | `docs/DATA.md` |
| Сборка и APK | `docs/BUILD.md` |
| Рецепты типовых задач | `docs/TASKS.md` |
| Правки UI | `app/js/00-consts.js` … `12-boot.js` (см. шапку каждого) |
| Стили | `app/base.css` (база, снимок из основного проекта) + `app/overrides.css` (специфика форка) |
| Парсер страниц | `app/js/03-parser.js` + перехват `md-parser.local` в `android/.../MainActivity.kt` |

## ИЗВЕСТНЫЕ ГРАБЛИ
- `let/const` до объявления = TDZ; обращение к `S.*` выше `let S` запрещено.
- Патчи python с тройными кавычками и JS (`""` внутри `"""`) ломаются — списки строк.
- `return` вне функции на top-level JS — SyntaxError (блокирует весь скрипт).
- Прозрачные PNG → чёрный фон при JPEG-конверсии: заливать белым.
- Транспорт парсера: в APK — перехват `md-parser.local` (MainActivity); в браузере — прямые запросы только к сайтам с CORS.
