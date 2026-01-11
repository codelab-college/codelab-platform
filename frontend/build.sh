#!/bin/bash
# Render build script for frontend

echo "📦 Installing dependencies..."
npm install

echo "🏗️  Building for production..."
npm run build

echo "✅ Build complete!"
