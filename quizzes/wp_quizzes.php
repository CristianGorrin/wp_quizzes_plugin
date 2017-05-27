<?php
/*
 * Plugin Name: Quizzes
 * Description: Quizzes plugin
 * Version: 1.0.0
 * Author: Florin Lilea, Frederik Sanner Kjeldsen, Marek Laptaszynski and Cristian Cording Gorrin
 * License: GLPv2
 */
namespace quizzes;

function SetupEnqueue() {
    global $pagenow, $typenow;
    if (($pagenow == 'post-new.php' || $pagenow == 'post.php') && $typenow == 'quizzes') {
        wp_enqueue_script('quizzes_d3_js', plugin_dir_url(__FILE__) . 'js/d3.v3.min.js', array(), '1', false);
        wp_enqueue_script('quizzes_jquery', plugin_dir_url(__FILE__) . 'js/jquery-3.2.1.min.js', array(), '1', false);
        wp_enqueue_script('quizzes_init', plugin_dir_url(__FILE__) . 'js/init.js', array('quizzes_d3_js', 'quizzes_jquery'), '1', false, true);

        wp_enqueue_style('quizzes_main', plugin_dir_url(__FILE__) . 'css/main.css');
    }
}
add_action('admin_enqueue_scripts', '\\quizzes\\SetupEnqueue');