#!/bin/bash

# Create Shopify app zip file
cd "$(dirname "$0")"
echo "Creating water-report-shopify-app.zip..."
zip -r ../water-report-shopify-app.zip . -x "*.DS_Store" -x "*.git*" -x "create-zip.sh"
echo "Done! Zip file created at ../water-report-shopify-app.zip" 