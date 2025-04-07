# Water Report Landing Page

A React-based landing page with a form to collect email and zip code, which then displays a water quality report comparing contaminant levels to health guidelines. This project is intended for marketers selling water-related products.

## Features

- Clean, modern landing page design
- Simple form to collect email and zip code
- Detailed water quality report display showing:
  - Water system information
  - Contaminant levels compared to health guidelines (with multiplier values)
  - Detailed explanations of each contaminant
  - Filter recommendations based on detected contaminants
- Responsive design for all devices
- Sales-focused pitch for water filtration products

## Tech Stack

- React.js with React Router
- Express.js backend with API integration
- CSS Grid and Flexbox for responsive layout

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/water-report-app.git
cd water-report-app
```

2. Install dependencies
```
npm install
```

3. Start the development environment
```
./start-dev.sh
```

This will start:
- The backend server on port 3000
- The React app on port 3001

### Available Scripts

- `npm run dev` - Starts the Express server with nodemon
- `npm run react-dev` - Starts the React development server
- `npm run build` - Builds the React app for production
- `npm start` - Runs the production server

## Project Structure

```
water-report-app/
├── public/                # Static files for React
├── src/                   # React source files
│   ├── components/        # Reusable components
│   ├── pages/             # Page components
│   ├── styles/            # CSS files
│   └── data/              # Mock data files
├── utils/                 # Backend utility functions
├── server.js              # Express server
└── package.json           # Dependencies and scripts
```

## API Integration

Currently, the app uses simulated water quality data based on ZIP codes. For full production implementation, you would integrate with one of these APIs:

1. **EPA WATERS API**: https://watersgeo.epa.gov/openapi/waters/
   - Provides water system information, but limited contaminant data
   - Endpoints for finding water systems by location

2. **Water Quality Portal**: https://www.waterqualitydata.us/webservices_documentation/
   - More comprehensive water testing data
   - Requires additional data transformation

3. **EWG Tap Water Database**:
   - Most comprehensive source for consumer-friendly water quality reporting
   - Does not have a public API (would require partnership)

## Future Development

To integrate with the EPA WATERS API:

1. Use the `/WaterSystem/getWaterSystemsByZip` endpoint to find water systems by ZIP code
2. Use the `/SDWA/getViolationsSystemHistory` endpoint to check for violations
3. Create a proprietary database of common contaminants by water source type
4. Generate health guidelines based on research

## Deployment

To deploy to production:

1. Build the React app
```
npm run build
```

2. Set environment variable
```
export NODE_ENV=production
```

3. Start the server
```
npm start
```

The server will serve the static React files and handle any API requests.

## Customization

- Update the water quality data calculation in `utils/fetchWaterData.js` 
- Modify the landing page content in `src/pages/LandingPage.js` 
- Change the styling in the CSS files under `src/styles/`

## License

MIT

## Contact

Your Name - jace.galloway@gmail.com

---

*Created as a demonstration for marketers selling water-related products.* 