#!/bin/bash

echo "🔄 StockTake Pro - Database Switcher"
echo "===================================="

# Check if required files exist
if [ ! -f ".env.backup" ]; then
    echo "❌ .env.backup not found. Creating backup..."
    cp .env .env.backup
fi

if [ ! -f ".env.production" ]; then
    echo "❌ .env.production not found. Creating template..."
    cat > .env.production << EOF
# Production Database URL from Neon
# Replace this with your actual Neon connection string
DATABASE_URL="postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Next.js Environment
NEXT_PUBLIC_APP_URL="https://your-app-name.vercel.app"
NEXT_PUBLIC_APP_NAME="StockTake Pro"
NEXT_PUBLIC_APP_VERSION="1.0.0"
EOF
    echo "✅ Created .env.production template"
fi

echo ""
echo "Choose database configuration:"
echo "1. Local SQLite (Development)"
echo "2. Production PostgreSQL (Neon)"
echo "3. Test current database connection"
echo "4. Deploy schema to current database"
echo "5. Seed current database"

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo "🔄 Switching to SQLite (Development)..."
        cp .env.backup .env
        
        # Update Prisma schema for SQLite
        sed -i.bak 's/provider = "postgresql"/provider = "sqlite"/' prisma/schema.prisma
        
        # Regenerate Prisma client
        npx prisma generate
        
        echo "✅ Switched to SQLite development database"
        echo "📁 Database file: ./prisma/dev.db"
        ;;
    2)
        echo "🔄 Switching to PostgreSQL (Production)..."
        
        # Check if production env has real database URL
        if grep -q "ep-xxx" .env.production; then
            echo "⚠️  Warning: .env.production still contains placeholder URL"
            echo "Please update it with your actual Neon database URL first"
            read -p "Continue anyway? (y/N): " confirm
            if [[ ! $confirm =~ ^[Yy]$ ]]; then
                echo "❌ Aborted. Update .env.production first."
                exit 1
            fi
        fi
        
        cp .env.production .env
        
        # Update Prisma schema for PostgreSQL
        sed -i.bak 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma
        
        # Regenerate Prisma client
        npx prisma generate
        
        echo "✅ Switched to PostgreSQL production database"
        ;;
    3)
        echo "🔍 Testing database connection..."
        npx prisma db push --accept-data-loss
        if [ $? -eq 0 ]; then
            echo "✅ Database connection successful!"
        else
            echo "❌ Database connection failed!"
            echo "Check your DATABASE_URL in .env file"
        fi
        ;;
    4)
        echo "🚀 Deploying schema to database..."
        npx prisma db push
        if [ $? -eq 0 ]; then
            echo "✅ Schema deployed successfully!"
        else
            echo "❌ Schema deployment failed!"
        fi
        ;;
    5)
        echo "🌱 Seeding database..."
        npm run db:seed
        if [ $? -eq 0 ]; then
            echo "✅ Database seeded successfully!"
        else
            echo "❌ Database seeding failed!"
        fi
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "📋 Current configuration:"
echo "Environment file: $(ls -la .env | awk '{print $9, $10, $11}')"
echo "Database provider: $(grep 'provider =' prisma/schema.prisma | cut -d'"' -f2)"
echo "Database URL: $(grep 'DATABASE_URL=' .env | cut -d'=' -f2 | cut -c1-20)..."
