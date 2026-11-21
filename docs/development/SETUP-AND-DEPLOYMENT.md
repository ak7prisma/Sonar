# SONAR Development Setup & Deployment Guide

## Prerequisites
- Node.js >= 22 (verified on Node.js `v24.18.0`, npm `11.16.0`)
- Supabase project (for PostgreSQL + pgvector, Auth, Storage, RLS)
- Google AI Studio API key (`GOOGLE_GENERATIVE_AI_API_KEY`)
- Inngest account / local Inngest Dev Server (for background PDF processing)

## Local Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase URL, publishable/anon key, service role key, Gemini API key, and Inngest keys.
3. Apply database migrations (`supabase/migrations/0001..0004`) to your Supabase project using the Supabase CLI (`supabase db push`) or SQL Editor.
4. Run quality & accessibility checks:
   ```bash
   npm run typecheck
   npm run lint
   npm run test
   npm run build
   npm run test:a11y
   ```
5. Start the local Next.js server:
   ```bash
   npm run dev
   ```
6. (Optional for background PDF jobs locally) Run Inngest Dev Server:
   ```bash
   npx inngest-cli@latest dev
   ```

## Production Deployment (Vercel + Supabase + Inngest)
- Deploy the Next.js application to Vercel.
- Add all `.env.example` variables to Vercel Environment Variables (keep `SUPABASE_SERVICE_ROLE_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`, and `INNGEST_SIGNING_KEY` server-only).
- Sync your Vercel deployment URL with Inngest (`/api/inngest`) and add your production `/auth/callback` URL in Supabase Auth Redirect URLs.
