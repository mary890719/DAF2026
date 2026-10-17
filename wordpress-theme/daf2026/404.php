<?php
/**
 * DAF2026 404 頁面。
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$request_path = wp_parse_url( wp_unslash( $_SERVER['REQUEST_URI'] ?? '/' ), PHP_URL_PATH );
$home_path    = wp_parse_url( home_url( '/' ), PHP_URL_PATH );
$relative_path = ltrim( (string) $request_path, '/' );

if ( $home_path && '/' !== $home_path ) {
	$home_prefix = trim( $home_path, '/' );
	if ( $home_prefix === $relative_path ) {
		$relative_path = '';
	} elseif ( 0 === strpos( $relative_path, $home_prefix . '/' ) ) {
		$relative_path = substr( $relative_path, strlen( $home_prefix ) + 1 );
	}
}

$is_english = (bool) preg_match( '#^en(?:/|$)#i', $relative_path );

set_query_var( 'daf2026_page_key', '404' );
set_query_var( 'daf2026_language', $is_english ? 'en' : 'zh' );

status_header( 404 );
nocache_headers();
add_filter(
	'wp_robots',
	static function ( $robots ) {
		$robots['noindex'] = true;
		$robots['follow']  = true;
		return $robots;
	}
);

get_header();
?>
<main class="container not-found-page" id="main-content">
	<section class="not-found-content" aria-labelledby="not-found-title">
		<p class="not-found-code" aria-hidden="true">404</p>
		<h1 id="not-found-title"><?php echo esc_html( $is_english ? 'Page Not Found' : '找不到此頁面' ); ?></h1>
		<p><?php echo esc_html( $is_english ? 'The page you are looking for does not exist or may have moved.' : '您造訪的頁面不存在，或已經移動。' ); ?></p>
		<a class="button" href="<?php echo esc_url( home_url( $is_english ? '/en/' : '/' ) ); ?>"><?php echo esc_html( $is_english ? 'Back to Home' : '返回首頁' ); ?></a>
	</section>
</main>
<?php get_footer(); ?>
