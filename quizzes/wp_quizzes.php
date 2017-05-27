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
add_meta_box('questions-meta-box', 'Questions', '\\quizzes\\MetaBoxPrint', 'quizzes', 'normal', 'default');
}
add_action('add_meta_boxes', '\\quizzes\\MetaBoxAdd');

function MetaBoxPrint($post) {
wp_nonce_field(basename(__FILE__), 'quizzes_nonce');

$values = get_post_custom($post->ID);
$json   = isset($values['json_questions']) ? $values['json_questions'][0] : "{ 'name': 'root' }";
?>
<input id="json_questions" name="json_questions" type="hidden" value="" />
<script>
    json_obj = <?= $json ?>;
</script>
<div id="target_tree"></div>
<div id="target_tree_menu">
    <input id="target_add" class="button tagadd" value="Add new answer" type="button" />
    <input id="target_delete" class="button tagadd" value="Delete" type="button" />
    <input id="target_clear" class="button tagadd" value="Clear" type="button" />
    <div class="float_right">
        <input id="target_reset" class="button tagadd" value="Reset zoom and pan" type="button" />
    </div>
</div>
<div class="line"></div>
<div id="target_tree_select">
    <div class="row">
        <h2>Select question</h2>
    </div>

    <div class="row">
        <label class="screen-reader-text" id="select_title_label" for="select_title">Question title</label>
        <input name="select_title" size="30" value="" id="select_title" spellcheck="true" autocomplete="off" type="text" placeholder="Enter question title" />
        <?php wp_enqueue_media() ?> 
        <button class="set_custom_item button">Add an media</button>
        <button id="clear_custom_item" class="button">Remove media</button>
    </div>

    <div class="row">
        <span>Media </span>
        <span id="uri_item"></span>
    </div>

    <div class="row">
        <textarea id="body_text"></textarea>
    </div>

    <div class="row">
        <h3>Answers:</h3>
        <table id="answers_table">
           
        </table>
        <input id="select_update" class="button tagadd" value="Update question" type="button" />
    </div>
</div>
<?php
}

function SaveMetaBox($post_id) {
    if (!isset($_POST['quizzes_nonce'])) {
        return;
    }

	$is_autosave = wp_is_post_autosave($post_id);
    $is_revision = wp_is_post_revision($post_id);
    $is_valid_nonce = wp_verify_nonce($_POST['quizzes_nonce'], basename(__FILE__)) ? 'true' : 'false';

    if ($is_autosave || $is_revision || !$is_valid_nonce) {
        return;
    }

    if (isset($_POST['json_questions'])) {
        update_post_meta($post_id, 'json_questions', $_POST['json_questions']);
    }
}
add_action('save_post', '\\quizzes\\SaveMetaBox');

function Endpoint() {
$url = ((!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] != 'off') || $_SERVER['SERVER_PORT'] == 443) ? "https://" : "http://" . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
    $uri = explode('?', substr($url, strlen(get_site_url())));

    if (count($uri) > 2) return;

    $target = strtolower($uri[0]);
    $query  = array();

    if (count($uri) == 2) {
        foreach (explode('&', $uri[1]) as $item) {
            $temp = explode('=', $item);

            if (count($temp) != 2) continue;

            $query[strtolower($temp[0])] = $temp[1];
        }
    }

    global $wp_query;
    $result = null;

    if ($target == '/quizzes/list/') {
        $result = array();

        if (isset($query['type'])) {
            $result = array();
            $type   = strtolower($query['type']);

            if ($type == 'quizzes') {
                $result['type'] = 'quizzes';

                $args = array(
                    'post_type'   => 'quizzes',
                    'post_status' => 'publish'
                );

                if (isset($query['cat'])) {
                    $args['tags_quizzes'] = $query['cat'];
                }

                if (isset($query['aut'])) {
                    $args['author_name'] = $query['aut'];
                }

                $wp_query = new \WP_Query($args);
                $result['data'] = array();
                while ($wp_query->have_posts()) {
                    $wp_query->the_post();

                    $cat = array();
                    $cats = get_the_terms(\get_the_ID(), 'tags_quizzes');
                    if (is_array($cats)) {
                        foreach ($cats as $item) {
                            array_push($cat, $item->name);
                        }
                    }

                    array_push($result['data'], array(
                        'id'         => \get_the_ID(),
                        'title'      => get_the_title(),
                        'excerpt'    => get_the_excerpt(),
                        'thumbnail'  => get_the_post_thumbnail_url(),
                        'categorize' => $cat,
                        'author'     => get_the_author_meta('display_name'),
                    ));
                }

                wp_reset_postdata();
            } else if ($type == 'categorize') {
                $result['type'] = 'categorize';
                $result['data'] = array();

                $hide_empty = false;
                if (isset($query['hide_empty'])) {
                    if ($query['hide_empty'] == '1') {
                        $hide_empty = true;
                    }
                }

                $temp = get_terms('tags_quizzes', array('hide_empty' => $hide_empty));
                if (is_array($temp)) {
                    foreach ($temp as $item) {
                        array_push($result['data'], array(
                            'name'        => $item->name,
                            'description' => $item->description,
                            'count'       => $item->count
                        ));
                    }
                }
            } else if ($type == 'author') {
                $result['type'] = 'author';
                $result['data'] = array();

                global $wpdb;
                $authors = $wpdb->get_results("select distinct $wpdb->users.id, $wpdb->users.display_name from wordpress.$wpdb->users, $wpdb->posts where $wpdb->users.id = $wpdb->posts.post_author order by $wpdb->users.display_name");
                foreach($authors as $author) {
                    array_push($result['data'], $author);
                }
            }
        }
    } else if ($target == '/quizzes/get/') {
        // use /quizzes/get/?id={the id}
        $result = array();

        if (isset($query['id'])) {
            if (is_numeric($query['id'])) {
                $args = array(
                    'post_type' => 'quizzes',
                    'p'         => $query['id']
                );

                $wp_query = new \WP_Query($args);

                while ($wp_query->have_posts()) {
                    $wp_query->the_post();

                    $cat = array();
                    $cats = get_the_terms(\get_the_ID(), 'tags_quizzes');
                    if (is_array($cats)) {
                        foreach ($cats as $item) {
                            array_push($cat, $item->name);
                        }
                    }

                    $q = array();
                    $temp = get_post_meta($query['id'], 'json_questions');
                    if (isset($temp[0])) {
                        $q = json_decode($temp[0]);
                    }

                    $result = array(
                        'title'      => get_the_title(),
                        'excerpt'    => get_the_excerpt(),
                        'thumbnail'  => get_the_post_thumbnail_url(),
                        'categorize' => $cat,
                        'author'     => get_the_author_meta('display_name'),
                        'questions'  => $q
                    );
                }

                wp_reset_postdata();
            }
        }
    }

    if (is_array($result)) {
        wp_send_json($result);
    }
}
add_action('template_redirect', '\\quizzes\\Endpoint');
