<?php
/**
 * DAF2026 English work-detail page.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
set_query_var( 'daf2026_page_key', 'work-detail' );
set_query_var( 'daf2026_language', 'en' );
get_header();
?>
<main class="container detail-page work-detail" id="main-content">
            <div id="breadcrumb"></div>
            <section class="detail-not-found" data-work-error hidden><h2>Work not found</h2><p><a class="button" href="<?php echo esc_url( home_url( '/en/works/' ) ); ?>">BACK TO WORKS</a></p></section>
            <article class="detail-shell" data-work-detail>
                <section class="detail-left work-detail-section">
                    <div class="work-detail-primary">
                        <header class="detail-header"><p class="detail-number" data-work-number></p><h1 class="detail-title" data-work-title></h1><p class="detail-creators" data-work-creator-names></p></header>
                        <section class="detail-information" aria-labelledby="work-information-title"><h2 id="work-information-title">WORK INFORMATION</h2><dl class="detail-meta"><div data-work-field="year"><dt>YEAR</dt><dd data-work-year></dd></div><div data-work-field="workType"><dt>TYPE</dt><dd data-work-workType></dd></div><div data-work-field="medium"><dt>MEDIUM</dt><dd data-work-medium></dd></div><div data-work-field="location"><dt>LOCATION</dt><dd data-work-location></dd></div></dl><div class="work-links" data-work-links hidden></div></section>
                        <section class="detail-content work-detail-description" data-work-description-section><h2>WORK DESCRIPTION</h2><div data-work-description></div></section>
                        <section class="detail-content work-screening-program" data-work-screening-section hidden><h2>SCREENING PROGRAM</h2><div data-work-screening-program></div></section>
                    </div>
                    <div class="work-detail-secondary"><section class="detail-media" data-work-gallery-section><h2>IMAGES</h2><div class="gallery" data-work-gallery></div></section></div>
                </section>
                <section class="detail-media work-artist-section" aria-labelledby="work-artists-title"><div class="work-artist-primary" data-work-primary-media></div><div class="artist-copy"><h2 id="work-artists-title">ARTIST</h2><div data-work-artists></div></div></section>
                <div class="share"><span>Share</span><span class="share-native-wrap"><button type="button" data-share-native aria-label="Share this page" aria-haspopup="menu" aria-expanded="false"><img class="icon" src="<?php echo esc_url( get_template_directory_uri() . '/assets/icons/share.svg' ); ?>" alt="" aria-hidden="true"></button><span class="copy-link-toast" role="status" aria-live="polite" aria-atomic="true"><img class="icon" src="<?php echo esc_url( get_template_directory_uri() . '/assets/icons/link.svg' ); ?>" alt="" aria-hidden="true"><span></span></span></span></div>
                <nav class="detail-navigation pager" aria-label="Work navigation"><a data-work-previous><span>←　PREVIOUS WORK</span><br><span data-work-previous-title></span></a><a data-work-next><span>NEXT WORK　→</span><br><span data-work-next-title></span></a></nav>
                <div data-work-map-slot hidden></div>
            </article>
            <nav class="detail-return-navigation page-bottom-nav back-wrap" aria-label="Page navigation"><a class="button" href="<?php echo esc_url( home_url( '/en/' ) ); ?>">&lt; BACK TO HOME</a><a class="button" href="<?php echo esc_url( home_url( '/en/works/' ) ); ?>" data-work-return>BACK TO WORKS</a></nav>
            <noscript><p class="container detail-page-noscript">JavaScript is required to display this work.</p></noscript>
        
</main>
<?php get_footer(); ?>
