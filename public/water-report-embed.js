/**
 * Water Report Form Embed Script
 * This script creates an embeddable version of the water report request form
 * that can be added to any WordPress site via a shortcode or widget.
 */

(function () {
	// Get the current protocol (http: or https:)
	const currentProtocol = window.location.protocol;

	// Configuration - Use the provided URL, or create a protocol-relative URL
	// Protocol-relative URLs automatically use http: or https: based on the parent page
	const defaultApiUrl = '//64.23.239.32:3000'; // Notice the '//' without 'http:' or 'https:'
	const API_URL = window.WATER_REPORT_API_URL || defaultApiUrl;

	// CSS Styles for the form
	const styles = `
    .water-report-form {
      font-family: 'Arial', sans-serif;
      line-height: 1.6;
      color: #333;
    }
    .water-report-form-container {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      padding: 30px;
      margin-top: 30px;
    }
    .water-report-form-group {
      margin-bottom: 20px;
    }
    .water-report-form label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
    }
    .water-report-form input {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 16px;
    }
    .water-report-form button {
      background-color: #4CAF50;
      color: white;
      border: none;
      padding: 12px 20px;
      font-size: 16px;
      border-radius: 4px;
      cursor: pointer;
      width: 100%;
    }
    .water-report-form button:hover {
      background-color: #45a049;
    }
    .water-report-response {
      margin-top: 20px;
      padding: 15px;
      background-color: #f5f5f5;
      border-radius: 4px;
      display: none;
    }
    .water-report-success {
      color: #4CAF50;
    }
    .water-report-error {
      color: #f44336;
    }
  `;

	// Form HTML
	const formHTML = `
    <div class="water-report-form">
      <div class="water-report-form-container">
        <form id="water-report-embed-form">
          <div class="water-report-form-group">
            <label for="water-report-email">Email:</label>
            <input type="email" id="water-report-email" required placeholder="your.email@example.com">
          </div>
          <div class="water-report-form-group">
            <label for="water-report-zipCode">ZIP Code:</label>
            <input type="text" id="water-report-zipCode" required placeholder="e.g., 90210" pattern="^\\d{5}(-\\d{4})?$">
          </div>
          <button type="submit">Get My Water Report</button>
        </form>
        <div id="water-report-api-response" class="water-report-response"></div>
      </div>
    </div>
  `;

	// Function to initialize and inject the form
	function initWaterReportForm() {
		// Create style element
		const styleEl = document.createElement('style');
		styleEl.textContent = styles;
		document.head.appendChild(styleEl);

		// Find all containers with data-water-report-embed attribute
		const containers = document.querySelectorAll(
			'[data-water-report-embed]'
		);

		containers.forEach((container) => {
			// Inject the form HTML
			container.innerHTML = formHTML;

			// Add event listener to the form
			const form = container.querySelector('#water-report-embed-form');
			form.addEventListener('submit', handleSubmit);
		});
	}

	// Function to handle form submission
	async function handleSubmit(event) {
		event.preventDefault();

		const form = event.target;
		const container = form.closest('.water-report-form');
		const email = container.querySelector('#water-report-email').value;
		const zipCode = container.querySelector('#water-report-zipCode').value;
		const responseEl = container.querySelector(
			'#water-report-api-response'
		);

		responseEl.style.display = 'block';
		responseEl.innerHTML = 'Processing your request...';
		responseEl.className = 'water-report-response';

		try {
			// Ensure we use the same protocol (http/https) as the parent page for the API request
			const apiUrl = API_URL.startsWith('//')
				? `${currentProtocol}${API_URL.replace('//', '')}`
				: API_URL;

			const response = await fetch(`${apiUrl}/api/request-report`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					email: email,
					location: zipCode,
				}),
			});

			const data = await response.json();

			if (response.ok) {
				responseEl.innerHTML =
					'<h3 class="water-report-success">Success!</h3><p>Your water quality report has been generated. Check your email inbox for details.</p>';
				responseEl.className =
					'water-report-response water-report-success';
			} else {
				responseEl.innerHTML = `<h3 class="water-report-error">Error</h3><p>${
					data.error || 'There was a problem processing your request.'
				}</p>`;
				responseEl.className =
					'water-report-response water-report-error';
			}
		} catch (error) {
			responseEl.innerHTML =
				'<h3 class="water-report-error">Error</h3><p>There was a problem connecting to the server. Please try again later.</p>';
			responseEl.className = 'water-report-response water-report-error';
			console.error('API request failed:', error);
		}
	}

	// Initialize when the DOM is fully loaded
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initWaterReportForm);
	} else {
		initWaterReportForm();
	}
})();
