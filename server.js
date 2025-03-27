require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fetchWaterData = require('./utils/fetchWaterData');
const sendEventToKlaviyo = require('./utils/sendEventToKlaviyo');

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
		// Fetch water data based on location
		const waterData = await fetchWaterData(location);

		// In a production app, you would:
		// 1. Store the request in a database
		// 2. Send an actual email
		// 3. Track the event in a marketing automation tool

		try {
			// Try to send to Klaviyo, but don't let this block the response
			// if there's an error
			await sendEventToKlaviyo(email, waterData);
		} catch (klaviyoError) {
			console.warn('Failed to send to Klaviyo:', klaviyoError.message);
			// Continue with the response even if Klaviyo fails
		}

		// Return the water data directly in the response
		// so the frontend can display it immediately
		res.status(200).json(waterData);
	} catch (error) {
		console.error('Error fetching water data:', error);
		res.status(500).json({
			error: 'Internal Server Error',
			message: error.message,
		});
	}
});

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
	app.use(express.static(path.join(__dirname, 'build')));

	// For any request that doesn't match the API routes above, serve the React app
	app.get('*', (req, res) => {
		res.sendFile(path.join(__dirname, 'build', 'index.html'));
	});
}

app.listen(PORT, '::', () => {
	console.log(`Server running on port ${PORT}`);
});
