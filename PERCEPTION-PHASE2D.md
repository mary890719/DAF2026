# PERCEPTION Phase 2-D 批次辨識紀錄

基準：`perception-preview` / `9603c2b04484baf6847bdf6afc655adfd2723a06`。本文件描述本機候選版；尚未 Commit、Push 或部署。

## 選材結論

保留 Phase 2-C index 0–15，新增 10 Targets、6 Work IDs。新增素材分成「直接影像內容」與「有限 POC」；後者不可解讀為正式展場本體辨識已通過。

| index | workId | sourceImage | 來源／用途 | 選用理由與限制 |
|---:|---|---|---|---|
| 16 | main-05 | assets/images/works/main/main-05/01.webp | 藝術家提供之裝置全景；立體裝置照片 POC | 完整呈現顯微鏡、輸送機與支架，結構特徵比局部照豐富；展場角度與背景不同時不保證可辨識。 |
| 17 | main-08 | assets/tracking/phase2c-targets/main-08/video-01-008_590.jpg | 已授權 MOV 1，00:08.590；裝置 POC | 機械手臂與懸吊晶圓關係清楚；屬工作室紀錄。 |
| 18 | main-08 | assets/tracking/phase2c-targets/main-08/video-02-022_134.jpg | 已授權 MOV 2，00:22.134；裝置 POC | 另一角度可見岩石、手臂與晶圓；屬工作室紀錄。 |
| 19 | district-01 | assets/images/works/district/district-01/main.webp | 藝術家提供之播放畫面 | 人群疊影畫面差異明顯；只涵蓋該播放階段。 |
| 20 | district-01 | assets/images/works/district/district-01/03.webp | 藝術家提供之播放畫面 | 高對比數字／文字紋理；只涵蓋該播放階段。 |
| 21 | district-05 | assets/images/works/district/district-04_2/main.webp | 藝術家提供之六頻道內容影格 | 列車與軌道有穩定局部特徵；只代表其中一個頻道／階段。 |
| 22 | district-05 | assets/images/works/district/district-04_2/03.webp | 藝術家提供之六頻道內容影格 | 車站結構、標示與人物形成差異化特徵；不涵蓋其他頻道。 |
| 23 | district-06 | assets/tracking/phase2c-targets/district-06/009_990.jpg | 已授權 MP4，00:09.990；固定 UI POC | `3D Photo Booth` 框架可重現，但中央人臉隨觀眾改變，可靠度有限。 |
| 24 | district-13 | assets/images/works/district/district-09/main.webp | 藝術家提供之作品影像 | 機器人畫面紋理清楚；只代表單一播放階段。 |
| 25 | district-13 | assets/images/works/district/district-09/03.webp | 藝術家提供之展演紀錄；有限 POC | 人物與投影紋理豐富，但屬紀錄照片，不等同三頻道正式畫面。 |

未加入：

- `main-02`：Repository 圖片均為不同展場角度的立體機械／手機裝置，手機內容又會變動；沒有可重現的固定平面畫面。等待本次展場正面、多角度照片。
- `district-09`：互動網頁、動畫與 Web AR 狀態持續改變；現有截圖是特定對話／互動結果，未確認存在穩定 idle 畫面。

## 完整 Target mapping

| index | workId | index | workId |
|---:|---|---:|---|
| 0 | main-01 | 13 | district-04 |
| 1 | district-08 | 14 | district-04 |
| 2 | district-11 | 15 | district-04 |
| 3 | district-02 | 16 | main-05 |
| 4 | district-02 | 17 | main-08 |
| 5 | district-10 | 18 | main-08 |
| 6 | district-10 | 19 | district-01 |
| 7 | district-07 | 20 | district-01 |
| 8 | district-12 | 21 | district-05 |
| 9 | district-12 | 22 | district-05 |
| 10 | district-03 | 23 | district-06 |
| 11 | district-03 | 24 | district-13 |
| 12 | district-03 | 25 | district-13 |

合計 26 Targets、15 Work IDs；`maxTrack` 維持 1。MindAR 1.2.5 compiler 以最長邊 1200 px 的工作副本編譯，來源檔未被改寫。

編譯結果：

- `assets/tracking/artworks-phase2d.mind`
- 16,075,264 bytes（約 15.33 MiB）
- SHA-256：`B2D076A3EB2CC111F659A5E1027EB51EA5EC44C2F9645C630F29B40C9FD77E1E`
- 編譯耗時：618,482 ms（約 10 分 18 秒）
- Phase 2-C：11,057,672 bytes；Phase 2-D 增加 5,017,592 bytes（約 45.4%）

## 驗證界線與效能風險

- Debug、mapping、語法及頁面初始化只能驗證整合，不能取代 Webcam／Android 真實辨識。
- 立體裝置照片只能驗證「照片 Target」，不能證明不同視角、距離、照明下的實體裝置可辨識。
- 錄像 Target 只涵蓋列入的播放階段；畫面變化過快仍可能頻繁 LOST。
- Phase 2-D 從 16 增至 26 Targets。下載、解碼、初始化時間及記憶體都會增加；Android 應實測冷啟動、背景切換、長時間使用及原 16 Targets 回歸。
