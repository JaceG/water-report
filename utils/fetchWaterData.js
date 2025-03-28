const fetch = require('node-fetch');

/**
 * Fetches water quality data from EPA for a given ZIP code
 * Focuses specifically on tap water contaminants
 * @param {string} location - ZIP code of the location to fetch data for
 * @returns {Promise<Object>} - Water quality data for the location
 */
async function fetchWaterData(location) {
	try {
		// Extract the zip code from the location
		const zipCode = location;
		console.log(`Fetching tap water data for ZIP code ${zipCode}...`);

		// Step 1: Find water systems serving this ZIP code using EPA's SDWIS data
		// The EPA Envirofacts Data Service API allows querying SDWIS by ZIP code
		const sdwisSystemsUrl = `https://data.epa.gov/efservice/SDWIS/WATER_SYSTEM/ZIP/BEGINNING/${zipCode}/rows/0:100/JSON`;

		console.log(`Fetching water systems from ${sdwisSystemsUrl}...`);
		const systemsResponse = await fetch(sdwisSystemsUrl);

		if (!systemsResponse.ok) {
			throw new Error(`EPA SDWIS API returned ${systemsResponse.status}`);
		}

		const allWaterSystems = await systemsResponse.json();

		// Filter to only include systems with the exact ZIP code
		const waterSystems = allWaterSystems.filter((system) => {
			return system.zip_code === zipCode;
		});

		if (!waterSystems || waterSystems.length === 0) {
			console.warn(`No water systems found for ZIP code ${zipCode}`);

			// Try a different approach - get systems by state if we know it
			let stateCode = getStateFromZip(zipCode);
			if (stateCode) {
				console.log(
					`Trying to find water systems in state ${stateCode}...`
				);
				const stateSystemsUrl = `https://data.epa.gov/efservice/SDWIS/WATER_SYSTEM/STATE_CODE/${stateCode}/rows/0:20/JSON`;
				const stateResponse = await fetch(stateSystemsUrl);

				if (stateResponse.ok) {
					const stateSystems = await stateResponse.json();
					if (stateSystems && stateSystems.length > 0) {
						console.log(
							`Found ${stateSystems.length} systems in state ${stateCode}`
						);

						// Return indicating no data is available for this specific ZIP code
						return {
							systemInfo: {
								name: `No water system data available for ${zipCode}`,
								id: `Unknown`,
								location: `${zipCode}`,
								population: 'Unknown',
							},
							contaminants: [],
							sourceInfo: {
								source: 'EPA Safe Drinking Water Information System',
								disclaimer:
									'No water system data is available for this specific ZIP code from EPA SDWIS.',
							},
							fetchedAt: new Date().toISOString(),
							dataAvailable: false,
							additionalInfo: {
								note: `No water quality data is available for ZIP code ${zipCode}.`,
							},
						};
					}
				}
			}

			return {
				systemInfo: {
					name: `No water system data available for ${zipCode}`,
					id: `Unknown`,
					location: `${zipCode}`,
					population: 'Unknown',
				},
				contaminants: [],
				sourceInfo: {
					source: 'EPA Safe Drinking Water Information System',
					disclaimer:
						'No water system data is available for this location from EPA SDWIS.',
				},
				fetchedAt: new Date().toISOString(),
				dataAvailable: false,
			};
		}

		console.log(
			`Found ${waterSystems.length} water systems for ZIP ${zipCode}`
		);

		// Find the largest water system (serving the most people)
		let primaryWaterSystem = waterSystems[0];
		if (waterSystems.length > 1) {
			// Sort by population served (descending)
			waterSystems.sort((a, b) => {
				const popA = parseInt(a.population_served_count || 0);
				const popB = parseInt(b.population_served_count || 0);
				return popB - popA;
			});
			primaryWaterSystem = waterSystems[0];
		}

		// Step 2: Get water system violations data
		// Field names in the API response are lowercase
		const pwsid = primaryWaterSystem.pwsid;
		if (!pwsid) {
			console.warn('No PWSID found in water system data');
			return formatResponse(primaryWaterSystem, zipCode, [], []);
		}

		const violationsUrl = `https://data.epa.gov/efservice/SDWIS/VIOLATION/PWSID/${pwsid}/JSON`;

		console.log(`Fetching violation data for water system ${pwsid}...`);
		const violationsResponse = await fetch(violationsUrl);
		let violations = [];

		if (violationsResponse.ok) {
			violations = await violationsResponse.json();
			console.log(
				`Found ${violations.length} violations for water system ${pwsid}`
			);
		}

		// Step 3: Get the water system facility data to find treatment plants
		const facilitiesUrl = `https://data.epa.gov/efservice/SDWIS/WATER_SYSTEM_FACILITY/PWSID/${pwsid}/JSON`;
		const facilitiesResponse = await fetch(facilitiesUrl);
		let facilities = [];

		if (facilitiesResponse.ok) {
			facilities = await facilitiesResponse.json();
		}

		// Step 4: Get water contaminant testing results from WQP
		// If we can't get contaminant levels from SDWIS directly
		const contaminantResults = await getContaminantsForLocation(zipCode);

		// Step 5: Process water quality data into a format matching the email example
		let processedContaminants = [];

		if (
			Array.isArray(contaminantResults) &&
			contaminantResults.length > 0
		) {
			// Only process actual contaminant results from the APIs
			processedContaminants = processContaminantData(
				violations,
				contaminantResults
			);
			console.log(
				`Processed ${processedContaminants.length} actual contaminant measurements`
			);
		} else {
			console.log(
				'No actual contaminant data available - returning empty list'
			);
			processedContaminants = []; // Empty array - NO generic data
		}

		// Step 6: Try to get UV Index data if available
		try {
			const uvUrl = `https://data.epa.gov/efservice/getEnvirofactsUVDAILY/ZIP/${zipCode}/json`;
			const uvResponse = await fetch(uvUrl);
			let uvData = null;

			if (uvResponse.ok) {
				const uvJson = await uvResponse.json();
				if (uvJson && uvJson.length > 0) {
					uvData = uvJson[0]; // Get the first UV record
				}
			}

			// Add UV data to the response if available
			return formatResponse(
				primaryWaterSystem,
				zipCode,
				processedContaminants,
				facilities,
				uvData
			);
		} catch (uvError) {
			console.warn('Error fetching UV data:', uvError);
			// Continue without UV data
			return formatResponse(
				primaryWaterSystem,
				zipCode,
				processedContaminants,
				facilities
			);
		}
	} catch (error) {
		console.error('Error fetching water data:', error);
		throw new Error(
			`Failed to fetch water data for location ${location}: ${error.message}`
		);
	}
}

