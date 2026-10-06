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
	$theme_uri = get_template_directory_uri();
	$theme_dir = get_template_directory();

	wp_enqueue_style( 'daf2026-google-font', 'https://fonts.googleapis.com/css2?family=Turret+Road:wght@400;500;700&display=swap', array(), null );
	wp_enqueue_style( 'daf2026-style', $theme_uri . '/assets/css/style.css', array( 'daf2026-google-font' ), filemtime( $theme_dir . '/assets/css/style.css' ) );

	wp_enqueue_script( 'daf2026-data', $theme_uri . '/assets/js/data.js', array(), filemtime( $theme_dir . '/assets/js/data.js' ), true );
	wp_enqueue_script( 'daf2026-components', $theme_uri . '/assets/js/components.js', array( 'daf2026-data' ), filemtime( $theme_dir . '/assets/js/components.js' ), true );
	wp_enqueue_script( 'daf2026-hero-logo', $theme_uri . '/assets/js/hero-logo-animation.js', array(), filemtime( $theme_dir . '/assets/js/hero-logo-animation.js' ), true );
	wp_enqueue_script( 'daf2026-app', $theme_uri . '/assets/js/app.js', array( 'daf2026-components', 'daf2026-hero-logo' ), filemtime( $theme_dir . '/assets/js/app.js' ), true );

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
 * 建立 DAF2026 中英文正式頁面骨架。
 * 僅補上不存在的頁面，不覆寫既有頁面內容。
 */
function daf2026_ensure_site_pages() {
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
	if ( ! get_option( 'daf2026_pages_v1_created' ) ) {
		update_option( 'daf2026_pages_v1_created', 1, false );
	}

	$english_parent = get_page_by_path( 'en', OBJECT, 'page' );
	if ( ! $english_parent ) {
		$english_parent_id = wp_insert_post( array(
			'post_type' => 'page',
			'post_status' => 'publish',
			'post_title' => 'English',
			'post_name' => 'en',
			'post_content' => '',
		) );
	} else {
		$english_parent_id = $english_parent->ID;
	}

	if ( $english_parent_id && ! is_wp_error( $english_parent_id ) ) {
		$english_pages = array(
			'about' => 'About Taipei Digital Art Festival',
			'curatorial' => 'Curatorial Statement',
			'partners' => 'Execution and Partners',
			'map' => 'Taipei Collectible Botanical Garden',
			'district-map' => 'Taipei Yuanshan District Map',
			'shops' => 'Partner Stores',
			'works' => 'Works',
			'district-works' => 'Taipei Yuanshan District Works',
			'work-detail' => 'Work Detail',
			'program' => 'Program',
			'event-detail' => 'Program Detail',
			'opening-performance' => 'Audiovisual Performance',
		);
		foreach ( $english_pages as $slug => $title ) {
			if ( get_page_by_path( 'en/' . $slug, OBJECT, 'page' ) ) {
				continue;
			}
			wp_insert_post( array(
				'post_type' => 'page',
				'post_status' => 'publish',
				'post_title' => $title,
				'post_name' => $slug,
				'post_parent' => $english_parent_id,
				'post_content' => '',
			) );
		}
		update_option( 'daf2026_pages_en_v1_created', 1, false );
	}
}
add_action( 'admin_init', 'daf2026_ensure_site_pages' );

/**
 * 英文子頁使用獨立模板，保留 /en/.../ 階層網址。
 */
function daf2026_english_page_template( $template ) {
	if ( ! is_page() ) {
		return $template;
	}
	$post = get_queried_object();
	if ( ! $post instanceof WP_Post || ! $post->post_parent ) {
		return $template;
	}
	$parent = get_post( $post->post_parent );
	if ( ! $parent || 'en' !== $parent->post_name ) {
		return $template;
	}
	$english_template = get_template_directory() . '/page-en-' . $post->post_name . '.php';
	return file_exists( $english_template ) ? $english_template : $template;
}
add_filter( 'template_include', 'daf2026_english_page_template' );
