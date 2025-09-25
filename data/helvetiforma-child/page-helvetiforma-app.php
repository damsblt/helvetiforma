<?php
/* Template Name: HelvetiForma App */
defined('ABSPATH') || exit;
?><!doctype html>
<html <?php language_attributes(); ?>>
<head>
  <meta charset="<?php bloginfo('charset'); ?>">
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <?php wp_head(); ?>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
</head>
<body <?php body_class('hf-app'); ?>>
  <header class="hf-header">
    <div class="hf-container hf-header-inner">
      <a class="hf-brand" href="<?php echo esc_url(home_url('/')); ?>">HelvetiForma</a>
      <nav>
        <?php
          wp_nav_menu([
            'theme_location' => 'primary',
            'container'      => false,
            'menu_class'     => 'hf-menu',
            'fallback_cb'    => false
          ]);
        ?>
      </nav>
      <a class="hf-button" href="<?php echo esc_url(home_url('/')); ?>">Retour au site</a>
    </div>
  </header>

  <main class="hf-main">
    <div class="hf-container">
      <div class="hf-content">
        <?php while (have_posts()) : the_post(); the_content(); endwhile; ?>
      </div>
    </div>
  </main>

  <footer class="hf-footer">
    <div class="hf-container">
      <p>&copy; <?php echo esc_html(date('Y')); ?> HelvetiForma. Tous droits réservés.</p>
    </div>
  </footer>

  <?php wp_footer(); ?>
</body>
</html>


