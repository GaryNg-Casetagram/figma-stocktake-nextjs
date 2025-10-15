# StockTake Pro - Deployment Checklist

## ✅ Pre-Deployment Checklist

### Database Setup
- [ ] Created Neon account and project
- [ ] Copied Neon database connection string
- [ ] Updated .env.production with real DATABASE_URL
- [ ] Tested database connection locally
- [ ] Deployed schema: `npx prisma db push`
- [ ] Seeded database: `npm run db:seed`

### Vercel Environment Variables
- [ ] DATABASE_URL (Neon connection string)
- [ ] NEXT_PUBLIC_APP_URL (your Vercel app URL)
- [ ] NEXT_PUBLIC_APP_NAME (StockTake Pro)
- [ ] NEXT_PUBLIC_APP_VERSION (1.0.0)
- [ ] PRISMA_GENERATE_DATAPROXY (false)
- [ ] NODE_ENV (production)

### Code Preparation
- [ ] All files committed to git
- [ ] Pushed to GitHub repository
- [ ] Build passes locally: `npm run build`
- [ ] No linting errors

## 🚀 Deployment Steps

### 1. Deploy to Vercel
- [ ] Import GitHub repository in Vercel
- [ ] Configure environment variables
- [ ] Deploy project

### 2. Post-Deployment
- [ ] Verify app loads correctly
- [ ] Test database connection
- [ ] Check all API endpoints work
- [ ] Test session creation
- [ ] Verify data persistence

### 3. Final Verification
- [ ] App accessible at Vercel URL
- [ ] Database queries working
- [ ] Forms submitting correctly
- [ ] No console errors
- [ ] Mobile responsive design

## 🔧 Troubleshooting

### Common Issues
- **Build fails**: Check environment variables
- **Database errors**: Verify DATABASE_URL format
- **API errors**: Check Prisma client generation
- **Styling issues**: Verify Bootstrap CSS loading

### Useful Commands
```bash
# Test database connection
npx prisma db push

# Generate Prisma client
npx prisma generate

# Seed database
npm run db:seed

# Check build locally
npm run build

# View logs in Vercel dashboard
# Go to Functions tab for API logs
```
