#!/bin/bash
set -e

echo "🚀 Setting up local environment for screenshots..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Start local Postgres
echo "🐘 Starting local Postgres..."
docker run --name cerpamedia-test-db \
  -e POSTGRES_PASSWORD=test \
  -e POSTGRES_USER=test \
  -e POSTGRES_DB=cerpamedia \
  -p 5432:5432 \
  -d postgres:16-alpine || docker start cerpamedia-test-db

# Wait for Postgres to be ready
echo "⏳ Waiting for Postgres..."
sleep 3

# Set up local env
export DATABASE_URL="postgresql://test:test@localhost:5432/cerpamedia"
export ADMIN_EMAIL="test@example.com"
export NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# Push schema
echo "📦 Pushing Prisma schema..."
npx prisma db push --skip-generate

# Seed database
echo "🌱 Seeding database..."
npx tsx scripts/seed-screenshots.ts

# Build and start the app
echo "🏗️  Building app..."
npm run build

echo "🚀 Starting app..."
npm run start &
APP_PID=$!

# Wait for app to be ready
echo "⏳ Waiting for app to start..."
sleep 10

# Install Playwright browsers if needed
echo "🎭 Installing Playwright browsers..."
npx playwright install chromium

# Run screenshot capture
echo "📸 Capturing screenshots..."
npx playwright test scripts/capture-screenshots.spec.ts

# Cleanup
echo "🧹 Cleaning up..."
kill $APP_PID || true
docker stop cerpamedia-test-db
docker rm cerpamedia-test-db

echo "✅ Done! Screenshots are in artifacts/screenshots/"
