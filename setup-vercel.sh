#!/bin/bash

echo "🚀 StockTake Pro - Vercel Environment Setup"
echo "============================================="

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "❌ .env.production file not found!"
    echo "Creating template..."
    
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
echo "📋 Next Steps:"
echo "1. Get your Neon database URL from neon.tech"
echo "2. Update .env.production with your actual DATABASE_URL"
echo "3. Run: ./setup-db.sh (option 4) to deploy schema"
echo "4. Add these environment variables to Vercel:"
echo ""

echo "🔧 Vercel Environment Variables to Add:"
echo "========================================"
echo "DATABASE_URL = [Your Neon connection string]"
echo "NEXT_PUBLIC_APP_URL = https://your-app-name.vercel.app"
echo "NEXT_PUBLIC_APP_NAME = StockTake Pro"
echo "NEXT_PUBLIC_APP_VERSION = 1.0.0"
echo "PRISMA_GENERATE_DATAPROXY = false"
echo "NODE_ENV = production"
echo ""

echo "📖 For detailed instructions, see DEPLOYMENT-CHECKLIST.md"
