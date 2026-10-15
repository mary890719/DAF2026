<?php
/**
 * 提供 DAF2026 離線頁面與根目錄 Service Worker Endpoint。
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * 在 WordPress 解析請求時回應固定的離線資源，不建立頁面或改寫規則。
 */
function daf2026_serve_offline_endpoint( $wp ) {
	$path = wp_parse_url( $_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH );
	$site_path = wp_parse_url( home_url( '/' ), PHP_URL_PATH );
	$site_path = '/' . trim( (string) $site_path, '/' );
	$site_path = '/' === $site_path ? '/' : trailingslashit( $site_path );
	$endpoints = array(
		$site_path . 'sw.js' => array( 'sw.js', 'text/javascript; charset=UTF-8' ),
		$site_path . 'offline.html' => array( 'offline.html', 'text/html; charset=UTF-8' ),
		$site_path . 'en/offline.html' => array( 'en/offline.html', 'text/html; charset=UTF-8' ),
	);
	if ( ! is_string( $path ) || ! isset( $endpoints[ $path ] ) ) {
		return;
	}
	if ( ! in_array( $_SERVER['REQUEST_METHOD'] ?? '', array( 'GET', 'HEAD' ), true ) ) {
		status_header( 405 );
		header( 'Allow: GET, HEAD' );
		exit;
	}
	list( $file, $mime ) = $endpoints[ $path ];
	$source = get_template_directory() . '/offline/' . $file;
	if ( ! is_readable( $source ) ) {
		status_header( 404 );
		exit;
	}
	status_header( 200 );
	header( 'Content-Type: ' . $mime );
	header( 'X-Content-Type-Options: nosniff' );
	header( 'Cache-Control: no-cache, must-revalidate' );
	if ( 'sw.js' === $file ) {
		header( 'Service-Worker-Allowed: ' . $site_path );
	}
	if ( 'HEAD' !== ( $_SERVER['REQUEST_METHOD'] ?? '' ) ) {
		readfile( $source );
	}
	exit;
}
add_action( 'parse_request', 'daf2026_serve_offline_endpoint', 0 );
