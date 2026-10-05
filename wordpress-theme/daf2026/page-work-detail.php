<?php
/** DAF2026 work-detail 頁面。 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
set_query_var( 'daf2026_page_key', 'work-detail' );
get_header();
?>
<main class="container detail-page work-detail" id="main-content">
            <div id="breadcrumb"></div>
            <section class="detail-not-found" data-work-error hidden><h2>找不到此作品</h2><p><a class="button" href="/works/">返回作品介紹</a></p></section>
            <article class="detail-shell" data-work-detail>
                <section class="detail-left work-detail-section">
                    <div class="work-detail-primary">
                        <header class="detail-header">
                            <p class="detail-number" data-work-number></p>
                            <h1 class="detail-title" data-work-title></h1>
                            <p class="detail-creators" data-work-creator-names></p>
                        </header>
                        <section class="detail-information" aria-labelledby="work-information-title">
                            <h2 id="work-information-title">作品資訊</h2>
                            <dl class="detail-meta">
                                <div data-work-field="year"><dt>創作年份</dt><dd data-work-year></dd></div>
                                <div data-work-field="workType"><dt>作品類型</dt><dd data-work-workType></dd></div>
                                <div data-work-field="medium"><dt>創作媒材</dt><dd data-work-medium></dd></div>
                                <div data-work-field="location"><dt>展出地點</dt><dd data-work-location></dd></div>
                            </dl>
                            <div class="work-links" data-work-links hidden></div>
                        </section>
                        <section class="detail-content work-detail-description" data-work-description-section>
                            <h2>作品介紹</h2>
                            <div data-work-description></div>
                        </section>
                        <section class="detail-content work-screening-program" data-work-screening-section hidden>
                            <h2>片單</h2>
                            <div data-work-screening-program></div>
                        </section>
                    </div>
                    <div class="work-detail-secondary">
                        <section class="detail-media" data-work-gallery-section>
                            <h2>作品圖片</h2>
                            <div class="gallery" data-work-gallery></div>
                        </section>
                    </div>
                </section>
                <section class="detail-media work-artist-section" aria-labelledby="work-artists-title">
                    <div class="work-artist-primary" data-work-primary-media></div>
                    <div class="artist-copy"><h2 id="work-artists-title">藝術家</h2><div data-work-artists></div></div>
                </section>
                <div class="share">
                    <span>分享至</span>
                    <span class="share-native-wrap">
                        <button type="button" data-share-native aria-label="分享此頁" aria-haspopup="menu" aria-expanded="false">
                            <img class="icon" src="<?php echo esc_url( get_template_directory_uri() . '/assets/icons/share.svg' ); ?>" alt="" aria-hidden="true">
                        </button>
                        <span class="copy-link-toast" role="status" aria-live="polite" aria-atomic="true"><img class="icon" src="<?php echo esc_url( get_template_directory_uri() . '/assets/icons/link.svg' ); ?>" alt="" aria-hidden="true"><span></span></span>
                    </span>
                </div>
                <nav class="detail-navigation pager" aria-label="作品導覽">
                    <a data-work-previous>
                        <span>←　上一件作品</span>
                        <br>
                        <span data-work-previous-title></span>
                    </a>
                    <a data-work-next>
                        <span>下一件作品　→</span>
                        <br>
                        <span data-work-next-title></span>
                    </a>
                </nav>
                <div data-work-map-slot hidden></div>
            </article>
            <nav class="detail-return-navigation page-bottom-nav back-wrap" aria-label="頁面快速導覽"><a class="button" href="/">&lt; 返回首頁</a><a class="button" href="/works/" data-work-return>返回作品介紹</a></nav>
            <noscript><p class="container detail-page-noscript">本頁需要啟用 JavaScript 才能顯示作品資訊。</p></noscript>
        </main>
<?php get_footer(); ?>
