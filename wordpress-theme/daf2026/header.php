<?php
/**
 * DAF2026 共用頁首。
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$page_key = get_query_var( 'daf2026_page_key', 'home' );
$daf_language = get_query_var( 'daf2026_language', '' );
?><!doctype html>
<html<?php echo 'en' === $daf_language ? ' lang="en"' : ' ' . get_language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width,initial-scale=1">
	<!-- Google tag (gtag.js) -->
	<script async src="https://www.googletagmanager.com/gtag/js?id=G-0EFSYCGF7M"></script>
	<script>
		window.dataLayer = window.dataLayer || [];
		function gtag(){dataLayer.push(arguments);}
		gtag('js', new Date());
		gtag('config', 'G-0EFSYCGF7M');
	</script>
	<?php wp_head(); ?>
</head>
<body <?php body_class(); ?> data-page="<?php echo esc_attr( $page_key ); ?>">
<?php wp_body_open(); ?>
<div id="site-header"></div>
