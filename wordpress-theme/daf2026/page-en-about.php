<?php
/**
 * DAF2026 English About page.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
set_query_var( 'daf2026_page_key', 'about' );
set_query_var( 'daf2026_language', 'en' );
get_header();
?>
<main id="app" class="container">
            <div id="breadcrumb"></div>
            <p class="page-label" lang="en">ABOUT</p>
            <h1 class="page-title">About Taipei Digital Art Festival</h1>
            <article class="page-sections about-sections">
                <section class="ia-section" id="festival">
                    <div class="about-copy">
                    <p>Since its launch in 2006, the Taipei Digital Art Festival has grown into an annual celebration of digital art, bringing together internationally renowned works from around the world. Taking place in Taiwan, a global hub of high-tech development, the festival highlights the intersection of technology, humanities, and creative thinking.</p>
                    <p>As an important platform for digital art exhibitions and performances, the Taipei Digital Art Festival brings together award-winning works in digital art and performance, while fostering exhibitions and exchanges in collaboration with international professional institutions. Through the festival, local creators are given opportunities to broaden their perspectives, while the festival format brings together the creative energy of Taiwan’s digital art community.</p>
                    <p>Each year, the Taipei Digital Art Festival invites the public to discover the possibilities of digital art and provides artists and art enthusiasts with a platform to exchange ideas and share creative achievements. In recent years, the festival has further extended its digital art platform through connections with international curatorial projects, gradually developing into a global meeting point for digital art and creative communities.</p>
                    </div>
                </section>
            </article>
            <nav class="page-bottom-nav back-wrap" aria-label="Page navigation"><a class="button" href="<?php echo esc_url( home_url( '/en/curatorial/' ) ); ?>">CURATORIAL STATEMENT &gt;</a></nav>
        </main>
<?php get_footer(); ?>