/**
 * Format the final response object
 */
function formatResponse(
	waterSystem,
	zipCode,
	contaminants,
	facilities,
	uvData = null
) {
	const response = {
		systemInfo: {
			name: waterSystem.pws_name || `Water System for ${zipCode}`,
			id: waterSystem.pwsid || 'Unknown',
			location: `${zipCode}`,
			population: waterSystem.population_served_count || 'Unknown',
			waterSource: waterSystem.primary_source_code || 'Unknown',
			systemType: waterSystem.pws_type_code || 'Unknown',
		},
		contaminants: contaminants,
		facilities: facilities,
		sourceInfo: {
			source: 'EPA Safe Drinking Water Information System',
			disclaimer:
				'This data is sourced directly from EPA drinking water databases.',
			apis: ['EPA Envirofacts Data Service API', 'Water Quality Portal'],
		},
		fetchedAt: new Date().toISOString(),
		dataAvailable: contaminants.length > 0,
	};

	// Add UV data if available
	if (uvData) {
		response.uvIndex = {
			date: uvData.DATE_TIME || new Date().toISOString().split('T')[0],
			uvIndex: uvData.UV_INDEX || 'Unknown',
			uvAlert: uvData.UV_ALERT || 'Unknown',
			city: uvData.CITY || 'Unknown',
			state: uvData.STATE_CODE || 'Unknown',
		};
	}

	return response;
}

/**
 * Get state code from ZIP code
 */
