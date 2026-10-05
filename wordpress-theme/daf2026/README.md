# DAF2026 WordPress Theme

2026 臺北數位藝術節「灰色自動體」官方網站的 WordPress 自訂佈景主題。

## V1 第一階段

- 不修改既有 Prototype。
- Theme 放在 `wordpress-theme/daf2026/`，與既有靜態網站並存。
- 首頁先保留 Prototype DOM，降低轉換風險。
- CSS、JavaScript 與媒體資源沿用既有 `assets/`。
- 後續再處理雙語路由、內頁模板、作品／活動資料管理與 WordPress 後台欄位。

部署前需將 Repository 根目錄的 `assets/` 複製至 Theme 的 `assets/`，再將 `daf2026` 放入 WordPress 的 `wp-content/themes/`。
