#!/bin/bash

# Kill any existing processes on ports 3000 and 3001
echo "Checking for existing processes..."
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:3001 | xargs kill -9 2>/dev/null

# Wait to ensure ports are freed
sleep 1

# Start the backend server in the background
echo "Starting backend server..."
npm run dev &

# Wait 3 seconds to ensure the backend is running
sleep 3

# Start the React development server
echo "Starting React development server..."
PORT=3001 npm run react-dev 