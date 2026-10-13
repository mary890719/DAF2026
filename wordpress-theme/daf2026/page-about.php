<?php
/**
 * DAF2026 關於頁面。
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
set_query_var( 'daf2026_page_key', 'about' );
get_header();
?>
<main id="app" class="container">
            <div id="breadcrumb"></div>
            <p class="page-label" lang="en">ABOUT</p>
            <h1 class="page-title">關於臺北數位藝術節</h1>
            <article class="page-sections about-sections">
<section class="ia-section" id="festival">
                    <div class="about-copy">
                    <p>臺北數位藝術節從2006年開辦已成為每年數位藝術嘉年華會，集結許多世界知名數位藝術作品展出，為身為全球高科技發展重鎮的臺灣，展現人文與創意思維。</p>
                    <p>臺北數位藝術節是重要數位藝術展演平台，集結數位藝術與表演創作競賽成果、國際專業機構共同展出交流，透過臺北數位藝術節，拓展國內創作者視野，並藉由節慶活動方式，匯聚國內數位藝術創作能量，每一年度的臺北數位藝術節不但引領市民領略數位藝術的奧妙，為藝術愛好者提供交流創意與分享成果的活動，近年更將數位藝術平台延伸串連到國際性的策展活動，儼然形成數位藝術創意聚落的世界村。</p>
                    </div>
                </section>

            </article>
            <nav class="page-bottom-nav back-wrap" aria-label="頁面快速導覽"><a class="button" href="<?php echo esc_url( home_url( '/curatorial/' ) ); ?>">策展論述 &gt;</a></nav>
        </main>
<?php get_footer(); ?>
