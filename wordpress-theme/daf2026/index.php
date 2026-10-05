<?php
/**
 * DAF2026 預設模板。
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

set_query_var( 'daf2026_page_key', 'home' );
get_header();
?>
<main id="app" class="container">
	<h1 class="page-title"><?php bloginfo( 'name' ); ?></h1>
	<?php while ( have_posts() ) : the_post(); ?>
		<article <?php post_class(); ?>><?php the_content(); ?></article>
	<?php endwhile; ?>
</main>
<?php get_footer(); ?>
