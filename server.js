import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fetchEWG from './utils/ewgDataFetcher.js';
import sendEventToKlaviyo from './utils/sendEventToKlaviyo.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// API endpoint for requesting water reports
app.post('/api/request-report', async (req, res) => {
	const { email, location } = req.body;

	if (!email || !location) {
		return res.status(400).json({
			error: 'Both email and location are required',
		});
	}

	try {
		console.log(
			`Processing request for email: ${email}, location: ${location}`
		);

		// Fetch water data based on location
		console.log(`Fetching water data from EWG for location: ${location}`);
		const waterData = await fetchEWG(location);

		if (!waterData || waterData.length === 0) {
			console.warn(`No water data found for location: ${location}`);
			return res.status(404).json({
				error: 'No water data found for the provided location',
				message: 'Please check the ZIP code and try again.',
			});
		}

		console.log(
			`Found ${waterData.length} contaminants for location: ${location}`
		);

		try {
			// Try to send to Klaviyo
			console.log(`Sending data to Klaviyo for email: ${email}`);
			const klaviyoResponse = await sendEventToKlaviyo(
				email,
				location,
				waterData
			);
			console.log(`Successfully sent to Klaviyo:`, klaviyoResponse);
		} catch (klaviyoError) {
			console.error('Failed to send to Klaviyo:', klaviyoError.message);
			// Continue with the response even if Klaviyo fails

			// Return a warning in the response that the email might not be sent
			return res.status(207).json({
				waterData: waterData,
				warning:
					'Your water report was generated but there was an issue sending the email. Please check your inbox later or try again.',
			});
		}

		// Return the water data directly in the response
		// so the frontend can display it immediately
		res.status(200).json({
			success: true,
			message: 'Water report generated and email sent successfully',
			data: waterData,
		});
	} catch (error) {
		console.error('Error processing water report request:', error);
		res.status(500).json({
			error: 'Internal Server Error',
			message: error.message,
		});
	}
});

// Test endpoint for Klaviyo integration
app.get('/api/test-klaviyo', async (req, res) => {
	const testZip = req.query.zip || '90210'; // Default to Beverly Hills, CA
	const testEmail = req.query.email || 'test@example.com'; // Default test email

	console.log(
		`Running Klaviyo test with ZIP: ${testZip}, Email: ${testEmail}`
	);

	try {
		// Fetch water data
		const waterData = await fetchEWG(testZip);

		if (!waterData || waterData.length === 0) {
			return res.status(404).json({
				error: 'No water data found for this ZIP code',
				zip: testZip,
			});
		}

		// Send to Klaviyo
		const klaviyoResponse = await sendEventToKlaviyo(
			testEmail,
			testZip,
			waterData
		);

		// Return success response
		res.json({
			success: true,
			message: 'Test completed successfully',
			waterDataSampleCount: waterData.length,
			waterDataSample: waterData.slice(0, 2), // Just include a sample of the data
			klaviyoResponse,
		});
	} catch (error) {
		console.error('Test failed:', error);
		res.status(500).json({
			error: 'Test failed',
			message: error.message,
			stack: process.env.NODE_ENV === 'production' ? null : error.stack,
		});
	}
});

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
	app.use(express.static(path.join(__dirname, 'public')));

	// For any request that doesn't match the API routes above, serve the React app
	app.get('*', (req, res) => {
		res.sendFile(path.join(__dirname, 'public', 'index.html'));
	});
}

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
