"""從原始檔產生可部署的 dist，保留 GitHub Pages 相對路徑。"""
from pathlib import Path
import hashlib
import shutil

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / 'dist'
FILES = ['index.html', 'lesson.html', 'about.html', 'AGENTS.md']
DIRECTORIES = ['assets', 'content']

if OUTPUT.exists():
    shutil.rmtree(OUTPUT)
OUTPUT.mkdir()
for name in FILES:
    shutil.copy2(ROOT / name, OUTPUT / name)
for name in DIRECTORIES:
    shutil.copytree(ROOT / name, OUTPUT / name)
# 樣式更新時改變資源網址，避免公開網站繼續使用快取的舊版 CSS。
style_version = hashlib.sha256((OUTPUT / 'assets/styles.css').read_bytes()).hexdigest()[:12]
for name in FILES:
    if name.endswith('.html'):
        page = OUTPUT / name
        page.write_text(page.read_text(encoding='utf-8').replace(
            'href="assets/styles.css"', f'href="assets/styles.css?v={style_version}"'
        ), encoding='utf-8')
(OUTPUT / '.nojekyll').touch()
print(f'已產生 {OUTPUT}')
