# Сборка и QA «Медиа дневник»

## Команды
```bash
python build.py                       # сборка media-diary.html + assets
python -m http.server 8125 --bind 127.0.0.1   # просмотр: /media-diary.html
```

## QA
- `qa.html` — 22 сценария интерфейса (запуск: открыть страницу, итог в `#summary`/`window.__QARESULT`).
- Перед прогоном состояние сбрасывается автоматически (iframe открывается с `?reset=1`).
- Сборка APK только после qa.html без FAIL.

## APK
```bash
# эта машина (toolchain в ../build_tools основного проекта):
export JAVA_HOME="C:\Media Journal App\build_tools\jdk-17.0.10+7"
"C:\Media Journal App\build_tools\gradle-8.7\bin\gradle.bat" assembleDebug --no-daemon
# → android/media-android/app/build/outputs/apk/debug/app-debug.apk → копировать в builds/
```
- applicationId `ru.kriterion.mediadiary`, versionCode/versionName в `android/media-android/app/build.gradle`.
- Gradle-проект — `android/media-android/`; `build.py` кладёт index.html в assets ОБОИХ
  проектов (`android/app/...` — копия-стейджинг и `android/media-android/...` — для APK).
- MainActivity: перехват `md-parser.local` (парсер), file chooser (обложки), download listener (.md/.json), назад → `window.__back()` → `moveTaskToBack`.
