<?php

function get_manifest_path($filename)
{
    $map = get_template_directory() . '/resources/dist/manifest.json';
    $hash = file_exists($map) ? json_decode(file_get_contents($map), true) : [];

    if (array_key_exists($filename, $hash)) {
        return get_template_directory_uri() . '/resources/dist/' . $hash[$filename];
    }

    return $filename;
}

add_action('wp_enqueue_scripts', function () {
    $ver = 0001;
    wp_enqueue_style('vendors-style', get_manifest_path('vendors.css'), array(), $ver, 'all');
    wp_enqueue_script('vendors-ui', get_manifest_path('vendors.js'), array(), $ver, false);
    wp_enqueue_style('style', get_manifest_path('main.css'), array(), $ver, 'all');
    wp_enqueue_script('ui', get_manifest_path('main.js'), array(), $ver, false);
});
