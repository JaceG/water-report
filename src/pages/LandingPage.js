import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/LandingPage.css';

const LandingPage = () => {
	const [email, setEmail] = useState('');
	const [zipCode, setZipCode] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const navigate = useNavigate();

	// Get the API URL from environment variables or default to localhost:3000
	const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

	// Validate US zip code format (5 digits, optionally followed by dash and 4 more digits)
	const isValidZipCode = (zip) => {
		return /^\d{5}(-\d{4})?$/.test(zip);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');

		if (!email) {
			setError('Please enter your email address');
			return;
		}

		if (!zipCode) {
			setError('Please enter your ZIP code');
			return;
		}

		if (!isValidZipCode(zipCode)) {
			setError('Please enter a valid 5-digit US ZIP code');
			return;
		}

		setLoading(true);

		try {
			// Call the actual API endpoint
			const response = await axios.post(`${API_URL}/api/request-report`, {
				email,
				location: zipCode,
			});

			// For demo purposes, we'll still navigate to the report page with the form data
			// instead of waiting for a real email
			navigate('/water-report', {
				state: {
					email,
					zipCode,
					// Pass any data that came back from the API
					apiResponse: response.data,
				},
			});
		} catch (err) {
			setError(
				'There was an error processing your request. Please try again.'
			);
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='landing-page'>
			<header className='header'>
				<div className='container'>
					<div className='logo'>
						PureWater<span>Plus</span>
					</div>
					<nav>
						<ul>
							<li>
								<a href='#'>Home</a>
							</li>
							<li>
								<a href='#'>About</a>
							</li>
							<li>
								<a href='#'>Products</a>
							</li>
							<li>
								<a href='#'>Contact</a>
							</li>
						</ul>
					</nav>
				</div>
			</header>

			<main>
				<section className='hero'>
					<div className='container'>
						<div className='hero-content'>
							<h1>Do You Know What's In Your Water?</h1>
							<h2>Get Your Free Water Quality Report Today</h2>
							<p>
								Clean water is essential for your family's
								health. Our complimentary water quality report
								will help you understand what contaminants might
								be present in your tap water and what you can do
								about it.
							</p>
						</div>

						<div className='form-container'>
							<div className='form-header'>
								<h3>Get Your FREE Water Report</h3>
								<p>
									Know exactly what's in your water within
									minutes!
								</p>
							</div>

							{error && (
								<div className='error-message'>{error}</div>
							)}

							<form onSubmit={handleSubmit}>
								<div className='form-group'>
									<label htmlFor='email'>Email Address</label>
									<input
										type='email'
										id='email'
										className='form-control'
										value={email}
										onChange={(e) =>
											setEmail(e.target.value)
										}
										placeholder='yourname@example.com'
										required
									/>
								</div>

								<div className='form-group'>
									<label htmlFor='zipCode'>ZIP Code</label>
									<input
										type='text'
										id='zipCode'
										className='form-control'
										value={zipCode}
										onChange={(e) =>
											setZipCode(e.target.value)
										}
										placeholder='Enter your ZIP code (e.g., 43210)'
										maxLength='10'
										pattern='^\d{5}(-\d{4})?$'
										title='Please enter a valid 5-digit US ZIP code'
										required
									/>
								</div>

								<button
									type='submit'
									className='btn btn-primary btn-block'
									disabled={loading}>
									{loading
										? 'Processing...'
										: 'Get My Free Water Report'}
								</button>
							</form>

							<div className='form-footer'>
								<p>
									Your privacy matters to us. We'll never
									share your information with third parties.
								</p>
							</div>
						</div>
					</div>
				</section>

				<section className='benefits'>
					<div className='container'>
						<h2 className='text-center mb-4'>
							Why Get Your Water Report?
						</h2>
						<div className='benefits-grid'>
							<div className='benefit-card'>
								<div className='benefit-icon'>💧</div>
								<h3>Know What You Drink</h3>
								<p>
									Identify potential contaminants in your
									local water supply.
								</p>
							</div>

							<div className='benefit-card'>
								<div className='benefit-icon'>🛡️</div>
								<h3>Protect Your Family</h3>
								<p>
									Make informed decisions about your family's
									water consumption.
								</p>
							</div>

							<div className='benefit-card'>
								<div className='benefit-icon'>💰</div>
								<h3>Save Money</h3>
								<p>
									Avoid expensive bottled water with the right
									filtration system.
								</p>
							</div>
						</div>
					</div>
				</section>

				<section className='testimonials'>
					<div className='container'>
						<h2 className='text-center mb-4'>
							What Our Customers Say
						</h2>
						<div className='testimonial-grid'>
							<div className='testimonial-card'>
								<div className='testimonial-content'>
									<p>
										"The water report was eye-opening. I had
										no idea there were so many contaminants
										in my tap water!"
									</p>
								</div>
								<div className='testimonial-author'>
									<div className='author-name'>Sarah J.</div>
									<div className='author-location'>
										Cleveland, OH
									</div>
								</div>
							</div>

							<div className='testimonial-card'>
								<div className='testimonial-content'>
									<p>
										"After getting my water report, I
										invested in a PureWater Plus filtration
										system. Best decision ever!"
									</p>
								</div>
								<div className='testimonial-author'>
									<div className='author-name'>
										Michael T.
									</div>
									<div className='author-location'>
										Austin, TX
									</div>
								</div>
							</div>

							<div className='testimonial-card'>
								<div className='testimonial-content'>
									<p>
										"The detailed report helped me
										understand exactly what I needed to
										filter out. So much better than
										guessing!"
									</p>
								</div>
								<div className='testimonial-author'>
									<div className='author-name'>
										Jennifer M.
									</div>
									<div className='author-location'>
										Chicago, IL
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>
			</main>

			<footer className='footer'>
				<div className='container'>
					<div className='footer-content'>
						<div className='footer-logo'>
							PureWater<span>Plus</span>
						</div>
						<p>Providing clean water solutions since 2005</p>
						<p>&copy; 2023 PureWaterPlus. All rights reserved.</p>
					</div>
				</div>
			</footer>
		</div>
	);
};

export default LandingPage;