function getStateFromZip(zip) {
	const zipPrefixes = {
		'00': 'PR', // Puerto Rico
		'01': 'MA', // Massachusetts
		'02': 'MA', // Massachusetts
		'03': 'NH', // New Hampshire
		'04': 'ME', // Maine
		'05': 'VT', // Vermont
		'06': 'CT', // Connecticut
		'07': 'NJ', // New Jersey
		'08': 'NJ', // New Jersey
		'09': 'PR', // Puerto Rico
		10: 'NY', // New York
		11: 'NY', // New York
		12: 'NY', // New York
		13: 'NY', // New York
		14: 'NY', // New York
		15: 'PA', // Pennsylvania
		16: 'PA', // Pennsylvania
		17: 'PA', // Pennsylvania
		18: 'PA', // Pennsylvania
		19: 'PA', // Pennsylvania
		20: 'DC', // District of Columbia
		21: 'MD', // Maryland
		22: 'VA', // Virginia
		23: 'VA', // Virginia
		24: 'WV', // West Virginia
		25: 'MA', // Massachusetts
		26: 'MI', // Michigan
		27: 'NC', // North Carolina
		28: 'NC', // North Carolina
		29: 'SC', // South Carolina
		30: 'GA', // Georgia
		31: 'GA', // Georgia
		32: 'FL', // Florida
		33: 'FL', // Florida
		34: 'FL', // Florida
		35: 'AL', // Alabama
		36: 'AL', // Alabama
		37: 'TN', // Tennessee
		38: 'TN', // Tennessee
		39: 'MS', // Mississippi
		40: 'KY', // Kentucky
		41: 'KY', // Kentucky
		42: 'KY', // Kentucky
		43: 'OH', // Ohio
		44: 'OH', // Ohio
		45: 'OH', // Ohio
		46: 'IN', // Indiana
		47: 'IN', // Indiana
		48: 'MI', // Michigan
		49: 'MI', // Michigan
		50: 'IA', // Iowa
		51: 'IA', // Iowa
		52: 'IA', // Iowa
		53: 'WI', // Wisconsin
		54: 'WI', // Wisconsin
		55: 'MN', // Minnesota
		56: 'MN', // Minnesota
		57: 'SD', // South Dakota
		58: 'ND', // North Dakota
		59: 'MT', // Montana
		60: 'IL', // Illinois
		61: 'IL', // Illinois
		62: 'IL', // Illinois
		63: 'MO', // Missouri
		64: 'MO', // Missouri
		65: 'MO', // Missouri
		66: 'KS', // Kansas
		67: 'KS', // Kansas
		68: 'NE', // Nebraska
		69: 'NE', // Nebraska
		70: 'LA', // Louisiana
		71: 'LA', // Louisiana
		72: 'AR', // Arkansas
		73: 'OK', // Oklahoma
		74: 'OK', // Oklahoma
		75: 'TX', // Texas
		76: 'TX', // Texas
		77: 'TX', // Texas
		78: 'TX', // Texas
		79: 'TX', // Texas
		80: 'CO', // Colorado
		81: 'CO', // Colorado
		82: 'WY', // Wyoming
		83: 'ID', // Idaho
		84: 'UT', // Utah
		85: 'NM', // New Mexico
		86: 'AZ', // Arizona
		87: 'NM', // New Mexico
		88: 'NM', // New Mexico
		89: 'NV', // Nevada
		90: 'CA', // California
		91: 'CA', // California
		92: 'CA', // California
		93: 'CA', // California
		94: 'CA', // California
		95: 'CA', // California
		96: 'CA', // California
		97: 'OR', // Oregon
		98: 'WA', // Washington
		99: 'WA', // Washington
	};

	if (zip && zip.length >= 2) {
		const prefix = zip.substring(0, 2);
		return zipPrefixes[prefix];
	}

	return null;
}

/**
 * Get contaminant data for a location
 */
async function getContaminantsForLocation(zipCode) {
	try {
		// The WQP API requires proper state/county codes and has different parameter format
		const stateCode = getStateFromZip(zipCode);
		if (!stateCode) {
			console.warn('Unable to determine state for ZIP code:', zipCode);
			return [];
		}

		// Use proper API format based on WQP documentation
		const wqpUrl = `https://www.waterqualitydata.us/data/Result/search?mimeType=csv&zip=no&statecode=US:${stateCode}&sampleMedia=Water&dataProfile=resultPhysChem`;

		console.log(
			`Fetching water quality portal data for state ${stateCode}...`
		);
		const wqpResponse = await fetch(wqpUrl);
		let contaminantResults = [];

		if (wqpResponse.ok) {
			// Parse CSV data
			const wqpText = await wqpResponse.text();
			contaminantResults = parseWQPCSV(wqpText);
			console.log(
				`Found ${contaminantResults.length} actual contaminant measurements from WQP`
			);

			if (contaminantResults.length > 0) {
				return contaminantResults;
			}
		} else {
			console.warn(
				`WQP API returned status ${wqpResponse.status}: ${wqpResponse.statusText}`
			);
			// Try to get any warning headers
			const warningHeader = wqpResponse.headers.get('warning');
			if (warningHeader) {
				console.warn(`WQP Warning: ${warningHeader}`);
			}
		}

		// If no actual data from WQP, return empty array
		console.log('No actual contaminant data available from WQP API');
		return [];
	} catch (error) {
		console.error('Error fetching contaminant data:', error);
		return [];
	}
}

