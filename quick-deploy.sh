#!/bin/bash

echo "🚀 StockTake Pro - Quick Deploy Script"
echo "======================================"

echo ""
echo "✅ Code pushed to GitHub successfully!"
echo "📁 Repository: https://github.com/GaryNg-Casetagram/figma-stocktake-nextjs"
echo ""

echo "🌐 Next Steps for Deployment:"
echo ""

echo "1️⃣  Set up Neon Database:"
echo "   • Go to https://neon.tech"
echo "   • Sign up with GitHub"
echo "   • Create project: 'stocktake-pro'"
echo "   • Copy connection string"
echo "   • Update .env.production with your URL"
echo ""

echo "2️⃣  Deploy to Vercel:"
echo "   • Go to https://vercel.com"
echo "   • Sign up with GitHub"
echo "   • Click 'New Project'"
echo "   • Import: GaryNg-Casetagram/figma-stocktake-nextjs"
echo "   • Add environment variables (see guide)"
echo ""

echo "3️⃣  Configure Environment Variables:"
echo "   DATABASE_URL = [Your Neon connection string]"
echo "   NEXT_PUBLIC_APP_URL = https://your-app.vercel.app"
echo "   NEXT_PUBLIC_APP_NAME = StockTake Pro"
echo "   NEXT_PUBLIC_APP_VERSION = 1.0.0"
echo "   PRISMA_GENERATE_DATAPROXY = false"
echo "   NODE_ENV = production"
echo ""

echo "4️⃣  Deploy Database Schema:"
echo "   • After Vercel deployment, run:"
echo "   • ./switch-database.sh (choose option 2)"
echo "   • npx prisma db push"
echo "   • npm run db:seed"
echo ""

echo "📖 For detailed instructions, see:"
echo "   • PRODUCTION-DEPLOYMENT-GUIDE.md"
echo "   • DEPLOYMENT-CHECKLIST.md"
echo ""

echo "🎯 Your app will be live at:"
echo "   https://your-app-name.vercel.app"
echo ""

echo "🎉 StockTake Pro is ready for production! 🎉"
