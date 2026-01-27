# Supabase Setup Guide

This guide will help you set up a free Supabase PostgreSQL database for your job tracker application.

## Step 1: Create a Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" (it's free)
3. Sign up with GitHub or email

## Step 2: Create a New Project

1. Click "New project"
2. Enter project details:
   - **Name**: `job-tracker` (or any name you prefer)
   - **Database Password**: Generate a strong password and save it
   - **Region**: Choose the closest region to you
3. Click "Create new project" (takes ~2 minutes to set up)

## Step 3: Get Your Database Connection String

1. Once your project is created, go to **Settings** (gear icon in sidebar)
2. Click **Database** in the settings menu
3. Scroll down to **Connection string**
4. Select **URI** tab
5. Copy the connection string (it looks like this):
   ```
   postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```

## Step 4: Configure Your Environment

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your database URL:
   ```
   DATABASE_URL="postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
   ```
   
   **Important**: 
   - Replace `[YOUR-PASSWORD]` with the password you created
   - Add `?pgbouncer=true&connection_limit=1` at the end for serverless compatibility

## Step 5: Run Database Migration

1. First, reset your Prisma client:
   ```bash
   rm -rf node_modules/.prisma
   rm -rf prisma/migrations
   ```

2. Generate a new migration for PostgreSQL:
   ```bash
   npx prisma migrate dev --name init
   ```

3. This will:
   - Create the database tables in Supabase
   - Generate the Prisma client for PostgreSQL

## Step 6: Verify Setup

1. Run the development server:
   ```bash
   npm run dev
   ```

2. Visit [http://localhost:3000](http://localhost:3000)
3. Try adding a job to verify the database connection works

## Deployment to Vercel

When deploying to Vercel:

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add the `DATABASE_URL` with your Supabase connection string
4. Deploy your application

## Free Tier Limits

Supabase's free tier includes:
- 500 MB database space
- 50,000 monthly active users
- 2 GB bandwidth
- 500 MB file storage

This is more than enough for a personal job tracker!

## Troubleshooting

### Connection Issues
- Make sure you're using the **pooler** connection string (port 6543)
- Add `?pgbouncer=true&connection_limit=1` to the connection string
- Check that your password doesn't contain special characters that need URL encoding

### Migration Issues
- If migrations fail, try deleting `prisma/migrations` folder and running again
- Ensure your Supabase project is fully initialized (can take 2-3 minutes after creation)

## Optional: Supabase Client Features

If you want to use Supabase's real-time features or authentication in the future:

1. Get your API keys from Supabase dashboard:
   - Go to **Settings** > **API**
   - Copy the **Project URL** and **anon public** key

2. Add to `.env`:
   ```
   NEXT_PUBLIC_SUPABASE_URL="your-project-url"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
   ```