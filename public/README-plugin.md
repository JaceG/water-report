# Water Quality Report Form for WordPress

This WordPress plugin adds a simple, embeddable water quality report request form to your WordPress site. Visitors can enter their email and ZIP code to receive a water quality report for their area.

**Author:** Jace Galloway

## Installation

1. Upload the plugin file to your WordPress site
2. Go to **Plugins → Add New → Upload Plugin**
3. Choose the uploaded file and click **Install Now**
4. After installation, click **Activate Plugin**

## Configuration

1. Go to **Settings → Water Report** in your WordPress dashboard
2. Enter the API Server URL: `http://64.23.239.32:3000` (no trailing slash)
3. Click **Save Changes**

## Usage

Add the form to any page or post using the shortcode:

```
[water_report_form]
```

### Example

1. Go to **Pages → Add New**
2. Add a title like "Get Your Water Quality Report"
3. Add the shortcode `[water_report_form]` to the content
4. Publish the page

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

- The form connects to the server at `http://64.23.239.32:3000`
- The server must have CORS enabled to allow requests from your WordPress domain
- Form validation is built-in (email format, ZIP code format)

## Support

For questions or issues, please contact support at support@your-domain.com 