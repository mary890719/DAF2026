<?php
/**
 * DAF2026 共用頁首。
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$page_key = get_query_var( 'daf2026_page_key', 'home' );
?><!doctype html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width,initial-scale=1">
	<?php wp_head(); ?>
</head>
<body <?php body_class(); ?> data-page="<?php echo esc_attr( $page_key ); ?>">
<?php wp_body_open(); ?>
<div id="site-header"></div>
