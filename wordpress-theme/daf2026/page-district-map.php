<?php
/** DAF2026 district-map 頁面。 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
set_query_var( 'daf2026_page_key', 'district-map' );
get_header();
?>
<main id="app" class="container">
            <div id="breadcrumb"></div>
            <h1 class="page-title">探索地圖</h1>
            <div class="map-legend" aria-label="地圖圖例">
                <span data-location-type="outdoor"><i aria-hidden="true"></i>主展場戶外</span>
                <span data-location-type="district"><i aria-hidden="true"></i>街區</span>
            </div>
            <div class="page-sections map-contexts">
<section class="ia-section map-context" id="district-map" data-map-context="district">
                    <h2>藝術入店</h2>
                    <p class="map-legend-note">標記重疊時，點擊即可展開並選擇作品展示位置。</p>
                    <div class="map-shell map-shell-district" data-map-id="district">
                        <div class="map-base-layer"><img class="map-base" src="<?php echo esc_url( get_template_directory_uri() . '/assets/images/map/活動場域MAP_zh.webp' ); ?>" alt="活動街區場域地圖"></div>
                        <div class="map-overlay-layer" data-map-markers></div>
                        <div class="map-ui-layer"><article class="marker-card" role="dialog" hidden></article></div>
                    </div>
                    <div class="map-work-list" data-map-list="district" data-map-list-type="outdoor"><strong>主展場戶外作品</strong></div>
                    <div class="map-work-list" data-map-list="district" data-map-list-type="district"><strong>藝術入店</strong></div>
                </section>
            </div>
            <nav class="page-bottom-nav back-wrap" aria-label="頁面快速導覽"><a class="button" href="/map/">&lt; 臺北典藏植物園</a><a class="button" href="/shops/">合作店家 &gt;</a></nav>
        </main>
<?php get_footer(); ?>
