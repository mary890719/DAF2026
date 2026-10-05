<?php
/** DAF2026 map 頁面。 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
set_query_var( 'daf2026_page_key', 'map' );
get_header();
?>
<main id="app" class="container">
            <div id="breadcrumb"></div>
            <h1 class="page-title">探索地圖</h1>
            <div class="map-legend" aria-label="地圖圖例">
                <span data-location-type="main"><i aria-hidden="true"></i>主展場</span>
            </div>
            <div class="page-sections map-contexts">
<section class="ia-section map-context" id="garden-map" data-map-context="garden">
                    <h2>主展場</h2>
                    <div class="map-shell map-shell-garden" data-map-id="main">
                        <div class="map-base-layer"><img class="map-base" src="<?php echo esc_url( get_template_directory_uri() . '/assets/images/map/主展場MAP_zh.webp' ); ?>" alt="臺北典藏植物園主展場地圖，包含廁所、服務台、出入口與緊急逃生口資訊"></div>
                        <div class="map-overlay-layer" data-map-markers></div>
                        <div class="map-ui-layer"><article class="marker-card" role="dialog" hidden></article></div>
                    </div>
                    <div class="map-work-list" data-map-list="main"><strong>作品及藝術家一覽</strong></div>
                </section>
            </div>
            <nav class="page-bottom-nav back-wrap" aria-label="頁面快速導覽"><a class="button" href="/district-map/">臺北圓山街區 &gt;</a></nav>
        </main>
<?php get_footer(); ?>
