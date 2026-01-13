# Open-QR Platform

A self-hosted, open-source dynamic QR code management system. Create a single QR code that remains the same physically, but the destination URL can be changed at any time via a dashboard.

## Features

- 🔄 **Dynamic Redirects**: Change QR code destinations without reprinting
- 🎨 **Customizable QR Codes**: Customize dots, corners, colors, and add logos
- 🔐 **Secure Authentication**: Email/password auth via Supabase
- 📊 **Analytics**: Track scan counts for each QR code
- 🚀 **Fast Redirects**: Optimized redirect engine with async scan tracking
- 📱 **Responsive Design**: Works on all devices

## Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Database & Auth**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS + Shadcn UI
- **QR Generation**: qr-code-styling (Client-side)
- **Package Manager**: pnpm

## Prerequisites

- Node.js 20.11.0+ (LTS recommended)
- pnpm 9.0.0+
- Supabase account

## Setup Instructions

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and execute the schema from `MANUAL_SETUP_GUIDE.md` (Step 10)
3. Create a storage bucket named `qr-logos` (see `MANUAL_SETUP_GUIDE.md` Step 11)
4. Get your Supabase credentials from Settings → API

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

Or create a `.env.local` file manually with your Supabase credentials:

```env
# Get these from Supabase Dashboard → Settings → API
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 4. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
dynaqr/
├── app/
│   ├── (auth)/          # Authentication pages
│   ├── (dashboard)/     # Dashboard pages
│   ├── r/[slug]/        # Redirect engine
│   └── layout.tsx       # Root layout
├── components/
│   ├── auth/            # Auth components
│   ├── dashboard/       # Dashboard components
│   ├── qr/              # QR code components
│   └── ui/              # Shadcn UI components
├── lib/
│   ├── hooks/           # React hooks
│   ├── supabase/        # Supabase clients
│   └── utils/           # Utility functions
└── types/               # TypeScript types
```

## Usage

1. **Sign Up**: Create an account at `/auth/signup`
2. **Create Link**: Go to Dashboard → Links → Create New Link
3. **Customize QR**: Edit QR code appearance in QR Editor
4. **Share**: Use the generated QR code URL (`/r/your-slug`)
5. **Update**: Change the destination URL anytime without changing the QR code

## Security

- All packages are up-to-date with security patches
- Next.js 15.1.2+ (fixes CVE-2025-55182, CVE-2025-66478)
- React 19.2.1+ (RSC security patches)
- Row Level Security (RLS) enabled on all tables
- Input validation with Zod
- Secure file uploads with size/type validation

## Deployment

### Vercel (Recommended)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Deploy to Vercel:**
   - Visit [vercel.com](https://vercel.com) and sign in
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Configure project settings (auto-detected for Next.js)

3. **Add Environment Variables in Vercel:**
   - Go to Project Settings → Environment Variables
   - Add each variable for **Production**, **Preview**, and **Development**:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `NEXT_PUBLIC_APP_URL` (add after first deployment with your Vercel URL)

4. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live!

5. **Configure Supabase Auth:**
   - Update Supabase Auth → URL Configuration
   - Add your Vercel URL to Site URL and Redirect URLs
   - Update `NEXT_PUBLIC_APP_URL` in Vercel with your actual deployment URL

**Detailed instructions:** See `MANUAL_SETUP_GUIDE.md` Steps 5-7 for complete Vercel deployment guide.

## Manual Setup

For detailed manual setup instructions including Supabase schema, storage configuration, and security checks, see `MANUAL_SETUP_GUIDE.md`.

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please open an issue on GitHub.