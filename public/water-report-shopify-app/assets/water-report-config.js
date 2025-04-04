/**
 * Water Report Shopify App - Configuration
 * This file configures the API URL for the Water Report embed script
 */

// Set the global API URL variable for the embed script to use
window.WATER_REPORT_API_URL = Shopify.shop.metafields
	? Shopify.shop.metafields.water_report.api_url
	: '//www.waterreportapp.com';
