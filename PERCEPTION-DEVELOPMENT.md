# PERCEPTION 第一階段開發說明

## 本機啟動

此專案是靜態網站，不需要新增 build framework。請在專案根目錄使用任一靜態伺服器，例如：

```powershell
python -m http.server 8080
```

桌機 Debug UI：`http://localhost:8080/map.html?perception=debug`。英文版為 `http://localhost:8080/en/map.html?perception=debug`。

## 手機 HTTPS 測試

`getUserMedia()` 在手機瀏覽器需要 secure context。流程為：電腦啟動本機 server → 使用 HTTPS tunnel 指向本機 port → 手機開啟 tunnel 提供的 HTTPS URL → 按「開始感知」→ 允許 Camera。Tunnel 可選 Cloudflare Tunnel、ngrok 或團隊慣用服務，並非網站 runtime dependency。

## Image Tracking target

POC 候選與 mapping 集中在 `assets/js/perception-targets.js`：

- target 0：`main-01`／`assets/images/works/main/main-01/01.png`
- target 1：`main-07`／`assets/images/works/main/main-07/01.jpg`
- target 2：`main-08`／`assets/images/works/main/main-08/01.jpg`

目前沒有提交未驗證的 `.mind`。產生方式：使用 MindAR 官方 Image Targets Compiler，依上述順序加入三張原圖並匯出單一 `artworks-poc.mind`，放到 `assets/tracking/artworks-poc.mind`，再設定 `window.DAF_PERCEPTION_TRACKING_ASSET`。正式展場必須用現場光線、展示尺度與觀看角度重新測試或更換 target；這三張只供 POC。

`ArtworkTracker` 已把 UI 與底層辨識器隔離。接入 MindAR 時建立 adapter，將 `targetFound` 轉為 `potential`／`identified` 事件、將 `targetLost` 轉為 `lost`，payload 僅需 `{workId, side}`。不要在 UI 內引用 MindAR API。
