# 小沐 Python 知識站

給 Python 初學者的繁體中文教材網站。每篇筆記包含學習目標、觀念、短程式、實際輸出、常見錯誤與三選一練習。讀者可搜尋筆記、依主題篩選、複製程式、作答並標記已讀。

## 專案規則

AI 開始修改前，請先閱讀根目錄的 [AGENTS.md](AGENTS.md)。該文件規定網站目的、共用風格、檔案命名、教材欄位、頁面結構及必要檢查。

## 技術

原生 HTML、CSS、JavaScript，教材集中於 `content/lessons.json`，共用 `lesson.html?slug=...` 顯示每篇筆記。Python 3 用於內容檢查與部署目錄整理。無須安裝 Node 套件。

## 本機開啟

```bash
python3 scripts/check.py
python3 scripts/build.py
python3 -m http.server 8000
```

瀏覽 `http://localhost:8000`。以本機伺服器開啟可讓瀏覽器讀取教材 JSON。

## 新增教材

1. 先閱讀 `AGENTS.md` 與現有教材。
2. 在 `content/lessons.json` 新增完整物件。使用唯一英文 slug 與既有分類。
3. 補齊目標、觀念、程式、實際輸出、常見錯誤及三選一練習。
4. 執行檢查與建置，再查看首頁搜尋、分類、教材內容與答題結果。

新增後，首頁和教材網址會由共用程式自動產生。例如 slug 為 `function-parameters` 的教材網址為 `lesson.html?slug=function-parameters`。

可以交給 AI 的指令：

> 請先讀 AGENTS.md，新增一篇「函式參數」筆記，slug 為 function-parameters，分類為語法基礎。依指定欄位補齊內容並驗證範例輸出，沿用共用教材頁，完成後說明檢查結果。

## 網頁成果

公開網站的預定網址為 https://xiaomu-python-notes-1115.bry9487.chatgpt.site 。發布完成後請以瀏覽器確認。

## GitHub 與公開網站

專案已包含 `.github/workflows/pages.yml`，推送到 main 時會先檢查教材，再建置與發布。

1. 在 GitHub 建立一個 Public repository，建議名稱為 `xiaomu-python-notes`。
2. 將本專案完整上傳到 main 分支，保留 `AGENTS.md`、`scripts/` 和 `.github/workflows/pages.yml`。
3. 前往 Settings → Pages → Build and deployment，將 Source 選為 GitHub Actions。
4. 前往 Actions，確認工作流程完成。若設定在第一次推送後才開啟，可選取工作流程並按 Run workflow。
5. 到 Pages 查看實際網址，確認首頁與一篇教材都能開啟，再用該網址繳交。

若使用網頁 Upload files 時沒有保留 `.github` 資料夾，可在 GitHub 的 Add file → Create new file，以 `.github/workflows/pages.yml` 作為檔名，貼上本專案同名檔案內容後提交。

GitHub Pages 設定參考官方文件：https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages

也可在 repository 根目錄執行：

```bash
git init -b main
git add .
git commit -m "Build Xiaomu Python notes with AGENTS rules"
git remote add origin https://github.com/YOUR_USERNAME/xiaomu-python-notes.git
git push -u origin main
```

請將 YOUR_USERNAME 換成自己的 GitHub 帳號，使用已登入的 Git 用戶端進行推送。

## 作業繳交文字

**繳交標題**　長榮大學 112B06053 資工4A 許倖諴 小沐Python知識站

**專案簡介**　我設計「小沐 Python 知識站」，協助初學者依主題閱讀語法與除錯筆記。每篇教材都有觀念、程式範例、對應輸出、常見錯誤與練習題，網站提供搜尋、分類、複製程式及已讀記錄。

**GitHub Repository 連結**　完成上傳後，填入自己的 repository 網址。

**網頁連結**　填入已發布的 Sites 或 GitHub Pages 實際網址。

**AGENTS.md**　檔案位於專案根目錄，定義目的、風格、內容格式、檔案結構、AI 修改規則與檢查方式。

**如何協助 AI 繼續開發**　新增教材時，AI 先閱讀 AGENTS.md，依現有 JSON 欄位加入一篇教材，並執行檢查。共用介面會自動將新教材加入列表、搜尋、分類與獨立分享網址，因此每篇都保有一致的閱讀與練習流程。

## 內容與進度

教材由 AI 協助編寫。站內程式範例經本專案檢查程式執行並比對輸出。已讀記錄使用瀏覽器 localStorage，同一瀏覽器可以保留狀態。
