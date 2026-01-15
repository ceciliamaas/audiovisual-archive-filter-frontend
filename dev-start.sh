#!/bin/bash
# Development startup script for frontend

echo "🎨 Starting Frontend Development Server..."

# Change to script directory
cd "$(dirname "$0")"

# Start the dev server
npm run dev
