# district-11 Android 辨識補強測試

本版本保留 Phase 2-D index 0–25，僅追加一個 `district-11` 補充 Target。

| index | workId | sourceImage | targetKind |
|---:|---|---|---|
| 26 | district-11 | assets/images/works/district/district-07/main.webp | artist-reference-android-fallback |

## 候選評估

- 原始尺寸：540 × 960；編譯時未放大。
- Tracking points：58（第一層 41、第二層 17）。
- Matching points：3,827。
- 第一層 tracking points 覆蓋 4×4 網格中的 15 格。
- 圖像為不規則的人體影像拼貼；相較 index 2 的規律像素／箭頭網格，週期性重複較少，預期較不易受拍攝螢幕時的摩爾紋干擾。
- 此素材仍是藝術家提供的作品畫面；實際互動裝置是否會穩定呈現相同畫面，必須以 Android 與正式展場實測確認。

## 編譯結果

- MindAR：1.2.5
- Target 數量：27
- 輸出：`assets/tracking/artworks-phase2d-district11.mind`
- 大小：16,924,399 bytes（約 16.14 MiB）
- SHA-256：`8CD56E19513C592ADF5C0BC553A8DBB8283BC8870B66A48C7EE7EBBD58D8A643`
- 編譯耗時：402,261 ms（約 6 分 42 秒）
- Phase 2-D index 0–25 已逐項解碼比對，資料完全一致。
- index 2 保留，不以 index 26 取代。

## 驗收界線

- 本機 Debug 只能驗證 mapping、ENTITY、FOUND／LOST 狀態與同 workId 去重。
- 真實 Android Chrome 辨識必須分別測試 index 2 與 index 26；Debug 成功不代表 Camera 辨識成功。
