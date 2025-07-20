# Water Report Landing Page
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A comprehensive water quality reporting system that scrapes data from the Environmental Working Group (EWG) database and provides embeddable forms for WordPress and Shopify websites. Users enter their email and ZIP code to receive detailed water quality reports via email through Klaviyo integration.

## Features

- **Real-time EWG Data Scraping**: Fetches live water quality data from ewg.org based on ZIP codes
- **Email Integration**: Automatically sends detailed water reports via Klaviyo email marketing platform
- **Multi-platform Embedding**: Ready-to-use integrations for WordPress and Shopify
- **Embeddable Widget**: JavaScript widget that can be embedded on any website
- **Protocol-relative URLs**: Supports both HTTP and HTTPS embedding environments
- **CORS Enabled**: Cross-domain embedding support for seamless integration
- **SSL/HTTPS Support**: Optional HTTPS server with certificate support

### Water Report Details
- Water system information from EWG database
- Contaminant levels compared to health guidelines (with multiplier values)
- Detailed explanations of each contaminant's potential health effects
- Legal limits vs. health guidelines comparison
- Data sourced from Environmental Working Group's comprehensive database

## Tech Stack

- **Backend**: Express.js with ES6 modules
- **Data Scraping**: Axios + Cheerio for EWG website scraping
- **Email Marketing**: Klaviyo API integration
- **Frontend**: Vanilla JavaScript (embeddable widget)
- **Security**: CORS enabled, SSL/HTTPS support

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Klaviyo account (for email integration)

### Environment Variables

Create a `.env` file in the root directory:

```
KLAVIYO_PUBLIC_API_KEY=your_klaviyo_public_api_key_here
NODE_ENV=development
PORT=3000
HTTPS_PORT=443
```

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/water-report-app.git
cd water-report-app
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables (see above)

4. Start the development server
```bash
npm run dev
```

Or use the development script (if you had React - currently not applicable):
```bash
./start-dev.sh
```

### Available Scripts

- `npm run dev` - Starts the Express server with nodemon for development
- `npm start` - Runs the production server
- **Note**: The start-dev.sh script references React scripts that don't exist in the current package.json

## Project Structure

```
water-report-app/
├── public/                # Static files and integrations
│   ├── index.html         # Main landing page
│   ├── water-report-embed.js        # Embeddable widget script
│   ├── embed-demo.html             # Demo page for embedding
│   ├── EMBED_INSTRUCTIONS.md       # Integration documentation
│   ├── water-report-wp-plugin.php  # WordPress plugin
│   ├── water-report-wp-plugin.zip  # WordPress plugin package
│   ├── water-report-shopify-app/   # Shopify integration files
│   │   ├── assets/         # JavaScript configuration
│   │   ├── snippets/       # Liquid templates
│   │   ├── sections/       # Shopify sections
│   │   ├── blocks/         # Shopify blocks
│   │   └── README.md       # Shopify integration guide
│   └── water-report-shopify-app.zip # Shopify package
├── utils/                 # Backend utility functions
│   ├── ewgDataFetcher.js  # EWG website scraper
│   └── sendEventToKlaviyo.js # Klaviyo email integration
├── server.js              # Express server with API endpoints
├── start-dev.sh           # Development startup script
└── package.json           # Dependencies and scripts
```

## Integrations

### WordPress Integration

The application includes a complete WordPress plugin that can be installed on any WordPress site.

**Features:**
- Simple `[water_report_form]` shortcode
- Admin settings page for API configuration
- Automatic script loading only on pages using the shortcode
- Support for both HTTP and HTTPS sites

**Installation:**
1. Download `water-report-wp-plugin.zip` from the `/public` directory
2. Upload via WordPress admin: Plugins → Add New → Upload Plugin
3. Configure API URL in Settings → Water Report
4. Use `[water_report_form]` shortcode on any page or post

### Shopify Integration

Custom theme files allow seamless integration with Shopify stores.

**Features:**
- Native Shopify section and block support
- Theme editor compatibility
- Metafield configuration for API URL
- Liquid template integration

**Installation:**
1. Download `water-report-shopify-app.zip`
2. Extract and copy files to your Shopify theme
3. Add the Water Report Form section through the theme editor

### Manual Embedding

For other platforms, use the embeddable JavaScript widget:

