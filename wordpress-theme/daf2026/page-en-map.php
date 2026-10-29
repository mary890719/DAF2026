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
            <h1 class="page-title">INFORMATION</h1>
            <div class="map-legend" aria-label="Map legend">
                <span data-location-type="main"><i aria-hidden="true"></i>Taipei Collectible Botanical Garden Floor Plan</span>
            </div>
            <div class="page-sections map-contexts">
<section class="ia-section map-context" id="garden-map" data-map-context="garden">
                    <h2><span class="section-number">01</span> Taipei Collectible Botanical Garden Map</h2>
                    <div class="map-explorer-layout">
                        <div class="map-map-column"><div class="map-shell map-shell-garden" data-map-id="main">
                            <div class="map-base-layer"><img class="map-base" src="<?php echo esc_url( get_template_directory_uri() . '/assets/images/map/主展場MAP_en.webp' ); ?>" alt="Taipei Collectible Botanical Garden map with visitor facilities and exits"></div>
                            <div class="map-overlay-layer" data-map-markers></div>
                            <div class="map-ui-layer"><article class="marker-card" role="dialog" hidden></article></div>
                        </div></div>
                        <div class="map-index-column"><div class="map-work-list" data-map-list="main"></div></div>
                    </div>
                </section>
                <section class="ia-section exhibition-information" id="exhibition-information">
                    <h2><span class="section-number">02</span> Exhibition Information</h2>
                    <div class="exhibition-information-layout">
                        <div class="exhibition-information-list">
                            <section><h3>Exhibition Dates</h3><p class="visit-primary-value">2026.10.31–11.15</p><p>Closed on Mondays.</p></section>
                            <section><h3>Opening Hours</h3><p class="visit-primary-value">Tue–Sun 09:00–17:00</p><p>On Oct 31, opening hours are extended until 02:00 the following day for Nuit Blanche Taipei.</p></section>
                            <section><h3>Venue</h3><p class="visit-primary-value visit-venue-name">Taipei Expo Park, Xinsheng Park Area – Taipei Collectible Botanical Garden</p><p>No. 16, Binjiang St., Zhongshan Dist., Taipei City</p></section>
                        </div>
                        <div class="exhibition-map-column">
                            <div class="exhibition-google-map"><iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3613.9133132868665!2d121.5317769!3d25.070927099999995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3442a95401821b0d%3A0x26dc1d8284f4461!2z6Ie65YyX5YW46JeP5qSN54mp5ZyS!5e0!3m2!1szh-TW!2sus!4v1786722022654!5m2!1szh-TW!2sus" title="Taipei Expo Park, Xinsheng Park Area – Taipei Collectible Botanical Garden on Google Maps" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>
                            <a class="button exhibition-map-link" href="https://www.google.com/maps/search/?api=1&amp;query=No.%2016%2C%20Binjiang%20St.%2C%20Zhongshan%20Dist.%2C%20Taipei%20City" target="_blank" rel="noopener noreferrer">Open in Google Maps</a>
                        </div>
                    </div>
                </section>
                <section class="ia-section transportation-information" id="transportation">
                    <h2><span class="section-number">03</span> Transportation Information</h2>
                    <button class="transport-route-map" type="button" data-transport-map-open aria-label="Enlarge transportation route map"><img src="<?php echo esc_url( get_template_directory_uri() . '/assets/images/map/交通資訊_en.webp' ); ?>" alt="Transportation route map for Taipei Collectible Botanical Garden"></button>
                    <div class="transport-content transport-method-grid">
                        <section class="transport-section"><h3>01. MRT</h3><section class="transport-route-group"><h4>YUANSHAN STATION</h4><ul><li>Walk to the exhibition area.</li><li>Transfer to Red 50 and get off at Xinsheng Park.</li><li>Transfer to bus 542 and get off at Jilin Road Terminal.</li></ul></section><section class="transport-route-group"><h4>DAZHI STATION</h4><ul><li>Transfer to bus 72 or 722 and get off at Xinsheng Park (Lin An Tai).</li></ul></section><section class="transport-route-group"><h4>ZHONGSHAN ELEMENTARY SCHOOL STATION</h4><ul><li>Walk to the exhibition area.</li></ul></section></section>
                        <section class="transport-section"><h3>02. Bus</h3><section class="transport-route-group"><h4>MINZU EAST ROAD INTERSECTION</h4><p>109, 203, 277, 279, 280, 280 Direct, 542, 606, 606 Commuter, 612, 685, Dunhua Main Line</p></section><section class="transport-route-group"><h4>XINSHENG PARK</h4><p>Red 50, 685, Citizen Minibus 9</p></section><section class="transport-route-group"><h4>XINSHENG PARK (LIN AN TAI)</h4><p>72, 222, 286 Shuttle, 298, 643, 676, Citizen Minibus 9, Songjiang–Xinsheng Main Line, Fuxing Main Line</p></section><section class="transport-route-group"><h4>JILIN ROAD TERMINAL</h4><p>542</p></section></section>
                        <section class="transport-section transport-section-wide"><h3>03. WeMo Shared Scooters</h3><p>During the festival, a dedicated WeMo scooter rental and return zone will be available at the Xinsheng Park Surface Parking Lot (outside Taipei Xinsheng Sports Center). Visitors can take a WeMo scooter directly to the festival venue or explore Art in Stores at their own pace.</p></section>
                    </div>
                    <a class="button transport-navigation-link" href="https://www.google.com/maps/dir/?api=1&amp;destination=Taipei%20Collectible%20Botanical%20Garden" target="_blank" rel="noopener noreferrer">Google Maps Navigation</a>
                </section>
            </div>
            <nav class="page-bottom-nav back-wrap" aria-label="Page navigation"><a class="button" href="<?php echo esc_url( home_url( '/en/district-map/' ) ); ?>">ART IN STORES MAP &gt;</a></nav>
        </main>
<?php get_footer(); ?>
