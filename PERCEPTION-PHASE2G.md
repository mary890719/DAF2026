# PERCEPTION Phase 2-G main-07 暫定辨識資料庫

## 基準與結果

- 基準：Phase 2-F，39 Targets／24 Work IDs。
- 編譯器：MindAR Image Targets Compiler 1.2.5。
- 輸出：`assets/tracking/artworks-phase2g.mind`。
- 結果：41 Targets／25 Work IDs；新增 `main-07` 兩張暫定 Target。
- Phase 2-F index 0–38 直接沿用編譯資料，深度比對完全一致。

## 素材評估

兩張來源均為 2560×1707 WebP，編譯前等比例縮至 1200×800；未修改 Repository 原始圖片。

| Index | Source image | 黑場比例 | Matching 特徵 | Tracking 特徵 | 判斷與風險 |
| ---: | --- | ---: | ---: | ---: | --- |
| 39 | `assets/images/works/main/main-07/01.webp` | 灰階 `<24`：98.20% | 各尺度 75、64、61、61、47、41、38、35、25、19；合計 466 | 13、9；合計 22 | 編入。裝置數量、左右位置與高低排列可見，但黑場極大，播放畫面細節少，手機曝光可能使特徵消失。 |
| 40 | `assets/images/works/main/main-07/02.webp` | 灰階 `<24`：94.22% | 各尺度 95、112、104、85、93、84、67、63、55、38；合計 796 | 16、13；合計 29 | 編入。裝置外框、排列與地面反射較清楚，特徵量高於 `01.webp`；亮面圖樣規律，仍可能受曝光和播放內容影響。 |

- 兩張縮圖灰階相關係數為 0.088，並非高度相似的重複 Target。
- 兩張都包含相同作品的規律螢幕陣列；MindAR 特徵數量並不保證手機或正式暗場一定可辨識。
- 未發現與既有來源檔案重複；與 39 個既有 Target 的真實誤判風險仍需 Webcam／Android 實測確認。
- 辨識方向是整體硬體排列、裝置外框與地面配置，不依賴單一播放畫面。

## 新增 mapping

| Index | Work ID | Source image | Target kind |
| ---: | --- | --- | --- |
| 39 | `main-07` | `assets/images/works/main/main-07/01.webp` | `artist-reference-installation-poc` |
| 40 | `main-07` | `assets/images/works/main/main-07/02.webp` | `artist-reference-installation-poc` |

## 編譯與驗證界線

- 新增兩個 Target 的特徵編譯耗時：29,018 ms；合併匯出後檔案為 24,267,815 bytes（約 23.14 MiB）。
- SHA-256：`04017DCA96E23473D30AD675B93146CECB5FA4C091E97435226457E321C8D10D`。
- 相較 Phase 2-F 增加 479,574 bytes（約 1.97%）；Target 數由 39 增至 41（約 5.13%）。
- `.mind` 可解碼為 41 Targets，index 0–38 與 Phase 2-F 深度一致。
- mapping 為連續 index 0–40、25 個正式 Work IDs，兩筆新增 Target 共同對應 `main-07`。
- 本機 Debug 僅驗證 Controller、ENTITY 與 FOUND／LOST／reacquire 事件流程，不等同真實 Camera 辨識。
- Webcam、Android Chrome HTTPS、長時間穩定性與正式展場暗場辨識均待人工驗證。
- 正式展場照片取得後，應補拍固定硬體排列，並評估是否替換目前高度依賴黑場曝光的暫定 Target。
