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
 * 取得目前頁面的 SEO 設定。
 * 內容同步自 Prototype 正式 SEO 文案，WordPress 僅負責輸出對應標記。
 */
function daf2026_get_seo_data() {
	$page_uri = is_front_page() ? '' : get_page_uri( get_queried_object_id() );
	$is_english = 'en' === $page_uri || 0 === strpos( $page_uri, 'en/' );
	$page_key = $is_english ? preg_replace( '#^en/?#', '', $page_uri ) : $page_uri;
	$page_key = $page_key ?: 'home';

	$zh = array(
		'home' => array( '2026 臺北數位藝術節「灰色自動體」', '第21屆臺北數位藝術節以「灰色自動體」為題，於2026年10月31日至11月15日在臺北典藏植物園與藝術入店展出，週一休館。', 'website' ),
		'about' => array( '關於臺北數位藝術節｜2026 臺北數位藝術節', '認識臺北數位藝術節的發展與數位藝術展演平台定位，並查看2026主展場參觀時間、地點及交通方式。', 'website' ),
		'curatorial' => array( '灰色自動體：策展論述｜2026 臺北數位藝術節', '2026臺北數位藝術節以「灰色自動體」為主題，關注數位藝術如何回應人工智慧、資訊、生態、生命與非人存在。', 'website' ),
		'partners' => array( '執行與合作單位｜2026 臺北數位藝術節', '查看2026臺北數位藝術節的執行單位、場地合作、合作單位、贊助單位與多媒體設備贊助。', 'website' ),
		'map' => array( '臺北典藏植物園展場地圖｜2026 臺北數位藝術節', '查看2026臺北數位藝術節臺北典藏植物園主展場平面圖與作品位置。', 'website' ),
		'district-map' => array( '藝術入店地圖｜2026 臺北數位藝術節', '查看2026臺北數位藝術節藝術入店的作品與合作場域位置。', 'website' ),
		'shops' => array( '合作店家與合作企劃｜2026 臺北數位藝術節', '查看藝術入店合作店家、場域資訊、營業時間及2026臺北數位藝術節合作企劃。', 'website' ),
		'works' => array( '參展作品｜2026 臺北數位藝術節', '瀏覽2026臺北數位藝術節於臺北典藏植物園及戶外展區展出的參展作品。', 'website' ),
		'district-works' => array( '藝術入店作品｜2026 臺北數位藝術節', '瀏覽2026臺北數位藝術節延伸至藝術入店日常場域的參展作品。', 'website' ),
		'program' => array( '活動節目｜2026 臺北數位藝術節', '查看2026臺北數位藝術節的音像之夜、工作坊、藝術家講座與導覽活動資訊。', 'website' ),
		'event-detail' => array( '活動詳細｜2026 臺北數位藝術節', '2026 臺北數位藝術節活動節目資訊。', 'website' ),
		'work-detail' => array( '作品詳細｜2026 臺北數位藝術節', '2026 臺北數位藝術節參展作品資訊。', 'article' ),
		'opening-performance' => array( '音像之夜｜2026 臺北數位藝術節', '音像之夜；藝術團隊噪流、藝術家 Félix-Antoine Morin；2026.10.31，19:00–22:00，臺北典藏植物園－主展場。', 'website' ),
	);
	$en = array(
		'home' => array( '2026 Taipei Digital Art Festival “Grey Autonomous Entity”', 'The 21st Taipei Digital Art Festival, “Grey Autonomous Entity,” takes place from October 31 to November 15, 2026, at the Taipei Collectible Botanical Garden and across the Art in Stores. Closed on Mondays.', 'website' ),
		'about' => array( 'About | 2026 Taipei Digital Art Festival', 'Learn about the Taipei Digital Art Festival and find visiting hours, venue information, and transportation details for the 2026 main exhibition.', 'website' ),
		'curatorial' => array( 'Grey Autonomous Entity: Curatorial Statement | 2026 Taipei Digital Art Festival', 'The 2026 Taipei Digital Art Festival presents “Grey Autonomous Entity,” examining how digital art responds to artificial intelligence, information, ecology, life, and non-human entities.', 'website' ),
		'partners' => array( 'Execution and Partners | 2026 Taipei Digital Art Festival', 'View the execution team, venue partners, partner organizations, sponsors, and multimedia equipment sponsors of the 2026 Taipei Digital Art Festival.', 'website' ),
		'map' => array( 'Taipei Collectible Botanical Garden Map | 2026 Taipei Digital Art Festival', 'Explore the main venue floor plan and artwork locations at the Taipei Collectible Botanical Garden.', 'website' ),
		'district-map' => array( 'Art in Stores Map | 2026 Taipei Digital Art Festival', 'Explore artwork and partner venue locations across the Art in Stores.', 'website' ),
		'shops' => array( 'Partner Stores and Collaborations | 2026 Taipei Digital Art Festival', 'Explore partner stores, venue information, opening hours, and collaborations across the Art in Stores.', 'website' ),
		'works' => array( 'Works | 2026 Taipei Digital Art Festival', 'Browse works presented at the Taipei Collectible Botanical Garden and outdoor exhibition areas during the 2026 Taipei Digital Art Festival.', 'website' ),
		'district-works' => array( 'Art in Stores Works | 2026 Taipei Digital Art Festival', 'Browse works presented across everyday spaces in the Art in Stores during the 2026 Taipei Digital Art Festival.', 'website' ),
		'program' => array( 'Program | 2026 Taipei Digital Art Festival', 'Explore the 2026 Taipei Digital Art Festival program, including the audiovisual performance, workshops, artist talks, and guided tours.', 'website' ),
		'event-detail' => array( 'PROGRAM DETAIL｜2026 Taipei Digital Art Festival', 'Program information for the 2026 Taipei Digital Art Festival.', 'website' ),
		'work-detail' => array( 'WORK DETAIL｜2026 Taipei Digital Art Festival', 'Exhibiting work information for the 2026 Taipei Digital Art Festival.', 'article' ),
		'opening-performance' => array( 'Audiovisual Performance | 2026 Taipei Digital Art Festival', 'Audiovisual Performance; artist team Fluid Noise and artist Félix-Antoine Morin; October 31, 2026, 19:00–22:00, Taipei Collectible Botanical Garden – Main Venue.', 'website' ),
	);

	$source = $is_english ? $en : $zh;
	if ( ! isset( $source[ $page_key ] ) ) {
		return null;
	}

	return array(
		'title' => $source[ $page_key ][0],
		'description' => $source[ $page_key ][1],
		'type' => $source[ $page_key ][2],
		'language' => $is_english ? 'en' : 'zh',
		'page_key' => $page_key,
	);
}

