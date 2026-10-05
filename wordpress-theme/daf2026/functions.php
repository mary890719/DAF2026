<?php
/**
 * DAF2026 WordPress 佈景主題基礎設定。
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * 啟用基本佈景主題功能。
 */
function daf2026_theme_setup() {
	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'html5', array( 'script', 'style', 'gallery', 'caption' ) );
}
add_action( 'after_setup_theme', 'daf2026_theme_setup' );

/**
 * 載入既有 Prototype 樣式與 JavaScript。
 */
function daf2026_enqueue_assets() {
	$theme_version = wp_get_theme()->get( 'Version' );
	$theme_uri = get_template_directory_uri();

	wp_enqueue_style( 'daf2026-google-font', 'https://fonts.googleapis.com/css2?family=Turret+Road:wght@400;500;700&display=swap', array(), null );
	wp_enqueue_style( 'daf2026-style', $theme_uri . '/assets/css/style.css', array( 'daf2026-google-font' ), $theme_version );

	wp_enqueue_script( 'daf2026-data', $theme_uri . '/assets/js/data.js', array(), $theme_version, true );
	wp_enqueue_script( 'daf2026-components', $theme_uri . '/assets/js/components.js', array( 'daf2026-data' ), $theme_version, true );
	wp_enqueue_script( 'daf2026-hero-logo', $theme_uri . '/assets/js/hero-logo-animation.js', array(), $theme_version, true );
	wp_enqueue_script( 'daf2026-app', $theme_uri . '/assets/js/app.js', array( 'daf2026-components', 'daf2026-hero-logo' ), $theme_version, true );

	wp_add_inline_script(
		'daf2026-data',
		'window.DAF_WP = ' . wp_json_encode(
			array(
				'themeUri' => $theme_uri,
				'homeUrl'  => home_url( '/' ),
			)
		) . ';',
		'before'
	);
}
add_action( 'wp_enqueue_scripts', 'daf2026_enqueue_assets' );


/**
 * 建立 DAF2026 中文正式頁面骨架。
 * 僅補上不存在的頁面，不覆寫既有頁面內容。
 */
function daf2026_ensure_site_pages() {
	if ( get_option( 'daf2026_pages_v1_created' ) ) {
		return;
	}
	$pages = array(
		'about' => '關於臺北數位藝術節',
		'curatorial' => '策展論述',
		'partners' => '單位介紹',
		'map' => '臺北典藏植物園',
		'district-map' => '臺北圓山街區',
		'shops' => '合作店家',
		'works' => '參展作品',
		'district-works' => '圓山街區作品',
		'work-detail' => '作品詳細',
		'program' => '活動節目',
		'event-detail' => '活動詳細',
		'opening-performance' => '開幕演出',
	);
	foreach ( $pages as $slug => $title ) {
		if ( get_page_by_path( $slug, OBJECT, 'page' ) ) {
			continue;
		}
		wp_insert_post( array(
			'post_type' => 'page',
			'post_status' => 'publish',
			'post_title' => $title,
			'post_name' => $slug,
			'post_content' => '',
		) );
	}
	update_option( 'daf2026_pages_v1_created', 1, false );
}
add_action( 'admin_init', 'daf2026_ensure_site_pages' );
