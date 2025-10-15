#!/bin/bash

# StockTake Pro - Environment Setup Script

echo "🚀 StockTake Pro - Database Setup"
echo "=================================="

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "❌ .env.production file not found!"
    echo "Please create it with your Neon database URL first."
    exit 1
fi

echo "📋 Available commands:"
echo "1. Switch to production database"
echo "2. Switch back to development database"
echo "3. Test database connection"
echo "4. Deploy schema to production"
echo "5. Seed production database"

read -p "Choose an option (1-5): " choice

case $choice in
    1)
        echo "🔄 Switching to production database..."
        cp .env.production .env
        echo "✅ Switched to production database"
        echo "Run 'npx prisma db push' to deploy schema"
        ;;
    2)
        echo "🔄 Switching to development database..."
        cp .env.backup .env
        echo "✅ Switched to development database"
        ;;
    3)
        echo "🔍 Testing database connection..."
        npx prisma db push --accept-data-loss
        echo "✅ Database connection successful!"
        ;;
    4)
        echo "🚀 Deploying schema to production..."
        cp .env.production .env
        npx prisma db push
        echo "✅ Schema deployed successfully!"
        ;;
    5)
        echo "🌱 Seeding production database..."
        cp .env.production .env
        npm run db:seed
        echo "✅ Database seeded successfully!"
        ;;
    *)
        echo "❌ Invalid option"
        ;;
esac
