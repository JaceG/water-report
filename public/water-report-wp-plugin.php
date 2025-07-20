<?php
/**
 * Plugin Name: Water Quality Report Form
 * Plugin URI: //www.waterreportapp.com
 * Description: Embeds a water quality report request form that connects to your remote server.
 * Version: 1.0.0
 * Author: Jace Galloway
 * Author URI: https://hirejace.com
 * Text Domain: water-quality-report
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

class Water_Quality_Report_Plugin {
    /**
     * Plugin instance.
     *
     * @var Water_Quality_Report_Plugin
     */
    private static $instance = null;

    /**
     * Get plugin instance.
     *
     * @return Water_Quality_Report_Plugin
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Constructor.
     */
    private function __construct() {
        // Register shortcode
        add_shortcode('water_report_form', array($this, 'render_water_report_form'));
        
        // Enqueue scripts
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        
        // Add settings page
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'register_settings'));
    }

    /**
     * Render the water report form.
     *
     * @return string Form HTML.
     */
    public function render_water_report_form() {
        // Create container for the form
        return '<div data-water-report-embed></div>';
    }

    /**
     * Enqueue scripts.
     */
    public function enqueue_scripts() {
        // Only enqueue scripts if the shortcode is used on the page
        global $post;
        if (is_a($post, 'WP_Post') && has_shortcode($post->post_content, 'water_report_form')) {
            // API URL from settings (with default fallback)
            $api_url = get_option('water_report_api_url', '//www.waterreportapp.com');
            
            // Add global API URL variable
            wp_register_script('water-report-config', '', array(), '', true);
            wp_enqueue_script('water-report-config');
            wp_add_inline_script('water-report-config', "window.WATER_REPORT_API_URL = '" . esc_js($api_url) . "';");
            
            // Enqueue the embed script
            wp_enqueue_script(
                'water-report-embed',
                $api_url . '/water-report-embed.js',
                array('water-report-config'),
                '1.0.0',
                true
            );
        }
    }

    /**
     * Add admin menu.
     */
    public function add_admin_menu() {
        add_options_page(
            'Water Quality Report Settings',
            'Water Report',
            'manage_options',
            'water-report-settings',
            array($this, 'render_settings_page')
        );
    }

    /**
     * Register settings.
     */
    public function register_settings() {
        register_setting('water_report_settings', 'water_report_api_url');
    }

    /**
     * Render settings page.
     */
    public function render_settings_page() {
        ?>
        <div class="wrap">
            <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
            <form method="post" action="options.php">
                <?php
                settings_fields('water_report_settings');
                do_settings_sections('water_report_settings');
                ?>
                <table class="form-table">
                    <tr valign="top">
                        <th scope="row">API Server URL</th>
                        <td>
                            <input type="url" name="water_report_api_url" value="<?php echo esc_attr(get_option('water_report_api_url', '//www.waterreportapp.com')); ?>" class="regular-text" />
                            <p class="description">Enter the URL where your water report server is hosted (no trailing slash). Default: //www.waterreportapp.com (works with both HTTP and HTTPS)</p>
                        </td>
                    </tr>
                </table>
                <?php submit_button(); ?>
            </form>
            
            <div style="margin-top: 40px; padding: 20px; background: #f8f8f8; border-left: 4px solid #46b450;">
                <h2>How to Use</h2>
                <p>Add the water report form to any page or post using the shortcode:</p>
                <code>[water_report_form]</code>
                
                <h3>Example</h3>
                <p>Creating a dedicated page for the water report form:</p>
                <ol>
                    <li>Go to Pages → Add New</li>
                    <li>Add a title like "Get Your Water Quality Report"</li>
                    <li>Add the shortcode <code>[water_report_form]</code> to the content</li>
                    <li>Publish the page</li>
                </ol>
                
                <h3>Important Note About HTTPS</h3>
                <p>This plugin now supports both HTTP and HTTPS sites using protocol-relative URLs. The form will automatically use the same protocol (HTTP or HTTPS) as your WordPress site.</p>
            </div>
        </div>
        <?php
    }
}

// Initialize the plugin
Water_Quality_Report_Plugin::get_instance(); 