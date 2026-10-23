# PERCEPTION Phase 2-C 批次辨識紀錄

基準：`perception-preview` / `44f4df882d671ae5080052ac255f6ef65bc58390`。本文件只記錄本機候選版；尚未 Commit、Push 或部署。

## 編譯批次

本批次採 MindAR 1.2.5 官方 Image Target compiler 程式碼，以最長邊 1200 px 的工作副本編譯；來源檔未被改寫。保留 Phase 2-B index 0–7，新增 `district-12` 兩張 Repository 圖片，以及 `district-03`、`district-04` 各三張正式影片代表影格，共 16 Targets、9 Work IDs。`maxTrack` 維持 1。

| index | workId | sourceImage | targetKind |
|---:|---|---|---|
| 0 | main-01 | assets/images/works/main/main-01/01.webp | artist-reference |
| 1 | district-08 | assets/images/works/district/district-04_5/main.webp | artist-reference |
| 2 | district-11 | assets/images/works/district/district-07/01.webp | artist-reference |
| 3 | district-02 | assets/images/works/district/district-02/01.webp | artist-reference-frame |
| 4 | district-02 | assets/images/works/district/district-02/04.webp | artist-reference-frame |
| 5 | district-10 | assets/images/works/district/district-06/main.webp | artist-reference-frame |
| 6 | district-10 | assets/images/works/district/district-06/04.webp | artist-reference-frame |
| 7 | district-07 | assets/images/works/district/district-04_4/main.webp | artist-reference-installation |
| 8 | district-12 | assets/images/works/district/district-08/main.webp | artist-reference-frame |
| 9 | district-12 | assets/images/works/district/district-08/02.webp | artist-reference-frame |
| 10 | district-03 | assets/tracking/phase2c-targets/district-03/028_467.jpg | authorized-video-frame, 00:28.467 |
| 11 | district-03 | assets/tracking/phase2c-targets/district-03/199_269.jpg | authorized-video-frame, 03:19.269 |
| 12 | district-03 | assets/tracking/phase2c-targets/district-03/256_203.jpg | authorized-video-frame, 04:16.203 |
| 13 | district-04 | assets/tracking/phase2c-targets/district-04/100_791.jpg | authorized-video-frame, 01:40.791 |
| 14 | district-04 | assets/tracking/phase2c-targets/district-04/167_985.jpg | authorized-video-frame, 02:47.985 |
| 15 | district-04 | assets/tracking/phase2c-targets/district-04/235_179.jpg | authorized-video-frame, 03:55.179 |

## 已取得影片與取樣

影片只存在專案外暫存目錄，未加入 Git。工具：`imageio-ffmpeg 0.6.0`，其附帶 `FFmpeg 7.1 essentials (gyan.dev build)`。每支先取 10%、30%、50%、70%、90%，再人工排除黑畫面、模糊、轉場、片頭尾與非作品畫面。

| workId / 檔案 | 大小 | 實測規格 | 初選時間（秒） | 結論 |
|---|---:|---|---|---|
| district-03 MP4 | 443,944,872 B | 284.67 s；1998×1080；25 fps；H.264/AAC | 28.467, 85.401, 142.335, 199.269, 256.203 | 正式作品內容；選 28.467、199.269、256.203，場景差異大且紋理充足。 |
| district-04 MP4 | 967,849,781 B | 335.97 s；1920×1440；30 fps；H.264/AAC | 33.597, 100.791, 167.985, 235.179, 302.373 | 正式作品內容；選 100.791、167.985、235.179，分別涵蓋輪椅機器人、室內跑步機、拳擊場。 |
| district-06 MP4 | 55,696,506 B | 99.90 s；1920×1080；30 fps；H.264 | 9.990, 29.970, 49.950, 69.930, 89.910 | 可見固定 Photo Booth UI，但主要內容是黑底浮動人臉；只保留 9.990 為 POC 候選，未編譯。 |
| district-13 MP4 | 378,722,974 B | 299.60 s；1920×1080；59.94 fps；H.264/AAC | 29.960, 89.880, 149.800, 209.720, 269.640 | 三頻道效果 DEMO，含頻道／觀看效果文字註記，不能當正式播放畫面 Target；未編譯。 |
| main-08 MOV 1 | 48,404,016 B | 17.18 s；1920×1080；59.97 fps；H.264/AAC | 1.718, 5.154, 8.590, 12.026, 15.462 | 工作室裝置紀錄；8.590 只作立體物 POC 候選，未編譯。 |
| main-08 MOV 2 | 89,892,671 B | 31.62 s；1920×1080；59.97 fps；H.264/AAC | 3.162, 9.486, 15.810, 22.134, 28.458 | 工作室裝置紀錄；22.134 為另一角度 POC 候選，未編譯。 |
| district-02 MP4 | 2,024,558,591 B | 本輪未下載（低優先且已有兩個 Android 通過 Target） | — | 保留 Phase 2-B Target，不增加重複負擔。 |

