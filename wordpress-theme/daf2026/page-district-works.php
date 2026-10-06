<?php
/** DAF2026 district-works 頁面。 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
set_query_var( 'daf2026_page_key', 'district-works' );
get_header();
?>
<main id="app" class="container">
            <div id="breadcrumb"></div>
            <p class="page-label" lang="en">WORKS</p>
            <h1 class="page-title">作品介紹</h1>
<section class="ia-section works-anchor-section" id="art-in-stores" aria-labelledby="art-in-stores-title">
                <h2 class="section-title" id="art-in-stores-title">藝術入店</h2>
                <div class="works-grid-frame">
                    <div class="works-grid works-grid-main" id="works-grid-district"></div>
                </div>
            </section>
            <nav class="page-bottom-nav back-wrap" aria-label="頁面快速導覽"><a class="button" href="/works/">&lt; 臺北典藏植物園</a></nav>
        </main>
<?php get_footer(); ?>
