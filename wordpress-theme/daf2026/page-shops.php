<?php
/** DAF2026 shops 頁面。 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
set_query_var( 'daf2026_page_key', 'shops' );
get_header();
?>
<main id="app" class="container">
            <div id="breadcrumb"></div>
            <h1 class="page-title">合作店家</h1>
            <div class="page-sections map-contexts">
<section class="ia-section shop-section" id="art-in-stores">
                    <h2>臺北圓山街區</h2>
                    <div class="shop-list" data-shop-list="venues"></div>
                    <div class="shop-detail-layer" data-shop-detail-layer hidden>
                        <article class="shop-detail-panel" role="dialog" aria-modal="true" aria-labelledby="shop-detail-title" hidden></article>
                    </div>
                </section>
<section class="ia-section shop-section" id="partner-stores">
                    <h2>合作店家</h2>
                    <div class="shop-list" data-shop-list="partners"></div>
</section>
<section class="ia-section shop-section" id="collaboration-projects">
                    <h2>合作企劃</h2>
                    <div class="shop-collaboration-list" data-shop-collaborations></div>
                </section>
        </div>
            <nav class="page-bottom-nav back-wrap" aria-label="頁面快速導覽"><a class="button" href="/district-map/">&lt; 臺北圓山街區</a></nav>
        </main>
<?php get_footer(); ?>