/**
 * Parse CSV data from the Water Quality Portal
 * @param {string} csvText - CSV text from the Water Quality Portal
 * @returns {Array} - Parsed contaminant data
 */
function parseWQPCSV(csvText) {
	// Simple CSV parser
	const lines = csvText.split('\n');
	if (lines.length < 2) return [];

	const headers = lines[0].split(',');
	const results = [];

	for (let i = 1; i < lines.length; i++) {
		// Skip empty lines
		if (!lines[i].trim()) continue;

		const values = lines[i].split(',');
		const result = {};

		for (let j = 0; j < headers.length; j++) {
			result[headers[j]] = values[j];
		}

		results.push(result);
	}

	return results;
}

/**
 * Process violation and contaminant data into a format matching the email example
 * @param {Array} violations - Violation data from SDWIS
 * @param {Array} contaminantResults - Contaminant measurements from Water Quality Portal
 * @returns {Array} - Processed contaminant data in email format
 */
function processContaminantData(violations, contaminantResults) {
	// Health guidelines for common contaminants (in ppb)
	const healthGuidelines = {
		ARSENIC: { value: 0.004, unit: 'ppb', legalLimit: '10 ppb' },
		NITRATE: { value: 0.14, unit: 'ppm', legalLimit: '10 ppm' },
		'HALOACETIC ACIDS': { value: 0.1, unit: 'ppb', legalLimit: '60 ppb' },
		'TOTAL TRIHALOMETHANES': {
			value: 0.15,
			unit: 'ppb',
			legalLimit: '80 ppb',
		},
		RADIUM: { value: 0.05, unit: 'pCi/L', legalLimit: '5 pCi/L' },
		'CHROMIUM (HEXAVALENT)': {
			value: 0.02,
			unit: 'ppb',
			legalLimit: '100 ppb (total chromium)',
		},
		DIBROMOCHLOROPROPANE: {
			value: 0.05,
			unit: 'ppb',
			legalLimit: '0.2 ppb',
		},
		LEAD: { value: 0.2, unit: 'ppb', legalLimit: '15 ppb (action level)' },
		COPPER: {
			value: 300,
			unit: 'ppb',
			legalLimit: '1300 ppb (action level)',
		},
		URANIUM: { value: 0.43, unit: 'ppb', legalLimit: '30 ppb' },
	};

	// Contaminant code to name mapping for violations
	const contaminantCodes = {
		1040: 'NITRATE',
		2950: 'TOTAL TRIHALOMETHANES',
		2456: 'HALOACETIC ACIDS',
		1005: 'ARSENIC',
		4000: 'LEAD',
		4010: 'COPPER',
		4100: 'RADIUM 226/228',
	};

	// Group and process contaminant results
	const contaminantGroups = {};

	// First, process any violation data we have - use lowercase field names
	if (violations && violations.length > 0) {
		violations.forEach((violation) => {
			// Get contaminant name from code - handle both string and number formats
			let contaminantCode =
				violation.contaminant_code || violation.CONTAMINANT_CODE;
			if (!contaminantCode) return;

			// Convert to string if it's a number
			contaminantCode = String(contaminantCode);

			const contaminantName =
				contaminantCodes[contaminantCode] ||
				`Contaminant ${contaminantCode}`;

			if (!contaminantGroups[contaminantName]) {
				contaminantGroups[contaminantName] = {
					name: contaminantName,
					hasViolation: true,
					readings: [],
				};
			}

			contaminantGroups[contaminantName].hasViolation = true;
		});
	}

	// Then process any contaminant measurements we have
	if (contaminantResults && contaminantResults.length > 0) {
		contaminantResults.forEach((result) => {
			// Extract the contaminant name and result
			const characteristicNameField = Object.keys(result).find(
				(key) => key.toLowerCase() === 'characteristicname'
			);

			if (!characteristicNameField) return;

			const name = result[characteristicNameField].toUpperCase();

			// Find the result value field
			const resultValueField = Object.keys(result).find(
				(key) => key.toLowerCase() === 'resultmeasurevalue'
			);

			if (!resultValueField) return;

			const value = parseFloat(result[resultValueField] || 0);

			// Find the unit field
			const unitField = Object.keys(result).find(
				(key) => key.toLowerCase() === 'resultmeasureunitcode'
			);

			const unit = unitField
				? (result[unitField] || 'unknown').toLowerCase()
				: 'unknown';

			if (isNaN(value)) return;

			if (!contaminantGroups[name]) {
				contaminantGroups[name] = {
					name: name,
					hasViolation: false,
					readings: [],
				};
			}

			// Find date field
			const dateField = Object.keys(result).find(
				(key) => key.toLowerCase() === 'activitystartdate'
			);

			contaminantGroups[name].readings.push({
				value: value,
				unit: unit,
				date: dateField ? result[dateField] || '' : '',
			});
		});
	}

	// Format contaminants for email format
	const formattedContaminants = [];

	Object.values(contaminantGroups).forEach((group) => {
		// Get max reading
		let maxReading = null;
		if (group.readings && group.readings.length > 0) {
			// Sort readings by value (descending)
			group.readings.sort((a, b) => b.value - a.value);
			maxReading = group.readings[0];
		}

		// Get health guideline info
		const healthInfo = healthGuidelines[group.name] || null;

		// Calculate times value if possible
		let timesValue = null;
		let level = null;

		if (maxReading && healthInfo) {
			const convertedValue = convertToMatchingUnit(
				maxReading.value,
				maxReading.unit,
				healthInfo.unit
			);
			if (convertedValue !== null) {
				timesValue =
					Math.round((convertedValue / healthInfo.value) * 10) / 10;
				level = `${convertedValue} ${healthInfo.unit}`;
			} else {
				level = `${maxReading.value} ${maxReading.unit}`;
			}
		} else if (group.level) {
			// Use the level from the group if no readings
			level = group.level;
		}

		formattedContaminants.push({
			name: formatName(group.name),
			level:
				level ||
				(group.hasViolation ? 'Violation detected' : 'Unknown level'),
			timesValue: timesValue !== null ? `${timesValue} times` : null,
			healthGuideline: healthInfo
				? `${healthInfo.value} ${healthInfo.unit}`
				: 'Not available',
			legalLimit: healthInfo ? healthInfo.legalLimit : 'Not available',
			hasViolation: group.hasViolation,
		});
	});

	// Sort by times value (descending) if available, otherwise by name
	formattedContaminants.sort((a, b) => {
		if (a.timesValue && b.timesValue) {
			return parseFloat(b.timesValue) - parseFloat(a.timesValue);
		}
		if (a.hasViolation && !b.hasViolation) return -1;
		if (!a.hasViolation && b.hasViolation) return 1;
		return a.name.localeCompare(b.name);
	});

	return formattedContaminants;
}

