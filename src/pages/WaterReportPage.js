import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { waterQualityData as fallbackData } from '../data/waterQualityData';
import axios from 'axios';
import '../styles/WaterReportPage.css';

const WaterReportPage = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const { email, zipCode, apiResponse } = location.state || {
		email: null,
		zipCode: null,
		apiResponse: null,
	};

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [waterData, setWaterData] = useState(null);

	// Get the API URL from environment variables or default to localhost:3000
	const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

	// If no email or zipCode was provided, redirect back to the form
	useEffect(() => {
		if (!email || !zipCode) {
			navigate('/');
		}
	}, [email, zipCode, navigate]);

	useEffect(() => {
		// If we already have data from the API via the navigation state, use that
		if (apiResponse) {
			console.log('Using data passed from form submission');
			setWaterData(apiResponse);
			return;
		}

		// Otherwise, fetch data from the API based on the zipcode
		const fetchWaterReport = async () => {
			try {
				setLoading(true);
				setError('');

				// For demo purposes, directly get the water data for this location
				const response = await axios.post(
					`${API_URL}/api/request-report`,
					{
						email,
						location: zipCode,
					}
				);

				setWaterData(response.data);
			} catch (err) {
				console.error('Error fetching water report:', err);
				setError(
					'Failed to load water report data. Using fallback data.'
				);
				// Use fallback data in case of error
				// Update the fallback data with the current email and zip code
				const updatedFallbackData = {
					...fallbackData,
					systemInfo: {
						...fallbackData.systemInfo,
						location: `${zipCode}, United States`,
					},
				};
				setWaterData(updatedFallbackData);
			} finally {
				setLoading(false);
			}
		};

		fetchWaterReport();
	}, [email, zipCode, apiResponse, API_URL]);

	// If still loading or missing data, show appropriate message
	if (!email || !zipCode) {
		return (
			<div className='loading-container'>
				<div className='error-banner'>
					Missing required information. Redirecting to form...
				</div>
			</div>
		);
	}

	// Use fallback data until API data is loaded
	const data = waterData || fallbackData;
	const { systemInfo, contaminants, recommendedFilters, sourceInfo } = data;

	const currentDate = new Date().toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});

	// Calculate risk level based on contaminants
	const getOverallRiskLevel = () => {
		const totalContaminants = contaminants.length;
		const exceededGuidelines = contaminants.filter((contaminant) => {
			// Handle both number and string formats
			const level = parseFloat(contaminant.level);
			const guideline = parseFloat(contaminant.healthGuideline);
			return !isNaN(level) && !isNaN(guideline) && level > guideline;
		}).length;

		const riskPercentage = (exceededGuidelines / totalContaminants) * 100;

		if (riskPercentage > 80) return { level: 'High', color: '#d32f2f' };
		if (riskPercentage > 50) return { level: 'Moderate', color: '#ff9800' };
		return { level: 'Low', color: '#4caf50' };
	};

	// Function to calculate how many times a contaminant exceeds the health guideline
	const calculateMultiplier = (contaminant) => {
		const levelStr = contaminant.level.toString();
		const guidelineStr = contaminant.healthGuideline.toString();

		// Extract numeric values
		const levelMatch = levelStr.match(/[\d.]+/);
		const guidelineMatch = guidelineStr.match(/[\d.]+/);

		if (!levelMatch || !guidelineMatch) {
			return null;
		}

		const levelValue = parseFloat(levelMatch[0]);
		const guidelineValue = parseFloat(guidelineMatch[0]);

		if (
			isNaN(levelValue) ||
			isNaN(guidelineValue) ||
			guidelineValue === 0
		) {
			return null;
		}

		return (levelValue / guidelineValue).toFixed(1);
	};

	// Function to extract unit from level string (e.g., "5.2 ppb" -> "ppb")
	const extractUnit = (valueStr) => {
		const match = valueStr.toString().match(/[a-zA-Z]+/);
		return match ? match[0] : '';
	};

	const riskLevel = getOverallRiskLevel();

	if (loading) {
		return (
			<div className='loading-container'>
				<div className='loading-spinner'></div>
				<p>Loading your water quality report...</p>
			</div>
		);
	}

	return (
		<div className='email-wrapper'>
			<div className='email-container'>
				<div className='email-header'>
					<img
						src='https://placehold.co/200x50/2196f3/white?text=PureWater+'
						alt='PureWater Plus Logo'
						className='email-logo'
					/>
					<div className='email-meta'>
						<div>
							<strong>From:</strong> info@purewaterplus.com
						</div>
						<div>
							<strong>To:</strong> {email}
						</div>
						<div>
							<strong>Subject:</strong> Your Free Water Quality
							Report - {zipCode}
						</div>
						<div>
							<strong>Date:</strong> {currentDate}
						</div>
					</div>
				</div>

				<div className='email-body'>
					{error && <div className='error-banner'>{error}</div>}

					<div className='email-greeting'>
						<h1>Your Water Quality Report</h1>
						<p>Dear Valued Customer,</p>
						<p>
							Thank you for requesting your free water quality
							report from PureWater Plus. Below you'll find
							detailed information about the tap water quality in
							your area (ZIP Code: {zipCode}).
						</p>
					</div>

					<div className='report-summary'>
						<h2>Water System Information</h2>
						<div className='summary-box'>
							<div className='summary-item'>
								<span>Water System:</span>
								<strong>{systemInfo.name}</strong>
							</div>
							<div className='summary-item'>
								<span>Overall Risk Level:</span>
								<strong style={{ color: riskLevel.color }}>
									{riskLevel.level}
								</strong>
							</div>
						</div>
					</div>

					{/* New Contaminant Cards Section */}
					<div className='contaminant-highlights'>
						<h2>ZIP CODE: {zipCode}</h2>
						<div className='contaminant-cards-grid'>
							{contaminants.map((contaminant, index) => {
								const multiplier =
									calculateMultiplier(contaminant);
								const unit = extractUnit(contaminant.level);

								return (
									<div
										key={index}
										className='contaminant-card'>
										<h3>{contaminant.name}</h3>
										<div className='your-water-contains'>
											YOUR WATER CONTAINS
										</div>
										<div className='multiplier'>
											{multiplier ? (
												<>{multiplier} times</>
											) : (
												<>Detected</>
											)}
										</div>
										<div className='guideline-info'>
											THE RECOMMENDED HEALTH GUIDELINES
										</div>
										<div className='utility-level'>
											This Utility | {contaminant.level}
										</div>
										<div className='health-guideline'>
											Health Guideline |{' '}
											{contaminant.healthGuideline}
										</div>
										<div className='legal-limit'>
											Legal Limit |{' '}
											{contaminant.legalLimit}
										</div>
									</div>
								);
							})}
						</div>
					</div>

					<div className='contaminants-section'>
						<h2>Detected Contaminants Details</h2>
						<p className='section-intro'>
							The following contaminants were detected in your
							water system. Contaminants with levels exceeding
							health guidelines are marked in orange or red.
						</p>

						<div className='contaminants-table'>
							<div className='table-header'>
								<div className='table-cell'>Contaminant</div>
								<div className='table-cell'>Detected Level</div>
								<div className='table-cell'>Legal Limit</div>
								<div className='table-cell'>
									Health Guideline
								</div>
								<div className='table-cell'>Health Risk</div>
							</div>

							{contaminants.map((contaminant, index) => {
								// Handle both number and string formats
								const detectedLevel = parseFloat(
									contaminant.level
								);
								const healthGuideline = parseFloat(
									contaminant.healthGuideline
								);
								const isAboveGuideline =
									!isNaN(detectedLevel) &&
									!isNaN(healthGuideline) &&
									detectedLevel > healthGuideline;

								return (
									<div
										key={index}
										className={`table-row ${
											isAboveGuideline ? 'warning' : ''
										}`}>
										<div className='table-cell contaminant-name'>
											{contaminant.name}
										</div>
										<div className='table-cell'>
											{contaminant.level}
										</div>
										<div className='table-cell'>
											{contaminant.legalLimit}
										</div>
										<div className='table-cell'>
											{contaminant.healthGuideline}
										</div>
										<div className='table-cell'>
											{contaminant.healthRisk}
										</div>
									</div>
								);
							})}
						</div>

						<p className='note'>
							<strong>Note:</strong> Health guidelines are often
							much lower than legal limits because they focus
							solely on health risks, while legal limits balance
							health protection with cost and technical
							feasibility.
						</p>
					</div>

					<div className='contaminant-details'>
						<h2>Contaminant Details</h2>
						{contaminants.map((contaminant, index) => (
							<div key={index} className='detail-card'>
								<h3>{contaminant.name}</h3>
								<p>{contaminant.description}</p>
								<div className='detail-meta'>
									<span>
										<strong>Source:</strong>{' '}
										{contaminant.sourceType}
									</span>
									<span>
										<strong>Health Concern:</strong>{' '}
										{contaminant.healthRisk}
									</span>
								</div>
							</div>
						))}
					</div>

					<div className='recommendations'>
						<h2>Recommended Water Filters</h2>
						<p>
							Based on the contaminants found in your area's
							water, we recommend the following types of water
							filtration:
						</p>

						<div className='filters-grid'>
							{recommendedFilters.map((filter, index) => (
								<div key={index} className='filter-card'>
									<h3>{filter.type}</h3>
									<p>{filter.description}</p>
									<div className='examples'>
										<strong>Popular brands:</strong>{' '}
										{filter.examples.join(', ')}
									</div>
								</div>
							))}
						</div>
					</div>

					<div className='special-offer'>
						<h2>Special Offer - Just For You!</h2>
						<div className='offer-content'>
							<p>
								<strong>Get 20% OFF</strong> any PureWater Plus
								water filtration system with promo code{' '}
								<span className='promo-code'>PUREWATER20</span>
							</p>
							<button className='btn btn-primary'>
								Shop Water Filtration Systems
							</button>
						</div>
					</div>

					<div className='email-footer'>
						<p>
							This report is based on data from{' '}
							{sourceInfo.source}. {sourceInfo.disclaimer}
						</p>
						<p>
							<small>
								&copy; 2023 PureWater Plus. All rights reserved.
								<br />
								123 Clean Water Street, PO Box 12345
								<br />
								<Link to='/'>Unsubscribe</Link> |{' '}
								<Link to='/'>Privacy Policy</Link>
							</small>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default WaterReportPage;
