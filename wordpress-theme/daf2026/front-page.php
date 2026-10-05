<?php
/**
 * DAF2026 首頁。
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

set_query_var( 'daf2026_page_key', 'home' );
get_header();
?>
<main id="app">
	<section class="hero hero-text hero-sequence-active" id="hero-observation" aria-labelledby="hero-title">
		<div class="hero-background" aria-hidden="true"></div>
		<div class="hero-copy">
			<p class="hero-kicker hero-observation-target" data-observation-id="festival">2026 臺北數位藝術節</p>
			<div class="hero-title-stage hero-logo-prototype hero-observation-target" data-observation-id="title">
				<video class="hero-title-video" src="<?php echo esc_url( get_template_directory_uri() . '/assets/videos/DAF2026_Hero_Logo.webm' ); ?>" autoplay muted playsinline preload="auto" aria-hidden="true"></video>
				<h1 id="hero-title" class="hero-title-text">
					<span class="visually-hidden">灰色自動體 — GRAY AUTONOMOUS ENTITY</span>
					<span class="hero-logo-visual" aria-hidden="true">
						<span class="hero-logo-blocks"></span>
						<span class="hero-logo-recognition"><span class="hero-logo-recognition-zh hero-logo-scramble" data-final-text="灰色自動體">灰色自動體</span><span class="hero-logo-recognition-en hero-logo-scramble" data-final-text="GRAY AUTONOMOUS ENTITY">GRAY AUTONOMOUS ENTITY</span></span>
						<span class="hero-logo-flash"></span>
						<span class="hero-logo-final"><img src="<?php echo esc_url( get_template_directory_uri() . '/assets/images/logos/DAF26LOGO.webp' ); ?>" width="2055" height="593" alt=""></span>
					</span>
				</h1>
			</div>
			<div class="hero-meta hero-observation-target" data-observation-id="details"><span><span class="hero-meta-label">展場｜</span><span class="hero-meta-value">臺北典藏植物園、臺北圓山街區</span></span></div>
		</div>
		<div class="hero-ui"><a class="hero-scroll" href="#exhibition-venues">ENTER</a></div>
	</section>
	<section class="section home-venues" id="exhibition-venues" aria-labelledby="exhibition-venues-title"><div class="container"><h2 class="section-title" id="exhibition-venues-title">展覽地點</h2><div class="home-venue-grid"><a class="home-venue-card" href="<?php echo esc_url( home_url( '/works/' ) ); ?>"><span class="home-venue-number">01</span><strong>臺北典藏植物園</strong></a><a class="home-venue-card" href="<?php echo esc_url( home_url( '/district-works/' ) ); ?>"><span class="home-venue-number">02</span><strong>臺北圓山街區</strong></a></div></div></section>
	<section class="section home-accordion-section"><div class="container"><h2 class="section-title">參展作品</h2><div class="artist-accordion" id="home-artist-accordion" aria-label="參展作品"></div></div></section>
	<section class="section home-featured-section" id="upcoming-programs"><div class="container"><h2 class="section-title home-featured-title">活動節目</h2><div class="home-featured-track" id="home-upcoming-programs" aria-label="活動節目"></div><div class="home-featured-pagination" data-featured-pagination="home-upcoming-programs" aria-label="活動節目分頁"></div><p class="home-featured-more"><a href="<?php echo esc_url( home_url( '/program/' ) ); ?>">查看全部活動 →</a></p></div></section>
</main>
<?php get_footer(); ?>
