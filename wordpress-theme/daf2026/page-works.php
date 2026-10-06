<?php
/** DAF2026 works 頁面。 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
set_query_var( 'daf2026_page_key', 'works' );
get_header();
?>
<main id="app" class="container">
            <div id="breadcrumb"></div>
            <p class="page-label" lang="en">WORKS</p>
            <h1 class="page-title">作品介紹</h1>
<section class="ia-section works-anchor-section" id="garden" aria-labelledby="garden-title">
                <h2 class="section-title" id="garden-title">臺北典藏植物園</h2>
                <span id="main-venue" class="works-category-anchor" aria-hidden="true"></span>
                <div class="works-grid-frame">
                    <div class="works-grid works-grid-main" id="works-grid-main"></div>
                </div>
            </section>
            <section class="ia-section works-anchor-section" id="outdoor-works" aria-labelledby="outdoor-works-title">
                <h2 class="section-title" id="outdoor-works-title">戶外作品</h2>
                <div class="works-grid-frame"><div class="works-grid works-grid-main" id="works-grid-outdoor"></div></div>
            </section>
            <nav class="page-bottom-nav back-wrap" aria-label="頁面快速導覽"><a class="button" href="/district-works/">藝術入店 &gt;</a></nav>
        </main>
<?php get_footer(); ?>
