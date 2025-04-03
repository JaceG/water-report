import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage.js';
import WaterReportPage from './pages/WaterReportPage.js';
import './styles/App.css';

function App() {
	return (
		<div className='app'>
			<Routes>
				<Route path='/' element={<LandingPage />} />
				<Route path='/water-report' element={<WaterReportPage />} />
			</Routes>
		</div>
	);
}

export default App;
