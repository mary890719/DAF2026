<?php
/**
 * DAF2026 English Map page.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
set_query_var( 'daf2026_page_key', 'map' );
set_query_var( 'daf2026_language', 'en' );
get_header();
?>
<main id="app" class="container">
            <div id="breadcrumb"></div>
            <h1 class="page-title">MAP</h1>
            <div class="map-legend" aria-label="Map legend">
                <span data-location-type="main"><i aria-hidden="true"></i>Taipei Collectible Botanical Garden Floor Plan</span>
            </div>
            <div class="page-sections map-contexts">
<section class="ia-section map-context" id="garden-map" data-map-context="garden">
                    <h2>Taipei Collectible Botanical Garden Floor Plan</h2>
                    <div class="map-shell map-shell-garden" data-map-id="main">
                        <div class="map-base-layer"><img class="map-base" src="<?php echo esc_url( get_template_directory_uri() . '/assets/images/map/主展場MAP_en.webp' ); ?>" alt="Taipei Collectible Botanical Garden main venue map with visitor facilities and exits"></div>
                        <div class="map-overlay-layer" data-map-markers></div>
                        <div class="map-ui-layer"><article class="marker-card" role="dialog" hidden></article></div>
                    </div>
                    <div class="map-work-list" data-map-list="main"><strong>WORKS</strong></div>
                </section>
            </div>
            <nav class="page-bottom-nav back-wrap" aria-label="Page navigation"><a class="button" href="<?php echo esc_url( home_url( '/en/district-map/' ) ); ?>">OUTDOOR WORKS & ART IN STORES &gt;</a></nav>
        
</main>
<?php get_footer(); ?>
