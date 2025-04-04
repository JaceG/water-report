# Water Report Form Embedding Instructions

This guide explains how to embed the Water Quality Report form on WordPress websites and Shopify stores.

## Overview

The Water Quality Report form allows visitors to request water quality reports by providing their email and ZIP code. The form connects to our server, which fetches water quality data and sends the report to the user's email.

## Server URL Configuration

The server is running at:
```
//www.waterreportapp.com
```

This format is a protocol-relative URL that works with both HTTP and HTTPS sites. It will automatically use the same protocol (http: or https:) as the parent page where it's embedded.

## WordPress Integration

### Option 1: Using the WordPress Plugin (Recommended)

The easiest way to embed the form is using our WordPress plugin.

### Installation

1. Download the WordPress plugin file (`water-report-wp-plugin.zip`) from this directory.
2. In your WordPress dashboard, go to **Plugins → Add New → Upload Plugin**.
3. Choose the downloaded file and click **Install Now**.
4. After installation, click **Activate Plugin**.

### Configuration

1. In your WordPress dashboard, go to **Settings → Water Report**.
2. Enter the API Server URL: `//www.waterreportapp.com` (no trailing slash).
3. Click **Save Changes**.

### Adding the Form to a Page

Add the form to any page or post using the shortcode:

```
[water_report_form]
```

### Option 2: Manual Embedding

If you prefer not to use a plugin, you can manually embed the form.

#### Step 1: Add the Script to WordPress

Add the following code to your WordPress site's header or footer (via theme settings, a header/footer plugin, or in your child theme):

```html
<script>
    window.WATER_REPORT_API_URL = '//www.waterreportapp.com'; // Works with both HTTP and HTTPS
</script>
<script src="//www.waterreportapp.com/water-report-embed.js"></script>
```

#### Step 2: Add the Embed Container

Place this div anywhere you want the form to appear in your WordPress content:

```html
<div data-water-report-embed></div>
```

You can add this to:
- WordPress pages or posts using the HTML/Custom HTML block
- WordPress widgets that accept HTML
- Theme template files

#### Step 3: Creating a WordPress Shortcode (Optional)

For easier embedding, you can create a shortcode by adding this code to your theme's functions.php file or a custom plugin:

```php
function water_report_form_shortcode() {
    return '<div data-water-report-embed></div>';
}
add_shortcode('water_report_form', 'water_report_form_shortcode');
```

Then use it in your content with: `[water_report_form]`

## Shopify Integration

### Option 1: Using the Shopify Theme Files (Recommended)

The easiest way to add the form to a Shopify store is using our custom theme files.

#### Installation

1. Download the Shopify app files (`water-report-shopify-app.zip`) from the downloads section.
2. In your Shopify admin, go to **Online Store → Themes**.
3. Find your active theme and click **Actions → Edit code**.
4. Copy the files from the package to your theme:
   - Copy `snippets/water-report-form.liquid` to your theme's snippets folder
   - Copy `sections/water-report-section.liquid` to your theme's sections folder
   - Copy `blocks/water-report-block.liquid` to your theme's blocks folder
   - Copy `assets/water-report-config.js` to your theme's assets folder

#### Adding the Form to a Page

After installation, you can add the Water Report form to any page:

1. In your Shopify admin, go to **Online Store → Pages**
2. Create a new page or edit an existing one
3. Click **Add section**
4. Choose **Water Report Form** from the list
5. Customize the title and description as needed
6. Save the page

#### Configure the API URL (Optional)

By default, the app uses `//www.waterreportapp.com` as the API URL. To use a custom API URL:

1. In your Shopify admin, go to **Settings → Metafields**
2. Create a new metafield:
   - Owner type: `Shop`
   - Namespace: `water_report`
   - Key: `api_url`
   - Type: `Single line text`
   - Value: Your API URL (e.g., `//custom-api-url.com`)

### Option 2: Manual Integration

If you prefer to manually integrate the form into a specific part of your Shopify theme:

#### Step 1: Add the Script to Your Theme

Add this code to your theme.liquid file or another template file:

```liquid
<script>
    window.WATER_REPORT_API_URL = '//www.waterreportapp.com';
</script>
{{ '//www.waterreportapp.com/water-report-embed.js' | script_tag }}
```

#### Step 2: Add the Embed Container

Place this div where you want the form to appear:

```liquid
<div data-water-report-embed></div>
```

## HTTPS Support

The form now works with both HTTP and HTTPS websites:

1. For HTTP sites, the form will connect to the server using HTTP
2. For HTTPS sites, the form will connect to the server using HTTPS

This is achieved using protocol-relative URLs (`//www.waterreportapp.com` instead of `http://www.waterreportapp.com`). The embed script automatically detects the protocol of your site and uses the same protocol for API requests.

## Styling Customization

The form comes with default styling that should work well with most themes. If you want to customize the styling, you can add custom CSS.

### WordPress Custom CSS

Add to Customizer → Additional CSS or your theme's custom CSS:

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

### Shopify Custom CSS

Add to your theme's custom CSS or create a new stylesheet:

```css
/* Change the form background color */
.water-report-form-container {
    background-color: #f9f9f9;
}

/* Change the button color */
.water-report-form button {
    background-color: #95bf47;
}

.water-report-form button:hover {
    background-color: #7ba03c;
}
```

## Technical Notes

- The form connects to the server at `//www.waterreportapp.com`
- The server supports both HTTP and HTTPS connections
- Form validation is built-in (email format, ZIP code format)
- CORS is configured to allow embedding on any domain

## Troubleshooting

If the form is not working correctly:

1. Check the browser's console for JavaScript errors
2. Verify that the server is accessible
3. Confirm that CORS is properly configured on the server

## Support

For questions or issues, please contact support at support@your-domain.com 