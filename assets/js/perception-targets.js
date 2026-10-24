// POC 作品 Target 與既有作品 ID 的唯一映射處；正式進場前需以現場照片重新編譯 target。
window.DAF_PERCEPTION_TARGETS = [
  {targetIndex: 0, workId: "main-01", sourceImage: "assets/images/works/main/main-01/01.webp", targetKind: "artist-reference"},
  {targetIndex: 1, workId: "district-08", sourceImage: "assets/images/works/district/district-04_5/main.webp", targetKind: "artist-reference"},
  {targetIndex: 2, workId: "district-11", sourceImage: "assets/images/works/district/district-07/01.webp", targetKind: "artist-reference"},
  {targetIndex: 3, workId: "district-02", sourceImage: "assets/images/works/district/district-02/01.webp", targetKind: "artist-reference-frame"},
  {targetIndex: 4, workId: "district-02", sourceImage: "assets/images/works/district/district-02/04.webp", targetKind: "artist-reference-frame"},
  {targetIndex: 5, workId: "district-10", sourceImage: "assets/images/works/district/district-06/main.webp", targetKind: "artist-reference-frame"},
  {targetIndex: 6, workId: "district-10", sourceImage: "assets/images/works/district/district-06/04.webp", targetKind: "artist-reference-frame"},
  {targetIndex: 7, workId: "district-07", sourceImage: "assets/images/works/district/district-04_4/main.webp", targetKind: "artist-reference-installation"},
  {targetIndex: 8, workId: "district-12", sourceImage: "assets/images/works/district/district-08/main.webp", targetKind: "artist-reference-frame"},
  {targetIndex: 9, workId: "district-12", sourceImage: "assets/images/works/district/district-08/02.webp", targetKind: "artist-reference-frame"},
  {targetIndex: 10, workId: "district-03", sourceImage: "assets/tracking/phase2c-targets/district-03/028_467.jpg", targetKind: "authorized-video-frame"},
  {targetIndex: 11, workId: "district-03", sourceImage: "assets/tracking/phase2c-targets/district-03/199_269.jpg", targetKind: "authorized-video-frame"},
  {targetIndex: 12, workId: "district-03", sourceImage: "assets/tracking/phase2c-targets/district-03/256_203.jpg", targetKind: "authorized-video-frame"},
  {targetIndex: 13, workId: "district-04", sourceImage: "assets/tracking/phase2c-targets/district-04/100_791.jpg", targetKind: "authorized-video-frame"},
  {targetIndex: 14, workId: "district-04", sourceImage: "assets/tracking/phase2c-targets/district-04/167_985.jpg", targetKind: "authorized-video-frame"},
  {targetIndex: 15, workId: "district-04", sourceImage: "assets/tracking/phase2c-targets/district-04/235_179.jpg", targetKind: "authorized-video-frame"},
  {targetIndex: 16, workId: "main-05", sourceImage: "assets/images/works/main/main-05/01.webp", targetKind: "artist-reference-installation-poc"},
  {targetIndex: 17, workId: "main-08", sourceImage: "assets/tracking/phase2c-targets/main-08/video-01-008_590.jpg", targetKind: "authorized-video-installation-poc"},
  {targetIndex: 18, workId: "main-08", sourceImage: "assets/tracking/phase2c-targets/main-08/video-02-022_134.jpg", targetKind: "authorized-video-installation-poc"},
  {targetIndex: 19, workId: "district-01", sourceImage: "assets/images/works/district/district-01/main.webp", targetKind: "artist-reference-video-frame"},
  {targetIndex: 20, workId: "district-01", sourceImage: "assets/images/works/district/district-01/03.webp", targetKind: "artist-reference-video-frame"},
  {targetIndex: 21, workId: "district-05", sourceImage: "assets/images/works/district/district-04_2/main.webp", targetKind: "artist-reference-video-frame"},
  {targetIndex: 22, workId: "district-05", sourceImage: "assets/images/works/district/district-04_2/03.webp", targetKind: "artist-reference-video-frame"},
  {targetIndex: 23, workId: "district-06", sourceImage: "assets/tracking/phase2c-targets/district-06/009_990.jpg", targetKind: "authorized-video-fixed-ui-poc"},
  {targetIndex: 24, workId: "district-13", sourceImage: "assets/images/works/district/district-09/main.webp", targetKind: "artist-reference-video-frame"},
  {targetIndex: 25, workId: "district-13", sourceImage: "assets/images/works/district/district-09/03.webp", targetKind: "artist-reference-installation-poc"}
];

// `.mind` 尚未產生時保持空值；不可用不存在或未驗證的檔案啟動正式 tracking。
window.DAF_PERCEPTION_TRACKING_ASSET = "assets/tracking/artworks-phase2d.mind";
