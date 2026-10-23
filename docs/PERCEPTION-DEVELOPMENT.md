# PERCEPTION Phase 2-B 開發說明

## 本機啟動

此專案是靜態網站，不需要新增 build framework。請在專案根目錄使用任一靜態伺服器，例如：

```powershell
python -m http.server 8080
```

桌機 Debug UI：`http://localhost:8080/map.html?perception=debug`。英文版為 `http://localhost:8080/en/map.html?perception=debug`。

## 手機 HTTPS 測試

`getUserMedia()` 在手機瀏覽器需要 secure context。流程為：電腦啟動本機 server → 使用 HTTPS tunnel 指向本機 port → 手機開啟 tunnel 提供的 HTTPS URL → 按「開始感知」→ 允許 Camera。Tunnel 可選 Cloudflare Tunnel、ngrok 或團隊慣用服務，並非網站 runtime dependency。

## Image Tracking target

POC mapping 集中在 `assets/js/perception-targets.js`：

- target 0：`main-01`／`assets/images/works/main/main-01/01.webp`
- target 1：`district-08`／`assets/images/works/district/district-04_5/main.webp`
- target 2：`district-11`／`assets/images/works/district/district-07/01.webp`
- target 3：`district-02`／`assets/images/works/district/district-02/01.webp`
- target 4：`district-02`／`assets/images/works/district/district-02/04.webp`
- target 5：`district-10`／`assets/images/works/district/district-06/main.webp`
- target 6：`district-10`／`assets/images/works/district/district-06/04.webp`
- target 7：`district-07`／`assets/images/works/district/district-04_4/main.webp`

八張圖片以 MindAR 1.2.5 Compiler 依上述順序編譯為 `assets/tracking/artworks-phase2b.mind`；已通過實機驗收的 `assets/tracking/artworks-phase2a.mind` 保留作為回退基準。正式展場必須用現場光線、展示尺度與觀看角度重新測試或更換 target；編譯成功不代表已通過實體 Camera 驗收。

MindAR runtime 固定為 `mind-ar@1.2.5`，Three.js 固定為 `0.160.0`，均保存在 `assets/vendor/`，不依賴 CDN。`MindARAdapter` 只有在使用者按下開始感知後才動態載入 runtime，並單獨管理 Camera；`DebugAdapter` 不會載入 MindAR。

Camera video 在取得 metadata 後會先以 `object-fit: cover` 填滿感知畫面，再由 MindAR 的 `resize()` 接手尺寸計算。Camera 權限與 runtime 尚未完成前保留「啟動中」介面，避免初始化空窗被誤認為 Webcam 黑畫面。

`ArtworkTracker` 把 UI 與底層辨識器隔離。`MindARAdapter` 將真實 `onTargetFound` 轉為 `potential`／`identified`，並將 `onTargetLost` 轉為 `lost`。UI 不直接引用 MindAR API。

## 實機驗收

請分別在 Android Chrome 與 iPhone Safari，以 HTTPS 開啟一般模式並逐張展示八張 target。確認 ENTITY 的 workId、同一作品的多個 target 不會造成 ENTITY 反覆切換、LOST／reacquire、返回 MAP 後 Camera 指示燈熄滅，以及再次進入時只有一條 Camera stream。Debug URL 只驗證 UI，不算真實辨識驗收。
