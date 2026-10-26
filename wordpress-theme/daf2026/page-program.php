<?php
/** DAF2026 program 頁面。 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
set_query_var( 'daf2026_page_key', 'program' );
get_header();
?>
<main id="app" class="container">
            <div id="breadcrumb"></div>
            <p class="page-label" lang="en">PROGRAM</p>
            <h1 class="page-title">活動節目</h1>
            <div class="page-sections program-sections">
                <section class="ia-section program-overview" id="program-overview" aria-labelledby="program-overview-title">
                    <header class="program-section-heading"><span aria-hidden="true">01</span><h2 id="program-overview-title" data-program-label="overview">節目總覽</h2></header>
                    <div class="program-foldout"><section class="program-opening-column"><h3>音像之夜</h3><div data-program-opening></div></section><section class="program-schedule-column"><h3>工作坊／講座</h3><div class="program-date-columns" data-program-schedule></div></section></div>
                </section>
                <section class="ia-section program-guide-tour" id="guide-tour" aria-labelledby="guide-tour-title"><header class="program-section-heading"><span aria-hidden="true">02</span><h2 id="guide-tour-title">現場導覽</h2></header><div class="guide-tour-grid" data-guide-tour-list></div></section>
            </div>
        </main>
<?php get_footer(); ?>
