# Flo Hiv Tool Setup Guide

## 1. Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be ready
3. Go to Settings > API
4. Copy your Project URL and anon/public key

## 2. Environment Variables

1. Create a `.env.local` file in your project root
2. Add your Supabase credentials:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

## 3. Database Setup

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the sidebar
3. Run the SQL script from `scripts/01-create-tables-fixed.sql`
4. Run the SQL script from `scripts/02-insert-sample-data.sql`

## 4. Authentication Setup

1. In Supabase dashboard, go to Authentication > Settings
2. Add your domain to "Site URL" (e.g., http://localhost:3000)
3. Enable Google OAuth provider:
   - Go to Authentication > Providers
   - Enable Google
   - Add your Google OAuth credentials

## 5. Run the Application

\`\`\`bash
npm install
npm run dev
\`\`\`

## 6. Admin Access

The first user with email "admin@example.com" will be automatically approved as admin.
Other users will need manual approval.

## Troubleshooting

- If you get permission errors, make sure RLS policies are set correctly
- If authentication doesn't work, check your Site URL in Supabase settings
- If tables don't exist, run the SQL scripts again
