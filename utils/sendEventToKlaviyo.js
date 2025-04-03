const fetch = require('node-fetch');

/**
 * Send water quality data to Klaviyo
 * @param {string} email - User's email address
 * @param {string} zip - User's ZIP code
 * @param {Array} waterData - Array of contaminant data from EWG
 * @returns {Promise} - Response from Klaviyo API
 */
async function sendEventToKlaviyo(email, zip, waterData) {
	const KLAVIYO_PUBLIC_API_KEY = process.env.KLAVIYO_PUBLIC_API_KEY;

	if (!KLAVIYO_PUBLIC_API_KEY) {
		throw new Error('Klaviyo API key is missing in environment variables');
	}

	// Clean and prepare the contaminant data
	const cleanedContaminants = waterData.map((contaminant) => ({
		contaminantName:
			contaminant.contaminantName?.trim() || 'Unknown Contaminant',
		detectTimesGreaterThan:
			contaminant.detectTimesGreaterThan?.trim() || '0',
		thisUtilityText: contaminant.thisUtilityText?.trim() || 'N/A',
		healthGuidelineText: contaminant.healthGuidelineText?.trim() || 'N/A',
		legalLimitText: contaminant.legalLimitText?.trim() || 'N/A',
		potentialEffect: contaminant.potentialEffect?.trim() || 'N/A',
	}));

	// Create a completely flattened data structure with top-level properties
	// This is critical for Klaviyo's template system which accesses properties directly
	const eventProperties = {
		zipcode: zip,
		company_name: 'Water Quality Reports',
		data_source: 'Environmental Working Group (EWG)',
		website_url: 'https://www.ewg.org/tapwater/',
		contaminant_count: cleanedContaminants.length,
	};

	// Add contaminant properties directly at the root level
	// Klaviyo templates will access these as {{ contaminant1_name }} instead of {{ event.properties.contaminant1_name }}
	for (let i = 0; i < Math.min(cleanedContaminants.length, 10); i++) {
		const idx = i + 1;
		const contaminant = cleanedContaminants[i];

		eventProperties[`contaminant${idx}_name`] = contaminant.contaminantName;
		eventProperties[`contaminant${idx}_times`] =
			contaminant.detectTimesGreaterThan;
		eventProperties[`contaminant${idx}_utility`] =
			contaminant.thisUtilityText;
		eventProperties[`contaminant${idx}_guideline`] =
			contaminant.healthGuidelineText;
		eventProperties[`contaminant${idx}_legal`] = contaminant.legalLimitText;
		eventProperties[`contaminant${idx}_effect`] =
			contaminant.potentialEffect;
	}

	const eventData = {
		token: KLAVIYO_PUBLIC_API_KEY,
		event: 'Requested Water Report',
		customer_properties: {
			$email: email,
			$zip: zip,
		},
		properties: eventProperties,
	};

	console.log('Sending data to Klaviyo:', JSON.stringify(eventData, null, 2));

	try {
		const response = await fetch('https://a.klaviyo.com/api/track', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(eventData),
		});

		if (!response.ok) {
			const text = await response.text();
			throw new Error(
				`Klaviyo API error (${response.status}): ${response.statusText} - ${text}`
			);
		}

		const responseData = await response.json();
		console.log('Klaviyo API response:', responseData);
		return responseData;
	} catch (error) {
		console.error('Error sending data to Klaviyo:', error);
		throw error;
	}
}

module.exports = sendEventToKlaviyo;
