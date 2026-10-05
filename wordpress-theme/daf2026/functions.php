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
