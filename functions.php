<?php

function get_manifest_path($filename) {
  $map = get_template_directory() . '/dist/manifest.json';
  static $hash = null;

  if (null === $hash) {
    $hash = file_exists($map) ? json_decode(file_get_contents($map), true) : [];
  }

  if (array_key_exists($filename, $hash)) {
    return get_template_directory_uri() . '/dist/' . $hash[$filename];
  }

  return $filename;
}

function theme_header_scripts() {
  if ($GLOBALS['pagenow'] != 'wp-login.php' && !is_admin()) {
    wp_register_script('theme_vendors_scripts', get_manifest_path('vendors.js'), false, false, true);
    wp_register_script('themescripts', get_manifest_path('main.js'), ['theme_vendors_scripts'], false, true);

    wp_enqueue_script('themescripts');
    wp_localize_script('themescripts', 'ajax_var', array('url' => admin_url('admin-ajax.php'), 'nonce' => wp_create_nonce('ajax-nonce')));
  }
}

add_action('template_redirect', 'theme_header_scripts');

function theme_styles() {
  if ($GLOBALS['pagenow'] != 'wp-login.php' && !is_admin()) {
    wp_enqueue_style('theme_vendors_style', get_manifest_path('vendors.css'), false, false);
    wp_enqueue_style('theme', get_manifest_path('main.css'), false, false);
  }
};

add_action('wp_enqueue_scripts', 'theme_styles');
