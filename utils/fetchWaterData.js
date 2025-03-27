const fetch = require('node-fetch');

async function fetchWaterData(location) {
	// In a real app, we would need to:
	// 1. Translate the zip code to a water system ID
	// 2. Call the appropriate API endpoint

	try {
		// For this demo, we'll construct a simplified version of data
		// similar to what EWG would provide
		// In a real implementation, you would query the actual EWG API or another water quality API

		// Simulate API call delay
		await new Promise((resolve) => setTimeout(resolve, 500));

		// Create a location string based on the zip code
		// In a real app, you would look up the city and state
		const zipCode = location.slice(0, 5);

		// Determine state based on first digit of zip code (simplified mapping)
		let state = 'Unknown State';
		const firstDigit = parseInt(zipCode.charAt(0));

		switch (firstDigit) {
			case 0:
				state =
					'Connecticut, Massachusetts, Maine, New Hampshire, New Jersey, Puerto Rico, Rhode Island, Vermont, Virgin Islands';
				break;
			case 1:
				state = 'Delaware, New York, Pennsylvania';
				break;
			case 2:
				state =
					'District of Columbia, Maryland, North Carolina, South Carolina, Virginia, West Virginia';
				break;
			case 3:
				state = 'Alabama, Florida, Georgia, Mississippi, Tennessee';
				break;
			case 4:
				state = 'Indiana, Kentucky, Michigan, Ohio';
				break;
			case 5:
				state =
					'Iowa, Minnesota, Montana, North Dakota, South Dakota, Wisconsin';
				break;
			case 6:
				state = 'Illinois, Kansas, Missouri, Nebraska';
				break;
			case 7:
				state = 'Arkansas, Louisiana, Oklahoma, Texas';
				break;
			case 8:
				state =
					'Arizona, Colorado, Idaho, New Mexico, Nevada, Utah, Wyoming';
				break;
			case 9:
				state =
					'Alaska, American Samoa, California, Guam, Hawaii, Oregon, Washington';
				break;
			default:
				state = 'Unknown State';
		}

		// Extract just the first state if multiple are listed
		if (state.includes(',')) {
			state = state.split(',')[0].trim();
		}

		// Imagine this is the result of looking up the water system by zip code
		const waterSystemInfo = {
			name: `Water District for ${zipCode}`,
			id: `WD${zipCode}`, // Create a fake water system ID
			location: `${zipCode}, ${state}`,
			population: Math.floor(
				100000 + Math.random() * 900000
			).toLocaleString(),
			violationPoints: Math.floor(5 + Math.random() * 15),
			nationalAvgViolationPoints: 8,
		};

		// Generate a seed from the ZIP code for consistent random values
		const zipSum = location
			.split('')
			.reduce((sum, char) => sum + char.charCodeAt(0), 0);
		const seed = (zipSum % 1000) / 1000; // Normalized between 0 and 1

		// Common contaminants with values and health guidelines - more realistic
		const contaminantBase = [
			{
				name: 'Arsenic',
				// Generate a level that's a multiple of the health guideline for dramatic effect
				level:
					(0.00004 * (100 + Math.floor(seed * 800))).toFixed(5) +
					' ppb',
				legalLimit: '10 ppb',
				healthGuideline: '0.00004 ppb',
				description:
					'Arsenic is a potent carcinogen naturally present in groundwater. The EPA set a goal of 0 ppb, but the current legal limit is 10 ppb, which is based on cost-convenience balance rather than health protection.',
				sourceType: 'Natural Deposits',
				healthRisk: 'Cancer',
			},
			{
				name: 'Haloacetic acids (HAA5)',
				level:
					(0.1 * (50 + Math.floor(seed * 300))).toFixed(1) + ' ppb',
				legalLimit: '60 ppb',
				healthGuideline: '0.1 ppb',
				description:
					'Haloacetic acids (HAA5) are disinfection byproducts that form when chlorine is added to water. The legal limit is 60 ppb, but studies link these byproducts to cancer and reproductive harm.',
				sourceType: 'Treatment Byproduct',
				healthRisk: 'Cancer',
			},
			{
				name: 'Haloacetic acids (HAA9)',
				level:
					(0.06 * (100 + Math.floor(seed * 500))).toFixed(1) + ' ppb',
				legalLimit: 'No legal limit',
				healthGuideline: '0.06 ppb',
				description:
					'Haloacetic acids (HAA9) are an expanded group of disinfection byproducts that includes additional compounds not covered by the regulated HAA5 group.',
				sourceType: 'Treatment Byproduct',
				healthRisk: 'Cancer',
			},
			{
				name: 'Total trihalomethanes (TTHMs)',
				level:
					(0.15 * (60 + Math.floor(seed * 250))).toFixed(1) + ' ppb',
				legalLimit: '80 ppb',
				healthGuideline: '0.15 ppb',
				description:
					'Total trihalomethanes (TTHMs) are disinfection byproducts that form when chlorine is added to water. The legal limit is 80 ppb, but studies link these byproducts to cancer and reproductive harm.',
				sourceType: 'Treatment Byproduct',
				healthRisk: 'Cancer',
			},
			{
				name: 'Chloroform',
				level:
					(0.4 * (40 + Math.floor(seed * 100))).toFixed(1) + ' ppb',
				legalLimit: 'No legal limit',
				healthGuideline: '0.4 ppb',
				description:
					'Chloroform is a disinfection byproduct that can cause central nervous system depression and is a probable human carcinogen.',
				sourceType: 'Treatment Byproduct',
				healthRisk: 'Cancer',
			},
			{
				name: 'Trichloroacetic acid',
				level:
					(0.5 * (40 + Math.floor(seed * 140))).toFixed(1) + ' ppb',
				legalLimit: 'No legal limit',
				healthGuideline: '0.5 ppb',
				description:
					'Trichloroacetic acid is a disinfection byproduct and a component of HAA5. It has been linked to liver problems and cancer in laboratory animals.',
				sourceType: 'Treatment Byproduct',
				healthRisk: 'Cancer',
			},
		];

		// Add region-specific contaminant based on zip code first digit
		if (firstDigit <= 3) {
			// East Coast - more likely to have industrial contamination
			contaminantBase.push({
				name: 'Chromium (hexavalent)',
				level:
					(0.02 * (40 + Math.floor(seed * 150))).toFixed(4) + ' ppb',
				legalLimit: 'No federal legal limit',
				healthGuideline: '0.02 ppb',
				description:
					'Chromium (hexavalent) is a carcinogen that commonly contaminates drinking water from industrial sources. California has set a public health goal of 0.02 ppb.',
				sourceType: 'Industrial',
				healthRisk: 'Cancer',
			});
		} else if (firstDigit >= 4 && firstDigit <= 6) {
			// Midwest - more likely to have agricultural contamination
			contaminantBase.push({
				name: 'Nitrate',
				level:
					(0.14 * (10 + Math.floor(seed * 50))).toFixed(2) + ' ppm',
				legalLimit: '10 ppm',
				healthGuideline: '0.14 ppm',
				description:
					'Nitrate is a primary drinking water contaminant. Common sources include fertilizer runoff, septic tanks, sewage, and erosion of natural deposits.',
				sourceType: 'Agriculture',
				healthRisk: 'Developmental Issues',
			});
		} else {
			// West/South - more likely to have naturally occurring issues
			contaminantBase.push({
				name: 'Radium',
				level:
					(0.05 * (10 + Math.floor(seed * 70))).toFixed(2) + ' pCi/L',
				legalLimit: '5 pCi/L',
				healthGuideline: '0.05 pCi/L',
				description:
					'Radium is a radioactive element that can occur naturally in groundwater. Long-term exposure increases the risk of cancer.',
				sourceType: 'Natural Deposits',
				healthRisk: 'Cancer',
			});
		}

		return {
			systemInfo: waterSystemInfo,
			contaminants: contaminantBase,
			recommendedFilters: [
				{
					type: 'Carbon-based filter',
					description:
						'Effective at removing chlorine, chlorination byproducts, and many chemicals',
					examples: ['Brita', 'PUR', 'ZeroWater'],
				},
				{
					type: 'Reverse Osmosis System',
					description:
						'Highly effective at removing most contaminants including arsenic, nitrates, and hexavalent chromium',
					examples: ['Home Master', 'APEC', 'iSpring'],
				},
				{
					type: 'UV Water Purification',
					description: 'Kills bacteria and viruses without chemicals',
					examples: ['Sterilight', 'HQUA', 'Bluonics'],
				},
			],
			sourceInfo: {
				source: 'Simulated Water Quality Database',
				disclaimer:
					"This data is for demonstration purposes only, simulating what might be retrieved from water quality databases. For actual water quality information, please refer to your local water utility's Consumer Confidence Report.",
			},
			fetchedAt: new Date().toISOString(),
		};
	} catch (error) {
		console.error('Error fetching water data:', error);
		throw new Error(
			`Failed to fetch water data for location ${location}: ${error.message}`
		);
	}
}

module.exports = fetchWaterData;
