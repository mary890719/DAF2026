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

	wp_enqueue_style( 'daf2026-style', get_template_directory_uri() . '/assets/css/style.css', array(), $theme_version );
	wp_enqueue_script( 'daf2026-data', get_template_directory_uri() . '/assets/js/data.js', array(), $theme_version, true );
	wp_enqueue_script( 'daf2026-components', get_template_directory_uri() . '/assets/js/components.js', array( 'daf2026-data' ), $theme_version, true );
	wp_enqueue_script( 'daf2026-app', get_template_directory_uri() . '/assets/js/app.js', array( 'daf2026-components' ), $theme_version, true );
}
add_action( 'wp_enqueue_scripts', 'daf2026_enqueue_assets' );
