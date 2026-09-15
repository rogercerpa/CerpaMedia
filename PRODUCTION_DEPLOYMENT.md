# CerpaMedia Production Deployment Guide

## Current Status

### ✅ Main Branch
- **Status**: Marketing site successfully merged
- **Merge Commit**: `4a61ce3a91310359e485ed4e88633c235b3c30c9`
- **Merged At**: 2026-09-15 18:32:39 UTC
- **Verification**: https://github.com/rogercerpa/CerpaMedia/tree/main

### ⚠️ Vercel Deployment
**Current Deployment**: https://temporary-rushing-neon-1eomve5.vercel.app
- Status: Temporary (expires ~35 minutes from 6:32 PM UTC)
- Branch: main
- Deployment ID: `dpl_HqQnNKKnuf4YyK9PZqhLnkHFPAtR`

**Blocker**: Permanent production deployment requires Vercel account authentication that Cloud Agent cannot complete.

## Make This Deployment Permanent

### Option 1: Claim This Deployment (Fastest - 2 minutes)

**Claim URL**: https://vercel.com/claim-deployment?code=28492d91-0103-4d65-b057-cf253f8b15ac

Steps:
1. Click the claim URL above
2. Log in with Vercel account (or create one - it's free)
3. The deployment becomes permanent immediately
4. You get a stable production URL (won't expire)
5. Add environment variables in Vercel dashboard if needed

**This converts the existing deployment to permanent - no rebuild needed.**

### Option 2: Import Repository (Recommended for Long-Term)

Visit: https://vercel.com/new

Steps:
1. Click "Import Git Repository"
2. Select: `rogercerpa/CerpaMedia`
3. Configure:
   - Framework: Next.js (auto-detected)
   - Root Directory: `./`
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
4. Add environment variables (optional, see below)
5. Click "Deploy"

**Result**: 
- Automatic production deployment from main branch
- Auto-deploys on every push to main
- Preview deployments for PRs
- Stable production URL

## Environment Variables (Optional - For Contact Form)

Add these in Vercel dashboard under Settings → Environment Variables:

**Required for contact form email delivery:**
```
RESEND_API_KEY=<your-resend-api-key>
```

**Optional (have defaults):**
```
CONTACT_TO_EMAIL=cerpamedia@gmail.com
CONTACT_FROM_EMAIL=onboarding@resend.dev
```

### Getting Resend API Key

1. Sign up at https://resend.com (free tier available)
2. Verify your domain (or use `onboarding@resend.dev` for testing)
3. Go to API Keys → Create API Key
4. Copy the key and add to Vercel

**Without API Key**: Contact form will show friendly error directing users to email cerpamedia@gmail.com directly.

## Production URLs

After completing Option 1 or 2, you'll get a permanent URL like:
- `https://cerpa-media-{random}.vercel.app` (Option 1 - claim)
- `https://cerpamedia.vercel.app` (Option 2 - import, if name available)

You can also add a custom domain (cerpamedia.com) in Vercel dashboard under Settings → Domains.

## Verification

Once permanent deployment is live:
- ✅ Home: `<your-url>/`
- ✅ Services: `<your-url>/services`
- ✅ Contact: `<your-url>/contact`
- ✅ Email delivery: Works when RESEND_API_KEY is set

## Support

Vercel Free Tier Includes:
- Unlimited deployments
- Automatic HTTPS
- Global CDN
- Preview deployments
- 100 GB bandwidth/month

For issues: https://vercel.com/support
