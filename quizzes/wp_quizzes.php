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

function SetCustomPostType() {
    $singular = 'Quiz';
    $plural   = 'Quizzes';

    //https://developer.wordpress.org/plugins/users/roles-and-capabilities/
    $capabilities = array(

    );

    $labels = array(
        'name'               => $plural,
        'singular_name'      => $singular,
        'add_name'           => 'Add new',
        'add_new_item'       => 'Add new ' . $singular,
        'edit'               => 'edit',
        'edit_item'          => 'Edit ' . $singular,
        'new_item'           => 'New ' . $singular,
        'view'               => 'View ' . $singular,
        'view_item'          => 'View ' . $singular,
        'search_term'        => 'Search '. $plural,
        'parent'             => 'Parent ' . $singular,
        'not_found'          => 'No ' . $plural . ' found',
        'not_found_in_trash' => 'No ' . $plural . ' in Trash'
    );

    register_post_type(
        'quizzes',
        array(
            'labels'              => $labels,
		    'public'              => true,
		    'publicly_queryable'  => true,
		    'exclude_from_search' => false,
		    'show_ui'             => true,
		    'show_in_menu'        => true,
                    'show_in_admin_bar'   => true,
		    'has_archive'         => true,
		    'rewrite'             => true,
		    'query_var'           => true,
            'menu_icon'           => 'dashicons-star-filled', //Find in https://developer.wordpress.org/resource/dashicons
            'menu_position'       => 6,
            'can_export'          => true,
            'delete_with_user'    => false,
            'capability_type'     => 'post',
            'capabilities'        => $capabilities,
            'rewrite'             => array(
                'slug' => 'Quizzes',
                'with_front' => true,
                'pages'      => true,
                'feeds'      => true
            ),
            'supports' => array(
                'title',
                'author',
                'thumbnail',
                'custom-fields',
                'excerpt'
            )
        )
    );

    register_taxonomy(
        'tags_quizzes',
        'quizzes',
        array(
            'hierarchical'  => false,
            'label'         => 'Categorize',
            'singular_name' => 'Categorize',
            'rewrite'       => true,
            'query_var'     => true
        )
    );
}
add_action('init', '\\quizzes\\SetCustomPostType');

function MetaBoxAdd() {

}
add_action('add_meta_boxes', '\\quizzes\\MetaBoxAdd');

function SaveMetaBox($post_id) {

}
add_action('save_post', '\\quizzes\\SaveMetaBox');

function Endpoint() {

}
add_action('template_redirect', '\\quizzes\\Endpoint');