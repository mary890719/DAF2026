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
                    <div class="program-filter" role="group" aria-label="Filter programs by type">
                        <button type="button" class="is-active" data-program-filter="all" data-program-label="filterAll" aria-pressed="true">ALL</button>
                        <button type="button" data-program-filter="講座" data-program-label="filterTalks" aria-pressed="false">TALKS</button>
                        <button type="button" data-program-filter="工作坊" data-program-label="filterWorkshops" aria-pressed="false">WORKSHOPS</button>
                        <button type="button" data-program-filter="導覽" data-program-label="filterTours" aria-pressed="false">TOURS</button>
                    </div>
                    <div class="program-card-list" id="program-card-list" aria-live="polite"></div>
                </section>
            </div>
        
</main>
<?php get_footer(); ?>