/**
 * Format contaminant name to be more readable
 * @param {string} name - Raw contaminant name
 * @returns {string} - Formatted name
 */
function formatName(name) {
	return name
		.split(' ')
		.map((word) => word.charAt(0) + word.slice(1).toLowerCase())
		.join(' ');
}

/**
 * Convert a value from one unit to another
 * @param {number} value - Value to convert
 * @param {string} fromUnit - Source unit
 * @param {string} toUnit - Target unit
 * @returns {number|null} - Converted value or null if conversion not possible
 */
function convertToMatchingUnit(value, fromUnit, toUnit) {
	if (fromUnit === toUnit) return value;

	// Common conversions
	const conversions = {
		ppb_to_ppm: 0.001,
		ppm_to_ppb: 1000,
		'ug/l_to_ppb': 1, // ug/L is the same as ppb
		'mg/l_to_ppb': 1000, // mg/L to ppb = x1000
		'mg/l_to_ppm': 1, // mg/L is the same as ppm
	};

	const conversionKey = `${fromUnit}_to_${toUnit}`;
	const reverseConversionKey = `${toUnit}_to_${fromUnit}`;

	if (conversions[conversionKey]) {
		return value * conversions[conversionKey];
	} else if (conversions[reverseConversionKey]) {
		return value / conversions[reverseConversionKey];
	}

	// Special cases
	if (fromUnit === 'mg/l' && toUnit === 'ppb') {
		return value * 1000;
	} else if (fromUnit === 'ug/l' && toUnit === 'ppb') {
		return value; // Same unit, different name
	}

	return null; // Conversion not possible
}

module.exports = fetchWaterData;
