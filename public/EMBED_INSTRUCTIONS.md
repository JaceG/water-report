# Water Report Form Embedding Instructions

This guide explains how to embed the Water Quality Report form on WordPress websites.

## Overview

The Water Quality Report form allows visitors to request water quality reports by providing their email and ZIP code. The form connects to our server, which fetches water quality data and sends the report to the user's email.

## Server URL Configuration

The server is running at:
```
//64.23.239.32:3000
```

This format is a protocol-relative URL that works with both HTTP and HTTPS sites. It will automatically use the same protocol (http: or https:) as the parent page where it's embedded.

## Option 1: Using the WordPress Plugin (Recommended)

The easiest way to embed the form is using our WordPress plugin.

### Installation

1. Download the WordPress plugin file (`water-report-wp-plugin.zip`) from this directory.
2. In your WordPress dashboard, go to **Plugins → Add New → Upload Plugin**.
3. Choose the downloaded file and click **Install Now**.
4. After installation, click **Activate Plugin**.

### Configuration

1. In your WordPress dashboard, go to **Settings → Water Report**.
2. Enter the API Server URL: `//64.23.239.32:3000` (no trailing slash).
3. Click **Save Changes**.

### Adding the Form to a Page

Add the form to any page or post using the shortcode:

```
[water_report_form]
```

## Option 2: Manual Embedding

If you prefer not to use a plugin, you can manually embed the form.

### Step 1: Add the Script to WordPress

Add the following code to your WordPress site's header or footer (via theme settings, a header/footer plugin, or in your child theme):

```html
<script>
    window.WATER_REPORT_API_URL = '//64.23.239.32:3000'; // Works with both HTTP and HTTPS
</script>
<script src="//64.23.239.32:3000/water-report-embed.js"></script>
```

### Step 2: Add the Embed Container

Place this div anywhere you want the form to appear in your WordPress content:

```html
<div data-water-report-embed></div>
```

You can add this to:
- WordPress pages or posts using the HTML/Custom HTML block
- WordPress widgets that accept HTML
- Theme template files

### Step 3: Creating a WordPress Shortcode (Optional)

For easier embedding, you can create a shortcode by adding this code to your theme's functions.php file or a custom plugin:

```php
function water_report_form_shortcode() {
    return '<div data-water-report-embed></div>';
}
add_shortcode('water_report_form', 'water_report_form_shortcode');
```

Then use it in your content with: `[water_report_form]`

## HTTPS Support

The form now works with both HTTP and HTTPS websites:

1. For HTTP sites, the form will connect to the server using HTTP
2. For HTTPS sites, the form will connect to the server using HTTPS

This is achieved using protocol-relative URLs (`//64.23.239.32:3000` instead of `http://64.23.239.32:3000`). The embed script automatically detects the protocol of your WordPress site and uses the same protocol for API requests.

## Styling Customization

The form comes with default styling that should work well with most WordPress themes. If you want to customize the styling, you can add custom CSS to your WordPress theme.

Example custom CSS (add to Customizer → Additional CSS or your theme's custom CSS):

```css
/* Change the form background color */
.water-report-form-container {
    background-color: #f9f9f9;
}

/* Change the button color */
.water-report-form button {
    background-color: #0073aa;
}

.water-report-form button:hover {
    background-color: #005177;
}
```

## Technical Notes

- The form connects to the server at `//64.23.239.32:3000`
- The server supports both HTTP and HTTPS connections
- Form validation is built-in (email format, ZIP code format)

## Troubleshooting

If the form is not working correctly:

1. Check the browser's console for JavaScript errors
2. Verify that the server is accessible at both http://64.23.239.32:3000 and https://64.23.239.32:3000
3. Confirm that CORS is properly configured on the server
4. For HTTPS sites, ensure the server has a valid SSL certificate

## Production Considerations

For production use, consider:
1. Using a domain name instead of an IP address for better usability

## Support

For questions or issues, please contact support at support@your-domain.com 