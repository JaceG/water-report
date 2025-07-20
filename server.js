import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fetchEWG from './utils/ewgDataFetcher.js';
import sendEventToKlaviyo from './utils/sendEventToKlaviyo.js';
import https from 'https';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const HTTP_PORT = process.env.PORT || 3000;
const HTTPS_PORT = process.env.HTTPS_PORT || 443;

app.use(express.json());

// Enhanced CORS configuration for embedding in WordPress
app.use(
	cors({
		// In production, you'd want to restrict this to specific domains
		// For development, allow all origins
		origin:
			process.env.NODE_ENV === 'production'
				? (origin, callback) => {
						// You can whitelist specific domains here
						// For example: if (origin === 'https://example.com') { callback(null, true); }
						// For now, allowing all origins for WordPress embedding
						callback(null, true);
				  }
				: '*',
		methods: ['GET', 'POST'],
		allowedHeaders: ['Content-Type', 'Authorization'],
		credentials: true,
		// Adding cache headers to improve performance for embedded scripts
		exposedHeaders: ['Content-Length', 'X-Content-Type-Options'],
	})
);

// Set cache headers for the embed script
app.get('/water-report-embed.js', (req, res, next) => {
	// Cache for 1 day (in seconds)
	res.setHeader('Cache-Control', 'public, max-age=86400');
	next();
});

// Debug middleware to log all requests
app.use((req, res, next) => {
	console.log(`${req.method} ${req.path}`, req.body);
	next();
});

// API endpoint for requesting water reports
app.post('/api/request-report', async (req, res) => {
	console.log('Request body:', req.body);
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

// Serve static files from the public folder
if (process.env.NODE_ENV === 'production') {
	app.use(express.static(path.join(__dirname, 'public')));

	// For any request that doesn't match the API routes above, serve the HTML page
	app.get('*', (req, res) => {
		res.sendFile(path.join(__dirname, 'public', 'index.html'));
	});
} else {
	// In development, always serve static files
	app.use(express.static(path.join(__dirname, 'public')));
}

// Start HTTP server
app.listen(HTTP_PORT, () => {
	console.log(`HTTP Server running on port ${HTTP_PORT}`);
});

// Try to start HTTPS server if SSL certificates exist
try {
	// Check if SSL certificates exist
	const sslOptions = {
		key: fs.readFileSync(path.join(__dirname, 'ssl', 'key.pem')),
		cert: fs.readFileSync(path.join(__dirname, 'ssl', 'cert.pem')),
	};

	// Create HTTPS server
	const httpsServer = https.createServer(sslOptions, app);

	httpsServer.listen(HTTPS_PORT, () => {
		console.log(`HTTPS Server running on port ${HTTPS_PORT}`);
	});
} catch (err) {
	console.log(
		'SSL certificates not found or invalid, HTTPS server not started'
	);
	console.log('Error:', err.message);
	console.log(
		'To enable HTTPS, generate SSL certificates in the "ssl" directory'
	);
}
