# PERCEPTION Phase 2-F 暫定辨識資料庫

## 基準與結果

- 基準：Phase 2-E，37 Targets／22 Work IDs。
- 編譯器：MindAR Image Targets Compiler 1.2.5。
- 輸出：`assets/tracking/artworks-phase2f.mind`。
- 結果：39 Targets／24 Work IDs；新增 `main-04`、`outdoor-01`，未加入 `main-07`。
- Phase 2-E index 0–36 直接沿用編譯資料，深度比對完全一致。

## 候選評估

| Work ID | 候選來源 | 原始尺寸／格式 | MindAR 特徵 | 判斷與風險 |
| --- | --- | --- | --- | --- |
| `main-04` | `assets/images/works/main/main-04/02.webp` | 1500×1001／WebP | matching：238→38；tracking：25／26 | 編入 index 37。三組金屬支架、按鈕與螢幕形成可辨識配置；黑色背景占比高，螢幕為即時內容，正式展場角度和配置可能不同。辨識方向是整體裝置，而非單一監視畫面。 |
| `main-07` | `assets/images/works/main/main-07/main.webp` | 2560×1707／WebP | matching：25–34；tracking：6／6 | 不編入。大面積黑色、近距離亮面與模糊螢幕輪廓缺乏穩定局部特徵；即使能編譯也不代表暗場可辨識。需正式展場硬體配置照片或替代技術。 |
| `outdoor-01` | `assets/images/works/outdoor/outdoor-01/main.webp` | 1999×1333／WebP | matching：344→49；tracking：20／11 | 編入 index 38，僅作暫定 POC。光弧輪廓清楚，但高度規律重複；背景建物、樹木與電線也提供大量特徵，換場後可能失效或誤判。應以現場日／夜照片補強實體支架和裝置結構。 |

matching 數列為各尺度由高解析到低解析的特徵點數摘要；特徵點數不是可靠辨識的單一保證。

## 新增 mapping

| Index | Work ID | Source image | Target kind |
| ---: | --- | --- | --- |
| 37 | `main-04` | `assets/images/works/main/main-04/02.webp` | `artist-reference-installation-poc` |
| 38 | `outdoor-01` | `assets/images/works/outdoor/outdoor-01/main.webp` | `artist-reference-installation-poc` |

## 編譯記錄

- 新增 Target 特徵編譯及合併耗時：19,747 ms。
- 檔案大小：23,788,241 bytes（約 22.69 MiB）。
- SHA-256：`F4EBD3D7B10321155B9C608B709E17990590AD6F1C27FBE1FE674735200C053B`。
- Phase 2-E 大小：22,914,676 bytes；本版增加 873,565 bytes（約 3.81%）。
- Target 數由 37 增至 39（約 5.41%）。

## 驗證與界線

- `.mind` 可解碼為 39 Targets，index 0–36 與 Phase 2-E 深度一致。
- mapping 應保持 index 0–38 連續、來源檔案存在、Work ID 使用正式資料。
- 本機 Debug 僅驗證 Controller、ENTITY 與事件流程；不等同真實 Camera 辨識。
- 人工 Webcam 已確認 `main-04`（index 37）與 `outdoor-01`（index 38）辨識成功；Android Chrome HTTPS 與正式展場辨識仍待人工驗證。
- `main-07` 尚無 Image Target；正式展場照片取得後，優先拍攝多頻道裝置的固定硬體排列、避免只拍黑色播放畫面。
- 資料庫增幅小於 Phase 2-E 擴充，但 Android 下載、解碼與初始化仍需重新量測。
