# StockTake Pro - Advanced Inventory Management

A modern, professional inventory management and stock counting solution built with Next.js, Bootstrap, and Prisma.

## Features

- 🏠 **Dashboard**: Overview with analytics and quick actions
- 📋 **Session Management**: Create and manage stock take sessions
- 📦 **Inventory Tracking**: Real-time item counting and tracking
- 📊 **Reports**: Analytics and reporting capabilities
- 🎨 **Modern UI**: Bootstrap-powered responsive design
- 🔍 **Barcode Support**: Ready for barcode scanning integration
- 📱 **Mobile Friendly**: Responsive design for all devices

## Tech Stack

- **Frontend**: Next.js 15, React 19, Bootstrap 5, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQLite (dev) / PostgreSQL (production)
- **Deployment**: Vercel
- **Icons**: Bootstrap Icons

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd figma-stocktake-nextjs
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Set up the database:
```bash
npm run db:push
npm run db:seed
```

5. Start the development server:
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Deployment

### Deploy to Vercel

1. **Install Vercel CLI** (if not already installed):
```bash
npm install -g vercel
```

2. **Login to Vercel**:
```bash
vercel login
```

3. **Set up production database**:
   - Create a PostgreSQL database (recommended: Neon, Supabase, or PlanetScale)
   - Add the database URL to your environment variables

4. **Deploy**:
```bash
vercel --prod
```

### Environment Variables

Set these environment variables in your Vercel dashboard:

- `DATABASE_URL`: Your PostgreSQL connection string
- `NEXT_PUBLIC_APP_URL`: Your deployed app URL

### Database Setup for Production

1. **Push schema to production database**:
```bash
npx prisma db push --schema=./prisma/schema.prisma
```

2. **Seed production database**:
```bash
npm run db:seed
```

## Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── api/            # API routes
│   ├── sessions/       # Session pages
│   └── globals.css     # Global styles
├── components/         # React components
│   ├── layout.tsx      # Main layout
│   └── sidebar.tsx     # Navigation sidebar
└── lib/               # Utilities
    ├── prisma.ts      # Prisma client
    └── utils.ts       # Helper functions
```

## API Endpoints

- `GET /api/locations` - Get all locations
- `POST /api/sessions` - Create new session
- `GET /api/sessions/[id]` - Get session details
- `POST /api/counts` - Submit count data

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue in the repository.