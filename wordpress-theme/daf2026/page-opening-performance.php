<?php
/** DAF2026 opening-performance 頁面。 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
set_query_var( 'daf2026_page_key', 'event-detail' );
get_header();
?>
<main class="container detail-page event-detail-page" id="main-content">
    <div id="breadcrumb"></div>
    <section class="detail-not-found" data-event-error hidden><h2>找不到此活動</h2><p><a class="button" href="/program/">返回活動節目</a></p></section>
    <article class="event-detail" data-event-detail>
      <header class="detail-header"><p class="event-detail-type" data-event-type></p><h1 data-event-title></h1></header>
      <section class="detail-information" aria-labelledby="event-information-title"><h2 id="event-information-title">活動資訊</h2><dl class="detail-meta"><div data-event-field="date"><dt>日期</dt><dd data-event-date></dd></div><div data-event-field="time"><dt>時間</dt><dd data-event-time></dd></div><div data-event-field="location"><dt>地點</dt><dd data-event-location></dd></div><div data-event-artist-row hidden><dt>藝術家</dt><dd data-event-artist></dd></div><div data-event-artist-team-row hidden><dt>藝術團隊</dt><dd data-event-artist-team></dd></div></dl></section>
      <section class="opening-performance-works" data-opening-performers-section hidden aria-labelledby="event-opening-performers-title"><h2 id="event-opening-performers-title">演出團隊</h2><div class="opening-work-grid" data-opening-performer-list></div><div class="opening-detail-layer" data-opening-detail-layer hidden><article class="opening-detail-panel" role="dialog" aria-modal="true" aria-labelledby="opening-detail-title" hidden></article></div></section>
      <section class="detail-media" data-event-gallery-section hidden><h2>活動紀錄</h2><div class="event-gallery" data-event-gallery></div></section>
    </article>
    <nav class="detail-return-navigation back-wrap" aria-label="返回導覽"><a class="button" href="/program/">返回活動節目</a></nav>
  </main>
<?php get_footer(); ?>
