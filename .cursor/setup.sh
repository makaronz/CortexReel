#!/bin/bash

# CortexReel Background Agent Setup Script
# This script prepares the development environment for optimal agent performance

echo "🎬 Setting up CortexReel development environment..."

# Check Node.js version
echo "📦 Checking Node.js version..."
node --version
npm --version

# Install global dependencies that might be useful
echo "🔧 Installing global development tools..."
npm install -g typescript @types/node

# Create necessary directories
echo "📁 Creating development directories..."
mkdir -p logs
mkdir -p temp
mkdir -p memory-bank/exports

# Set up environment file template if it doesn't exist
if [ ! -f .env.local ]; then
    echo "🔐 Creating .env.local template..."
    cp env.example .env.local
    echo "⚠️  Remember to add your VITE_GEMINI_API_KEY to .env.local"
fi

# Verify critical files exist
echo "✅ Verifying project structure..."
if [ -f "package.json" ]; then
    echo "✓ package.json found"
else
    echo "❌ package.json missing"
    exit 1
fi

if [ -f "vite.config.ts" ]; then
    echo "✓ vite.config.ts found"
else
    echo "❌ vite.config.ts missing"
    exit 1
fi

if [ -f "tsconfig.json" ]; then
    echo "✓ tsconfig.json found"
else
    echo "❌ tsconfig.json missing"
    exit 1
fi

# Check if ports are available
echo "🌐 Checking port availability..."
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 5173 is already in use"
else
    echo "✓ Port 5173 is available"
fi

echo "🎭 CortexReel environment setup complete!"
echo "Ready for background agent deployment." 