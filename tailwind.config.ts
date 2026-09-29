import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#FFFFFF',
        'bg-subtle': '#F5F5F5',
        surface: '#FFFFFF',
        text: '#0A0A0A',
        'text-muted': '#525252',
        border: '#E5E5E5',
        cta: '#0A0A0A',
        'cta-text': '#FFFFFF',
        'cta-hover': '#262626',
        charcoal: '#171717',
      },
    },
  },
  plugins: [],
};
export default config;
