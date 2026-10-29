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
            <h1 class="page-title">INFORMATION</h1>
            <div class="map-legend" aria-label="Map legend">
                <span data-location-type="outdoor"><i aria-hidden="true"></i>OUTDOOR WORKS</span>
                <span data-location-type="district"><i aria-hidden="true"></i>ART IN STORES</span>
            </div>
            <div class="page-sections map-contexts">
<section class="ia-section map-context" id="district-map" data-map-context="district">
                    <h2><span class="section-number">01</span> ART IN STORES MAP</h2>
                    <p class="map-legend-note">When markers overlap, click or tap to spread them out and select an artwork.</p>
                    <div class="map-explorer-layout"><div class="map-map-column"><div class="map-shell map-shell-district" data-map-id="district">
                        <div class="map-base-layer"><img class="map-base" src="<?php echo esc_url( get_template_directory_uri() . '/assets/images/map/活動場域MAP_en.webp' ); ?>" alt="Outdoor works and Art in Stores map"></div>
                        <div class="map-overlay-layer" data-map-markers></div>
                        <div class="map-ui-layer"><article class="marker-card" role="dialog" hidden></article></div>
                    </div></div><div class="map-index-column"><div class="map-work-list" data-map-list="district" data-map-list-type="outdoor"><strong>OUTDOOR WORKS</strong></div><div class="map-work-list" data-map-list="district" data-map-list-type="district"><strong>ART IN STORES</strong></div></div></div>
                </section>
            </div>
            <nav class="page-bottom-nav back-wrap" aria-label="Page navigation"><a class="button" href="<?php echo esc_url( home_url( '/en/map/' ) ); ?>">&lt; BOTANICAL GARDEN</a><a class="button" href="<?php echo esc_url( home_url( '/en/shops/' ) ); ?>">PARTNER STORES &gt;</a></nav>
        </main>
<?php get_footer(); ?>