```html
<script>
    window.WATER_REPORT_API_URL = '//www.waterreportapp.com';
</script>
<script src="//www.waterreportapp.com/water-report-embed.js"></script>

<!-- Place this div where you want the form -->
<div data-water-report-embed></div>
```

## Data Source Integration

The application uses **live data scraping** from the Environmental Working Group (EWG) database:

**EWG Tap Water Database Integration:**
- Real-time scraping of water utility data by ZIP code
- Comprehensive contaminant information with health guidelines
- Detailed potential health effects for each contaminant
- Legal limits vs. health guideline comparisons
- No API required - direct web scraping implementation

## API Endpoints

The server provides the following API endpoints:

### POST `/api/request-report`
Main endpoint for water report requests.

**Request Body:**
```json
{
  "email": "user@example.com",
  "location": "90210"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Water report generated and email sent successfully",
  "data": [
    {
      "contaminantName": "Chloroform",
      "detectTimesGreaterThan": "5.2x",
      "thisUtilityText": "0.52 ppb",
      "healthGuidelineText": "0.1 ppb",
      "legalLimitText": "80 ppb",
      "potentialEffect": "Cancer risk"
    }
  ]
}
```

### GET `/api/test-klaviyo`
Test endpoint for Klaviyo integration.

**Query Parameters:**
- `zip` (optional): ZIP code to test (default: 90210)
- `email` (optional): Email to test (default: test@example.com)

## Email Integration (Klaviyo)

The application automatically sends water quality reports via email using Klaviyo:

**Features:**
- Structured event tracking for "Requested Water Report"
- Flattened data structure for easy template access
- Support for up to 10 contaminants per report
- Customer profile creation with email and ZIP code
- Detailed contaminant data for email templates

**Template Variables Available:**
- `zipcode`, `contaminant_count`
- `contaminant1_name` through `contaminant10_name`
- `contaminant1_times` through `contaminant10_times`
- And more for each contaminant (utility, guideline, legal, effect)

## HTTPS and SSL Support

The server supports both HTTP and HTTPS:

1. **HTTP**: Runs on port 3000 (default)
2. **HTTPS**: Runs on port 443 (if SSL certificates are present)

**SSL Setup:**
Create an `ssl/` directory in the project root with:
- `ssl/key.pem` - Private key
- `ssl/cert.pem` - SSL certificate

## Deployment

### Production Deployment

1. Set environment variables:
```bash
export NODE_ENV=production
export KLAVIYO_PUBLIC_API_KEY=your_api_key
export PORT=3000
export HTTPS_PORT=443
```

2. Install dependencies:
```bash
npm install --production
```

3. Start the server:
```bash
npm start
```

### Domain Configuration

The embeddable widgets use protocol-relative URLs (`//www.waterreportapp.com`) to support both HTTP and HTTPS embedding environments.

## Customization

- **Data Source**: Modify `utils/ewgDataFetcher.js` to change data scraping logic
- **Email Templates**: Update Klaviyo email templates using the provided template variables
- **Styling**: Customize embed widget styles in `public/water-report-embed.js`
- **Landing Page**: Edit `public/index.html` for the main interface

## Testing

### Testing Klaviyo Integration
Use the test endpoint to verify email functionality:
```bash
curl "http://localhost:3000/api/test-klaviyo?zip=90210&email=test@example.com"
```

### Testing Data Scraping
Test the EWG data fetching by making a POST request:
```bash
curl -X POST http://localhost:3000/api/request-report \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "location": "90210"}'
```

## Troubleshooting

**Common Issues:**

1. **No water data found**: Not all ZIP codes have data in the EWG database
2. **Klaviyo errors**: Ensure `KLAVIYO_PUBLIC_API_KEY` is set correctly
3. **CORS issues**: Make sure CORS is properly configured for your domain
4. **SSL certificate errors**: Verify SSL certificates are properly placed in `/ssl` directory

## Contributing

Contributions, issues, and feature requests are welcome!

## Preview

![Main Page](/assets/screenshot.png)

## Documentation

- `public/EMBED_INSTRUCTIONS.md` - Complete embedding guide
- `public/README-plugin.md` - WordPress plugin documentation  
- `public/water-report-shopify-app/README.md` - Shopify integration guide
- `public/embed-demo.html` - Live demo of embedding functionality