/**
 * 使用 Prototype 正式 SEO 標題覆寫 WordPress 預設文件標題。
 */
function daf2026_document_title( $title ) {
	$seo = daf2026_get_seo_data();
	return $seo ? $seo['title'] : $title;
}
add_filter( 'pre_get_document_title', 'daf2026_document_title' );

/**
 * 輸出 Prototype 已確認的 description、Open Graph、Twitter 與 hreflang。
 */
function daf2026_output_seo_meta() {
	$seo = daf2026_get_seo_data();
	if ( ! $seo ) {
		return;
	}

	$is_english = 'en' === $seo['language'];
	$page_key = $seo['page_key'];
	$zh_url = 'home' === $page_key ? home_url( '/' ) : home_url( '/' . $page_key . '/' );
	$en_url = 'home' === $page_key ? home_url( '/en/' ) : home_url( '/en/' . $page_key . '/' );
	$is_detail = in_array( $page_key, array( 'work-detail', 'event-detail' ), true );
	$detail_id = $is_detail && isset( $_GET['id'] ) ? sanitize_text_field( wp_unslash( $_GET['id'] ) ) : '';
	if ( '' !== $detail_id ) {
		$zh_url = add_query_arg( 'id', $detail_id, $zh_url );
		$en_url = add_query_arg( 'id', $detail_id, $en_url );
	}
	$canonical_url = $is_english ? $en_url : $zh_url;
	$og_image = get_template_directory_uri() . '/assets/images/seo/daf2026-og-default.webp';
	$locale = $is_english ? 'en_US' : 'zh_TW';
	$alternate_locale = $is_english ? 'zh_TW' : 'en_US';
	$image_alt = $is_english ? '2026 Taipei Digital Art Festival “Grey Autonomous Entity” key visual' : '2026 臺北數位藝術節「灰色自動體」主視覺';
	$twitter_card = in_array( $page_key, array( 'work-detail', 'event-detail' ), true ) ? 'summary' : 'summary_large_image';

	echo "\n" . '<meta name="description" content="' . esc_attr( $seo['description'] ) . '">' . "\n";
	echo '<meta property="og:title" content="' . esc_attr( $seo['title'] ) . '">' . "\n";
	echo '<meta property="og:description" content="' . esc_attr( $seo['description'] ) . '">' . "\n";
	echo '<meta property="og:type" content="' . esc_attr( $seo['type'] ) . '">' . "\n";
	echo '<meta property="og:locale" content="' . esc_attr( $locale ) . '">' . "\n";
	echo '<meta property="og:locale:alternate" content="' . esc_attr( $alternate_locale ) . '">' . "\n";

	if ( 'summary_large_image' === $twitter_card ) {
		echo '<meta property="og:image" content="' . esc_url( $og_image ) . '">' . "\n";
		echo '<meta property="og:image:width" content="1200">' . "\n";
		echo '<meta property="og:image:height" content="630">' . "\n";
		echo '<meta property="og:image:type" content="image/webp">' . "\n";
		echo '<meta property="og:image:alt" content="' . esc_attr( $image_alt ) . '">' . "\n";
	}

	echo '<meta name="twitter:card" content="' . esc_attr( $twitter_card ) . '">' . "\n";
	echo '<meta name="twitter:title" content="' . esc_attr( $seo['title'] ) . '">' . "\n";
	echo '<meta name="twitter:description" content="' . esc_attr( $seo['description'] ) . '">' . "\n";

	if ( 'summary_large_image' === $twitter_card ) {
		echo '<meta name="twitter:image" content="' . esc_url( $og_image ) . '">' . "\n";
		echo '<meta name="twitter:image:alt" content="' . esc_attr( $image_alt ) . '">' . "\n";
	}

	echo '<link rel="canonical" href="' . esc_url( $canonical_url ) . '">' . "\n";
	echo '<link rel="alternate" hreflang="zh-Hant" href="' . esc_url( $zh_url ) . '">' . "\n";
	echo '<link rel="alternate" hreflang="en" href="' . esc_url( $en_url ) . '">' . "\n";
	echo '<link rel="alternate" hreflang="x-default" href="' . esc_url( $zh_url ) . '">' . "\n";
}
add_action( 'wp_head', 'daf2026_output_seo_meta', 2 );


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
