<?php
/**
 * DAF2026 English program page.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
set_query_var( 'daf2026_page_key', 'program' );
set_query_var( 'daf2026_language', 'en' );
get_header();
?>
<main id="app" class="container">
            <div id="breadcrumb"></div>
            <p class="page-label" lang="en">PROGRAM</p>
            <h1 class="page-title">PROGRAM</h1>
            <div class="page-sections program-sections">
                <section class="ia-section program-overview" id="program-overview" aria-labelledby="program-overview-title">
                    <header class="program-section-heading"><span aria-hidden="true">01</span><h2 id="program-overview-title" data-program-label="overview">PROGRAM OVERVIEW</h2></header>
                    <div class="program-foldout"><section class="program-opening-column"><h3>AUDIOVISUAL NIGHT</h3><div data-program-opening></div></section><section class="program-schedule-column"><h3>WORKSHOPS / TALKS</h3><div class="program-date-columns" data-program-schedule></div></section></div>
                </section>
                <section class="ia-section program-guide-tour" id="guide-tour" aria-labelledby="guide-tour-title"><header class="program-section-heading"><span aria-hidden="true">02</span><h2 id="guide-tour-title">GUIDED TOURS</h2></header><div class="guide-tour-grid" data-guide-tour-list></div></section>
            </div>
        </main>
<?php get_footer(); ?>
