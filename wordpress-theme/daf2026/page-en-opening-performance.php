<?php
/**
 * DAF2026 English opening-performance page.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
set_query_var( 'daf2026_page_key', 'event-detail' );
set_query_var( 'daf2026_language', 'en' );
get_header();
?>
<main class="container detail-page event-detail-page" id="main-content">
    <div id="breadcrumb"></div>
    <section class="detail-not-found" data-event-error hidden><h2>Program not found</h2><p><a class="button" href="<?php echo esc_url( home_url( '/en/program/' ) ); ?>">BACK TO PROGRAM</a></p></section>
    <article class="event-detail" data-event-detail>
      <header class="detail-header"><p class="event-detail-type" data-event-type></p><h1 data-event-title></h1></header>
      <section class="detail-information" aria-labelledby="event-information-title"><h2 id="event-information-title">Event Information</h2><dl class="detail-meta"><div data-event-field="date"><dt>Date</dt><dd data-event-date></dd></div><div data-event-field="time"><dt>Time</dt><dd data-event-time></dd></div><div data-event-field="location"><dt>Location</dt><dd data-event-location></dd></div><div data-event-artist-row hidden><dt>Artist</dt><dd data-event-artist></dd></div><div data-event-artist-team-row hidden><dt>Artist Team</dt><dd data-event-artist-team></dd></div></dl></section>
      <section class="opening-performance-works" data-opening-performers-section hidden aria-labelledby="event-opening-performers-title"><h2 id="event-opening-performers-title">PERFORMING ARTISTS / TEAMS</h2><div class="opening-work-grid" data-opening-performer-list></div><div class="opening-detail-layer" data-opening-detail-layer hidden><article class="opening-detail-panel" role="dialog" aria-modal="true" aria-labelledby="opening-detail-title" hidden></article></div></section>
      <section class="detail-media" data-event-gallery-section hidden><h2>Event Documentation</h2><div class="event-gallery" data-event-gallery></div></section>
    </article>
    <nav class="detail-return-navigation back-wrap" aria-label="Return navigation"><a class="button" href="<?php echo esc_url( home_url( '/en/program/' ) ); ?>">BACK TO PROGRAM</a></nav>
  
</main>
<?php get_footer(); ?>
