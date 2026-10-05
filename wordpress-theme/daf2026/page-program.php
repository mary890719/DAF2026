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
                    <div class="program-filter" role="group" aria-label="活動類型篩選">
                        <button type="button" class="is-active" data-program-filter="all" data-program-label="filterAll" aria-pressed="true">全部</button>
                        <button type="button" data-program-filter="講座" data-program-label="filterTalks" aria-pressed="false">講座</button>
                        <button type="button" data-program-filter="工作坊" data-program-label="filterWorkshops" aria-pressed="false">工作坊</button>
                        <button type="button" data-program-filter="導覽" data-program-label="filterTours" aria-pressed="false">導覽</button>
                    </div>
                    <div class="program-card-list" id="program-card-list" aria-live="polite"></div>
                </section>
            </div>
        </main>
<?php get_footer(); ?>
