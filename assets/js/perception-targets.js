// POC 作品 Target 與既有作品 ID 的唯一映射處；正式進場前需以現場照片重新編譯 target。
window.DAF_PERCEPTION_TARGETS = [
  {targetIndex: 0, workId: "main-01", sourceImage: "assets/images/works/main/main-01/01.webp", targetKind: "artist-reference"},
  {targetIndex: 1, workId: "district-08", sourceImage: "assets/images/works/district/district-04_5/main.webp", targetKind: "artist-reference"},
  {targetIndex: 2, workId: "district-11", sourceImage: "assets/images/works/district/district-07/01.webp", targetKind: "artist-reference"}
];

// `.mind` 尚未產生時保持空值；不可用不存在或未驗證的檔案啟動正式 tracking。
window.DAF_PERCEPTION_TRACKING_ASSET = "assets/tracking/artworks-phase2a.mind";
