// Mock water quality data based on EWG's tap water database
// This is fallback data in case the API fails

export const waterQualityData = {
	systemInfo: {
		name: 'Default Water System',
		id: 'WS00000',
		location: 'Unknown Location, United States',
		population: '1,000,000+',
		violationPoints: 10,
		nationalAvgViolationPoints: 8,
	},
	contaminants: [
		{
			name: 'Chromium (hexavalent)',
			level: '0.0622 ppb',
			legalLimit: 'No federal legal limit',
			healthGuideline: '0.02 ppb',
			description:
				'Chromium (hexavalent) is a carcinogen that commonly contaminates drinking water. The legal limit (MCL) for chromium in drinking water is 50 ppb. The EPA has proposed a new legal limit for chromium-6 at 0.07 ppb, but it will take years to implement.',
			sourceType: 'Industrial',
			healthRisk: 'Cancer',
		},
		{
			name: 'Haloacetic acids (HAA5)',
			level: '11.8 ppb',
			legalLimit: '60 ppb',
			healthGuideline: '0.1 ppb',
			description:
				'Haloacetic acids (HAA5) are disinfection byproducts that form when chlorine is added to water. The legal limit is 60 ppb, but studies link these byproducts to cancer and reproductive harm.',
			sourceType: 'Treatment Byproduct',
			healthRisk: 'Cancer',
		},
		{
			name: 'Total trihalomethanes (TTHMs)',
			level: '40.5 ppb',
			legalLimit: '80 ppb',
			healthGuideline: '0.15 ppb',
			description:
				'Total trihalomethanes (TTHMs) are disinfection byproducts that form when chlorine is added to water. The legal limit is 80 ppb, but studies link these byproducts to cancer and reproductive harm.',
			sourceType: 'Treatment Byproduct',
			healthRisk: 'Cancer',
		},
		{
			name: 'Arsenic',
			level: '0.428 ppb',
			legalLimit: '10 ppb',
			healthGuideline: '0.004 ppb',
			description:
				'Arsenic is a potent carcinogen naturally present in groundwater. The EPA set a goal of 0 ppb, but the current legal limit is 10 ppb, which is based on cost-convenience balance rather than health protection.',
			sourceType: 'Natural Deposits',
			healthRisk: 'Cancer',
		},
		{
			name: 'Nitrate',
			level: '0.372 ppm',
			legalLimit: '10 ppm',
			healthGuideline: '0.14 ppm',
			description:
				'Nitrate is a primary drinking water contaminant. Common sources include fertilizer runoff, septic tanks, sewage, and erosion of natural deposits.',
			sourceType: 'Agriculture',
			healthRisk: 'Developmental Issues',
		},
		{
			name: 'Bromate',
			level: '7.3 ppb',
			legalLimit: '10 ppb',
			healthGuideline: '0.1 ppb',
			description:
				'Bromate forms when disinfectants react with bromide in source water. The EPA has classified bromate as a probable human carcinogen.',
			sourceType: 'Treatment Byproduct',
			healthRisk: 'Cancer',
		},
	],
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
			"This is fallback data used when API data cannot be retrieved. For actual water quality information, please refer to your local water utility's Consumer Confidence Report.",
	},
};

export default waterQualityData;
