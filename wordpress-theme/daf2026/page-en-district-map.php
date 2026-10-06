<?php
/**
 * DAF2026 English district-map page.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
set_query_var( 'daf2026_page_key', 'district-map' );
set_query_var( 'daf2026_language', 'en' );
get_header();
?>
<main id="app" class="container">
            <div id="breadcrumb"></div>
            <h1 class="page-title">MAP</h1>
            <div class="map-legend" aria-label="Map legend">
                <span data-location-type="outdoor"><i aria-hidden="true"></i>OUTDOOR VENUE</span>
                <span data-location-type="district"><i aria-hidden="true"></i>DISTRICT</span>
            </div>
            <div class="page-sections map-contexts">
<section class="ia-section map-context" id="district-map" data-map-context="district">
                    <h2>ART IN STORES</h2>
                    <p class="map-legend-note">When markers overlap, click or tap to spread them out and select an artwork.</p>
                    <div class="map-shell map-shell-district" data-map-id="district">
                        <div class="map-base-layer"><img class="map-base" src="<?php echo esc_url( get_template_directory_uri() . '/assets/images/map/活動場域MAP_en.webp' ); ?>" alt="District program venue map"></div>
                        <div class="map-overlay-layer" data-map-markers></div>
                        <div class="map-ui-layer"><article class="marker-card" role="dialog" hidden></article></div>
                    </div>
                    <div class="map-work-list" data-map-list="district" data-map-list-type="outdoor"><strong>MAIN VENUE OUTDOOR WORKS</strong></div>
                    <div class="map-work-list" data-map-list="district" data-map-list-type="district"><strong>ART IN STORES</strong></div>
                </section>
            </div>
            <nav class="page-bottom-nav back-wrap" aria-label="Page navigation"><a class="button" href="<?php echo esc_url( home_url( '/en/map/' ) ); ?>">&lt; BOTANICAL GARDEN</a><a class="button" href="<?php echo esc_url( home_url( '/en/shops/' ) ); ?>">PARTNER STORES &gt;</a></nav>
        
</main>
<?php get_footer(); ?>
