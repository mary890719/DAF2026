<?php
/**
 * DAF2026 English district-works page.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
set_query_var( 'daf2026_page_key', 'district-works' );
set_query_var( 'daf2026_language', 'en' );
get_header();
?>
<main id="app" class="container">
            <div id="breadcrumb"></div>
            <p class="page-label" lang="en">WORKS</p>
            <h1 class="page-title">WORKS</h1>
<section class="ia-section works-anchor-section" id="art-in-stores" aria-labelledby="art-in-stores-title">
                <h2 class="section-title" id="art-in-stores-title">ART IN STORES</h2>
                <div class="works-grid-frame">
                    <div class="works-grid works-grid-main" id="works-grid-district"></div>
                </div>
            </section>
            <nav class="page-bottom-nav back-wrap" aria-label="Page navigation"><a class="button" href="<?php echo esc_url( home_url( '/en/works/' ) ); ?>">&lt; BOTANICAL GARDEN</a></nav>
        
</main>
<?php get_footer(); ?>
