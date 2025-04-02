const fetch = require('node-fetch');

async function sendEventToKlaviyo(email, zip, waterData) {
	const KLAVIYO_PUBLIC_API_KEY = process.env.KLAVIYO_PUBLIC_API_KEY;

	const response = await fetch('https://a.klaviyo.com/api/track', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			token: KLAVIYO_PUBLIC_API_KEY,
			event: 'Requested Water Report',
			customer_properties: {
				$email: email,
				$zip: zip,
			},
			properties: waterData,
		}),
	});

	if (!response.ok) {
		throw new Error(`Klaviyo API error: ${response.statusText}`);
	}

	return response.json();
}

module.exports = sendEventToKlaviyo;
