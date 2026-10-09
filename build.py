# -*- coding: utf-8 -*-
"""Сборка «Медиа дневник»: app/shell.html + app/base.css + app/overrides.css + app/js/*.js
→ media-diary.html (корень), android/app/src/main/assets/index.html
и android/media-android/app/src/main/assets/index.html (gradle-проект APK)."""
import io, os, glob, shutil, sys
sys.stdout.reconfigure(encoding="utf-8")
ROOT = os.path.dirname(os.path.abspath(__file__))  # корень проекта media-diary
shell = io.open(os.path.join(ROOT, "app", "shell.html"), encoding="utf-8").read()
css = (io.open(os.path.join(ROOT, "app", "base.css"), encoding="utf-8").read() + "\n" +
       io.open(os.path.join(ROOT, "app", "overrides.css"), encoding="utf-8").read())
js_files = sorted(glob.glob(os.path.join(ROOT, "app", "js", "*.js")))
assert js_files, "нет app/js/*.js"
js = "\n".join(io.open(f, encoding="utf-8").read() for f in js_files)
out = shell.replace("/*__CSS__*/", css).replace("/*__JS__*/", js)
io.open(os.path.join(ROOT, "media-diary.html"), "w", encoding="utf-8", newline="\n").write(out)
for rel in ("android/app/src/main/assets", "android/media-android/app/src/main/assets"):
    ad = os.path.join(ROOT, rel)
    os.makedirs(ad, exist_ok=True)
    shutil.copy(os.path.join(ROOT, "media-diary.html"), os.path.join(ad, "index.html"))
print("media-diary.html:", os.path.getsize(os.path.join(ROOT, "media-diary.html")) // 1024, "KB | модулей:", len(js_files))
