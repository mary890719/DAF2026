# PERCEPTION Phase 2-E 本機測試資料庫

## 基準與範圍

- 分支：`perception-preview`
- 基準：Phase 2-D.1，27 Targets／15 Work IDs
- 編譯器：MindAR Image Targets Compiler 1.2.5
- 輸出：`assets/tracking/artworks-phase2e.mind`
- Phase 2-D.1 的 index 0–26 直接沿用編譯資料，深度比對完全一致。
- 本輪未修改作品正式資料、Excel、Controller、WordPress Theme 或其他網站樣式／元件。

## 十件作品素材盤點

| Work ID | 作品形式 | 分級 | Repository 可用素材與預期辨識對象 | 判斷與主要風險 |
| --- | --- | --- | --- | --- |
| `main-02` | 互動裝置 | B | `main-02/main.webp` 等 7 張；辨識手機、金屬與機械結構的整體配置 | 裝置本體可見，但手機網頁內容、角度與展場配置會變；僅為照片 POC。 |
| `main-03` | 即時生成影像裝置 | B | `main-03/main.webp` 等 5 張；辨識臉孔矩陣與熱感紙輸出 | 即時人臉持續變化；現有圖只能覆蓋特定畫面與既有安裝方式。 |
| `main-04` | 互動裝置 | D | 4 張展出紀錄；螢幕為即時監視畫面 | 候選 `main.webp` tracking 特徵偏低，且螢幕內容不可重現；等待現場固定外框／按鈕照片或改用其他辨識方式。 |
| `main-06` | 沉浸式影音體驗空間／多子作品錄像 | B | 主計畫與 5 件子作品共 32 張；選 3 張不同子作品穹頂影像 | 影格特徵佳，但僅覆蓋 3 個播放內容；子作品仍全部對應正式 Work ID `main-06`。 |
| `main-07` | 多頻道錄像聲音裝置 | D | 3 張暗場紀錄 | 大面積黑色、螢幕重複且 tracking 特徵低；需現場固定硬體近照或替代方案。 |
| `main-09` | 互動裝置 | B | 5 張白鯨裝置紀錄；辨識單一白鯨本體 | 白色平滑表面局部特徵有限，且氣球會移動、旋轉與重組；僅為照片 POC。 |
| `outdoor-01` | 燈光裝置 | C | 4 張光弧照片，清冊有 YouTube 觀看頁 | 結構固定但光弧高度規律重複，候選 tracking 特徵偏低；需現場日夜多距離照片。 |
| `outdoor-02` | 互動裝置 | B | 3 張裝置紀錄；辨識太陽能板、支架與粉紅鏡面 | 固定硬體特徵佳，但正式展場背景、光照與互動反射會不同。 |
| `district-09` | 互動多媒體作品 | B | 5 張動畫／網頁／Web AR 畫面，清冊有 YouTube 觀看頁 | 只覆蓋特定動畫畫面；互動分支與播放階段可能造成 LOST。 |
| `district-14` | 錄像裝置 | B | 8 張實際裝置／投影紀錄；清冊 Drive URL 目前不可用 | 現有圖可做裝置畫面 POC，但未取得正式影片，不能涵蓋完整播放內容；現場投影變形與石材表面仍待驗證。 |

分級定義：A＝固定且可重現；B＝照片／影格 POC、現場待驗證；C＝需補充現場或影片素材；D＝目前不適合固定 Image Target。本輪沒有足以列為 A 的候選。

## 新增 Targets

| Index | Work ID | 來源 | 用途 |
| ---: | --- | --- | --- |
| 27 | `main-02` | `assets/images/works/main/main-02/main.webp` | 裝置整體照片 POC |
| 28 | `main-03` | `assets/images/works/main/main-03/main.webp` | 即時臉孔矩陣畫面 POC |
| 29 | `main-06` | `assets/images/works/main/main-06/main-06_1/work/01.webp` | 子作品穹頂影格 POC |
| 30 | `main-06` | `assets/images/works/main/main-06/main-06_3/work/02.webp` | 子作品穹頂影格 POC |
| 31 | `main-06` | `assets/images/works/main/main-06/main-06_4/work/01.webp` | 子作品穹頂影格 POC |
| 32 | `main-09` | `assets/images/works/main/main-09/01.webp` | 單一白鯨裝置照片 POC |
| 33 | `outdoor-02` | `assets/images/works/outdoor/outdoor-02/01.webp` | 固定硬體照片 POC |
| 34 | `district-09` | `assets/images/works/district/district-05/main.webp` | 互動動畫特定畫面 POC |
| 35 | `district-14` | `assets/images/works/district/district-10/main.webp` | 投影裝置畫面 POC |
| 36 | `district-14` | `assets/images/works/district/district-10/02.webp` | 投影裝置畫面 POC |

未加入 `main-04`、`main-07`、`outdoor-01`。這三件不以低品質 Target 湊數。

## 編譯與完整性

- 總數：37 Targets／22 Work IDs。
- 新增：10 Targets／7 Work IDs。
- 檔案大小：22,914,676 bytes（約 21.85 MiB）。
- SHA-256：`98F9BA5D4F05B0C9F093A2BB54B65421F228F60413058609368AF827FD822CB8`。
- 全量特徵編譯耗時：594,265 ms（約 9 分 54 秒）；其後以已驗收 Phase 2-D.1 編譯資料替換 index 0–26，避免 WebP 解碼差異改變舊 Target。
- 解碼結果：37 Targets；index 0–26 與 `artworks-phase2d-district11.mind` 深度比對一致。

## 驗證界線與風險

- 人工 Webcam 已測試新增 index 27–36：9／10 成功；index 30 因螢幕強烈反光暫時失敗，保留供 Android Chrome HTTPS 複測。
- 本機可驗證 mapping、資源路徑、JavaScript、Debug 狀態與 MAP 回歸。
- Android Chrome HTTPS 與正式展場辨識仍需人工測試；Webcam 或 Debug 成功不等於正式展場辨識成功。
- 相較 Phase 2-D.1 的 16,924,399 bytes，本版增加 5,990,277 bytes（35.39%）。Target 數由 27 增至 37（37.04%）。Android 下載、解碼、初始化時間與峰值記憶體均可能上升。
- `maxTrack = 1` 可限制同時追蹤負擔，但不會消除較大資料庫的載入與 matching 成本。
- 若 Android 出現初始化過慢、記憶體不足或舊 Target 明顯退化，先回退 Phase 2-D.1；多資料庫／展區切換需另案設計，不在本輪改動。
