# Water Report Shopify App

This app allows you to add a Water Quality Report form to your Shopify store. Customers can enter their email and ZIP code to receive a detailed water quality report for their area.

## Installation

### Option 1: Theme App Extension (Recommended)

If you're familiar with Shopify app development, you can use these files to create a Theme App Extension.

### Option 2: Manual Installation

1. In your Shopify admin, go to **Online Store → Themes**
2. Find your active theme and click **Actions → Edit code**
3. Copy the files from this package to your theme:
   - Copy `snippets/water-report-form.liquid` to your theme's snippets folder
   - Copy `sections/water-report-section.liquid` to your theme's sections folder
   - Copy `blocks/water-report-block.liquid` to your theme's blocks folder
   - Copy `assets/water-report-config.js` to your theme's assets folder

### Configure the API URL (Optional)

By default, the app uses `//www.waterreportapp.com` as the API URL. To use a custom API URL:

1. In your Shopify admin, go to **Settings → Metafields**
2. Create a new metafield:
   - Owner type: `Shop`
   - Namespace: `water_report`
   - Key: `api_url`
   - Type: `Single line text`
   - Value: Your API URL (e.g., `//custom-api-url.com`)

## Usage

### Adding the Water Report Form as a Section

After installation, you can add the Water Report form to any page:

1. In your Shopify admin, go to **Online Store → Pages**
2. Create a new page or edit an existing one
3. Click **Add section**
4. Choose **Water Report Form** from the list
5. Customize the title and description as needed
6. Save the page

### Adding the Water Report Form as a Block

You can also add the Water Report form as a block to compatible sections:

1. Edit a page that has a compatible section (like Featured Collection)
2. Click **Add block**
3. Choose **Water Report Form** from the list
4. Customize the title and description as needed
5. Save the page

## Advanced Usage

### Custom Integration

You can also manually add the Water Report form to any Liquid template or section:

```liquid
{% render 'water-report-form' %}
```

## Troubleshooting

If the form is not working correctly:

1. Check the browser's console for JavaScript errors
2. Verify that the API server is accessible
3. Confirm that CORS is properly configured on the server to allow requests from your Shopify store domain

## Support

For questions or issues, please contact support at support@yourcompany.com 