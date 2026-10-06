<?php
/**
 * DAF2026 English shops page.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
set_query_var( 'daf2026_page_key', 'shops' );
set_query_var( 'daf2026_language', 'en' );
get_header();
?>
<main id="app" class="container">
            <div id="breadcrumb"></div>
            <h1 class="page-title">PARTNER STORES</h1>
            <div class="page-sections map-contexts">
<section class="ia-section shop-section" id="art-in-stores">
                    <h2>TAIPEI YUANSHAN DISTRICT</h2>
                    <div class="shop-list" data-shop-list="venues"></div>
                    <div class="shop-detail-layer" data-shop-detail-layer hidden>
                        <article class="shop-detail-panel" role="dialog" aria-modal="true" aria-labelledby="shop-detail-title" hidden></article>
                    </div>
                </section>
<section class="ia-section shop-section" id="partner-stores">
                    <h2>PARTNER STORES</h2>
                    <div class="shop-list" data-shop-list="partners"></div>
</section>
<section class="ia-section shop-section" id="collaboration-projects">
                    <h2>COLLABORATION</h2>
                    <div class="shop-collaboration-list" data-shop-collaborations></div>
                </section>
        </div>
            <nav class="page-bottom-nav back-wrap" aria-label="Page navigation"><a class="button" href="<?php echo esc_url( home_url( '/en/district-map/' ) ); ?>">&lt; TAIPEI YUANSHAN DISTRICT</a></nav>
        
</main>
<?php get_footer(); ?>
