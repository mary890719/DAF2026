<?php
/**
 * DAF2026 English works page.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
set_query_var( 'daf2026_page_key', 'works' );
set_query_var( 'daf2026_language', 'en' );
get_header();
?>
<main id="app" class="container">
            <div id="breadcrumb"></div>
            <p class="page-label" lang="en">WORKS</p>
            <h1 class="page-title">WORKS</h1>
<section class="ia-section works-anchor-section" id="garden" aria-labelledby="garden-title">
                <h2 class="section-title" id="garden-title">TAIPEI COLLECTIBLE BOTANICAL GARDEN</h2>
                <span id="main-venue" class="works-category-anchor" aria-hidden="true"></span>
                <div class="works-grid-frame">
                    <div class="works-grid works-grid-main" id="works-grid-main"></div>
                </div>
            </section>
            <section class="ia-section works-anchor-section" id="outdoor-works" aria-labelledby="outdoor-works-title">
                <h2 class="section-title" id="outdoor-works-title">OUTDOOR WORKS</h2>
                <div class="works-grid-frame"><div class="works-grid works-grid-main" id="works-grid-outdoor"></div></div>
            </section>
            <nav class="page-bottom-nav back-wrap" aria-label="Page navigation"><a class="button" href="<?php echo esc_url( home_url( '/en/district-works/' ) ); ?>">TAIPEI YUANSHAN DISTRICT &gt;</a></nav>
        
</main>
<?php get_footer(); ?>
