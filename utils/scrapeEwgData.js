import axios from 'axios';
import cheerio from 'cheerio';

const baseUrl = 'https://www.ewg.org/tapwater/search-results.php?zip5=';

async function fetchUtilityUrl(zip) {
	const { data } = await axios.get(`${baseUrl}${zip}`);
	const $ = cheerio.load(data);

	const firstUtilityLink = $('table.featured-utility-table tbody tr')
		.first()
		.find('a')
		.attr('href');
	if (!firstUtilityLink) throw new Error('No utility link found');

	return `https://www.ewg.org/tapwater/${firstUtilityLink}`;
}

async function scrapeContaminants(url) {
	const { data } = await axios.get(url);
	const $ = cheerio.load(data);

	const contaminants = [];

	$('.contaminant-name').each((_, element) => {
		const contaminantName = $(element)
			.find('.contaminant-title-wrapper')
			.text();
		const potentialEffect = $(element).find('.potentital-effect').text();
		const detectTimesGreaterThan = $(element)
			.find('.detect-times-greater-than')
			.text();
		const thisUtilityText = $(element).find('.this-utility-text').text();
		const legalLimitText = $(element).find('.legal-limit-text').text();
		const healthGuidelineText = $(element)
			.find('.health-guideline-text')
			.text();

		contaminants.push({
			contaminantName,
			potentialEffect,
			detectTimesGreaterThan,
			thisUtilityText,
			legalLimitText,
			healthGuidelineText,
		});
	});

	return contaminants;
}

async function fetchEWG(zip) {
	try {
		const utilityUrl = await fetchUtilityUrl(zip);
		const contaminants = await scrapeContaminants(utilityUrl);
		return contaminants;
	} catch (error) {
		console.error('Error:', error.message);
	}
}

export default fetchEWG;
