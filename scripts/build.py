"""從原始檔產生可部署的 dist，保留 GitHub Pages 相對路徑。"""
from pathlib import Path
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
(OUTPUT / '.nojekyll').touch()
print(f'已產生 {OUTPUT}')
