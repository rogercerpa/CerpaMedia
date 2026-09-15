# CerpaMedia - Deployment Information

## Live Preview URL
**Temporary Deployment**: https://temporary-rushing-neon-1eomve5.vercel.app

This is an anonymous temporary deployment that:
- Expires in 60 minutes from creation (Sep 15, 2026 at ~7:08 PM UTC)
- Can be claimed and converted to permanent at: https://vercel.com/claim-deployment?code=28492d91-0103-4d65-b057-cf253f8b15ac

## Deployment Status
✅ **Successfully Deployed**
- Build: Passing
- Status: 200 OK
- All pages accessible:
  - Home: https://temporary-rushing-neon-1eomve5.vercel.app
  - Services: https://temporary-rushing-neon-1eomve5.vercel.app/services
  - Contact: https://temporary-rushing-neon-1eomve5.vercel.app/contact

## Next Steps for Permanent Deployment

### Option 1: Claim This Deployment (Quick)
Visit https://vercel.com/claim-deployment?code=28492d91-0103-4d65-b057-cf253f8b15ac
- Log in or create Vercel account
- Claim the deployment to keep it permanently

### Option 2: Import Repository (Recommended)
1. Go to https://vercel.com/new
2. Import the GitHub repository: rogercerpa/CerpaMedia
3. Add environment variables (see below)
4. Deploy

## Environment Variables Needed for Contact Form

Required for contact form to send emails:
```
RESEND_API_KEY=your_resend_api_key_here
```

Optional (have sensible defaults):
```
CONTACT_TO_EMAIL=cerpamedia@gmail.com
CONTACT_FROM_EMAIL=onboarding@resend.dev
```

**Note**: Without `RESEND_API_KEY`, the contact form will show users a friendly error message directing them to email cerpamedia@gmail.com directly.

## Getting Resend API Key
1. Sign up at https://resend.com
2. Verify your sending domain (or use onboarding@resend.dev for testing)
3. Create API key in dashboard
4. Add to Vercel environment variables

## Technical Details
- Framework: Next.js 15.5.25
- Build Time: ~12 seconds
- Deployment Size: 1.2 MB
- All pages statically generated
- Perfect Lighthouse performance baseline