Drive URL 檢查：`district-06` 清除 file ID 內的 `%20` 後可取得；`district-13` 將異常 query 清理為 `?usp=sharing` 後可取得；`district-14` 原始與清理後皆 404。YouTube 僅確認觀看頁，未使用非官方下載方式。

## 25 件作品候選矩陣

分級：A 可直接進候選編譯；B 可做有限 POC；C 等待正式展場素材；D 目前不適合固定 Image Target。圖片數為 Repository 正式作品圖片數。

| workId | 正式名稱（中／英） | 類型／媒材摘要 | 圖 | 影片來源與取得狀態 | 素材分級 | 候選與驗證界線 |
|---|---|---|---:|---|:---:|---|
| main-01 | Generative Data／Generative Data | 錄像裝置；生成軟體、螢幕 | 5 | 清冊無；Repo 無 | A | 既有 1 Target 已 Android 通過；只涵蓋該固定畫面。 |
| main-02 | 那些字已經無關緊要了／Those words are no longer relevant | 互動裝置；手機、網頁 | 7 | data.js 有 YouTube、清冊空白；未下載 | B | 可從 Repo 圖試固定外觀，需現場 idle 畫面。 |
| main-03 | 這可能是你／It Could Be You | 即時生成影像裝置 | 5 | 無 | D | 內容即時生成，固定 Target 易失效；研究物件／空間或人工選擇備援。 |
| main-04 | 違規穿越馬路／Jaywalking | 互動裝置；螢幕 | 4 | 無 | D | 顯示內容與參與者變動，需穩定 idle 畫面或替代辨識。 |
| main-05 | EZ品質分解機V2／EZ Quality Sorter V2 | 機械裝置 | 4 | 無 | B | Repo 照片可做裝置照片 POC；正式本體需現場多角度。 |
| main-06 | 未來視覺實驗室 穹頂實驗計劃／FUTURE VISION LAB Mini Dome | 沉浸式穹頂、複合媒材 | 3 | 清冊無 | C | 多筆子作品仍是單一 Work ID；需確認穹頂外觀與各播放內容。 |
| main-07 | WM_EX10…／WM_EX10… | 多頻道錄像聲音裝置 | 3 | 無 | C | 需現場裝置外觀與各頻道代表影格。 |
| main-08 | 石夢 v2.0／Stone Dream v2.0 | 機械手臂聲音裝置 | 6 | Drive 2 MOV；可取得 | B | 2 張工作室角度候選；不是正式展場本體驗證。 |
| main-09 | Belugas’ Sphere／Belugas’ Sphere | 互動裝置、氣球 | 5 | YouTube 觀看頁可開；未取得檔案 | C | 動態、反光立體物；需現場不同距離／光線照片。 |
| outdoor-01 | 皓夜／Luminous Night | 戶外燈光裝置 | 4 | YouTube 觀看頁可開；未取得檔案 | C | 日夜外觀差異大，需現場夜間照片。 |
| outdoor-02 | 日光粉紅乒乓／Solar Pink Pong | 戶外互動裝置 | 3 | data.js Vimeo、清冊空白；未下載 | C | 光影與參與者變動，需現場 idle／裝置照片。 |
| district-01 | 科技幽靈／Ghosts of Google | 多頻道錄像 | 5 | YouTube 觀看頁可開；URL 尾端需移除 `%20` | B | Repo 畫面可有限 POC；需各頻道更多正式影格。 |
| district-02 | 匯境／ReAlms Converging | 生成錄像 | 7 | Drive MP4 可取得；本輪未下載 | A | 既有 2 Targets 已 Android 通過。 |
| district-03 | 我喺自強路食芭樂／I'm eating guava on self-improvement road | 錄像／圖案布料 | 5 | Drive MP4 已取得 | A | 新增 3 個跨時段正式影片影格；待 Camera/Android 實測。 |
| district-04 | 我的反抗是如此規律／my resistance is so regular | 影像、CRT、雕塑 | 5 | Drive MP4 已取得 | A | 新增 3 個跨場景正式影片影格；現場 CRT 拍攝仍可能受掃描／反光影響。 |
| district-05 | 景伸：未曾之景／Spectacle Extension: A Landscape That Never Was | 六頻道影像 | 6 | YouTube 觀看頁可開；未取得檔案 | B | Repo 圖只涵蓋有限畫面；需六頻道來源或現場照片。 |
| district-06 | ID／ID | 即時互動影像、機械 | 5 | Drive MP4 已取得（清理 URL） | B | 固定 UI 影格可 POC，但人臉畫面持續變動；本輪不編譯。 |
| district-07 | 游離的引線—延伸版本／Dissociated Fuses | 動力裝置＋即時影像 | 1 | 無 | A | 既有裝置照片 Target 已 Android 通過；不等於正式立體本體多角度通過。 |
| district-08 | I have a Crush on you／I have a Crush on you | 多媒材繪畫／拼布 | 1 | 無 | A | 平面紋理穩定；既有 1 Target 已 Android 通過。 |
| district-09 | 正在連結SOMA GPT／CONNECTING TO SOMA GPT | 互動動畫、Web AR | 5 | YouTube 觀看頁可開；未取得檔案 | B | Repo 圖可測 idle 畫面，互動畫面覆蓋率有限。 |
| district-10 | 呼吸的曼陀羅：共感知／The Breathing Mandala: Co-Perception | 錄像藝術 | 5 | 無 | A | 既有 2 Targets 已 Android 通過。 |
| district-11 | 再重複的信仰／Recursive Religion | 互動裝置；電腦與攝影機 | 2 | YouTube Shorts 觀看頁可開；未取得檔案 | A | 既有 1 Target 已 Android 通過；仍需現場互動狀態驗證。 |
| district-12 | 日常保存：冰淇淋／Everyday Storage: Ice Cream | 影像裝置 | 5 | YouTube 觀看頁可開；未取得檔案 | A | 新增 2 張差異明顯 Repo 影格；待 Camera/Android 實測。 |
| district-13 | 意義生成／Meaning | 三頻道錄像 | 5 | Drive MP4 已取得（清理 URL） | B | 影片為帶標示 DEMO，不編譯；需無註記各頻道母檔或現場影格。 |
| district-14 | 十立方公分的殖民／A Volume of Colonization: 10 cm³ | 單頻道錄像＋投影／物件 | 8 | Drive 原始與清理 URL 均 404 | C | Repo 圖可盤點但不足以代表現場投影至石材；需修正影片權限／現場素材。 |

## 尚待人工實測

- 新增 index 8–15 的真實 Webcam 與 Android Chrome HTTPS 辨識、LOST／reacquire。
- 16 Targets 對原有 0–7 的召回率與誤判回歸。
- Android 首次下載時間、解碼時間、峰值記憶體與長時間穩定性。
- iPhone Safari、正式展場照明、螢幕反光／刷新率、多頻道同步狀態。

本批次從 8 增至 16 Targets。資料庫大小與初始化記憶體將明顯增加；若 Android 出現載入或記憶體壓力，優先拆成「已驗收 8 Targets」與「Phase 2-C 新候選 8 Targets」兩庫，再設計明確的展區／作品群選擇，不直接在本輪更改使用流程。
