#!/bin/bash

# Local Development Script for ANIDHI Huginn
# Test Huginn locally before deploying to Render.com

set -e

echo "🤖 Starting ANIDHI Huginn Local Development Environment..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

echo "✅ Docker is running"

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose not found. Please install Docker Compose."
    exit 1
fi

echo "✅ Docker Compose is available"
echo ""

# Build and start services
echo "🏗️  Building Huginn Docker image..."
docker-compose build

echo ""
echo "🚀 Starting services (PostgreSQL + Huginn)..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Services are running!"
    echo ""
    echo "🎉 Huginn is now available at: http://localhost:3000"
    echo ""
    echo "📋 Next steps:"
    echo "1. Open http://localhost:3000 in your browser"
    echo "2. Create an account using invitation code: anidhi-local-dev"
    echo "3. Test the Huginn interface and create agents"
    echo "4. Once working locally, deploy to Render.com"
    echo ""
    echo "🔧 Useful commands:"
    echo "- View logs: docker-compose logs -f huginn"
    echo "- Stop services: docker-compose down"
    echo "- Restart: docker-compose restart huginn"
    echo ""
else
    echo "❌ Services failed to start. Checking logs..."
    docker-compose logs huginn
fi