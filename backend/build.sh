#!/bin/bash
# Render build script for backend

echo "📦 Installing dependencies..."
npm install

echo "🗄️  Initializing database..."
npm run init-db

echo "🌱 Seeding database..."
npm run seed

echo "✅ Build complete!"
