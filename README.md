# CerpaMedia - Small Business Technology Services

A professional marketing website for CerpaMedia, built with Next.js 15, TypeScript, and Tailwind CSS.

## Overview

CerpaMedia helps small businesses integrate and use technology to operate more efficiently. This site showcases our services and provides a contact form for inquiries.

## Features

- **Modern Stack**: Built with Next.js 15 App Router, TypeScript, and Tailwind CSS
- **Responsive Design**: Mobile-first design that works seamlessly across all devices
- **Contact Form**: Working contact form with email delivery via Resend API
- **Clean UI**: Professional design focused on clarity and usability
- **SEO Ready**: Proper meta tags and semantic HTML

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Set up environment variables (see below)

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Required for contact form to work
RESEND_API_KEY=your_resend_api_key_here

# Optional - defaults shown below
CONTACT_TO_EMAIL=cerpamedia@gmail.com
CONTACT_FROM_EMAIL=onboarding@resend.dev
```

**Important**: 
- The contact form will show an error message to users if `RESEND_API_KEY` is not configured
- Get your Resend API key from [resend.com](https://resend.com)
- `CONTACT_FROM_EMAIL` must be a verified domain in your Resend account or use the default `onboarding@resend.dev` for testing

### Running Locally

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard (Settings → Environment Variables)
4. Deploy

### Other Platforms

This is a standard Next.js application and can be deployed to any platform that supports Next.js:

- Netlify
- AWS Amplify
- DigitalOcean App Platform
- Self-hosted with Node.js

Make sure to:
1. Run `npm run build` to create the production build
2. Set all required environment variables
3. Serve the application with `npm start`

## Site Structure

- **Home** (`/`) - Primary offer and service overview
- **Services** (`/services`) - Detailed service descriptions
- **Contact** (`/contact`) - Contact form and email

## Services Offered

- Web Development
- Web Applications
- Mobile Apps
- AI System Integration
- AI Consulting
- Automation Consulting
- Business Process Improvement & Automation

## Contact

For inquiries, visit the contact page or email directly at [cerpamedia@gmail.com](mailto:cerpamedia@gmail.com)

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Email**: Resend API
- **Deployment**: Vercel-ready

## License

Private - All rights reserved
