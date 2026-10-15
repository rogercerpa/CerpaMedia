import type { CSSProperties } from "react";

export const FONT = "Arial, Helvetica, sans-serif";
export const MONO = "Consolas, 'Courier New', monospace";

export const COLOR = {
  bg: "#F5F5F5",
  surface: "#FFFFFF",
  footer: "#FAFAFA",
  text: "#0A0A0A",
  muted: "#525252",
  border: "#E5E5E5",
  ink: "#0A0A0A",
  inverse: "#FFFFFF",
} as const;

export const SITE_URL = "https://cerpamedia.com";
export const FOOTER_ADDRESS = "CerpaMedia LLC, Woodstock, GA";

export function textStyle(overrides: CSSProperties = {}): CSSProperties {
  return {
    fontFamily: FONT,
    ...overrides,
  };
}

export const RESPONSIVE_CSS = `
  a.stack-btn, a.stack-btn span {
    color: #FFFFFF !important;
    text-decoration: none !important;
  }
  @media only screen and (max-width: 620px) {
    .email-pad {
      padding-top: 24px !important;
      padding-bottom: 24px !important;
      padding-left: 20px !important;
      padding-right: 20px !important;
    }
    a.stack-btn {
      display: block !important;
      width: 100% !important;
      text-align: center !important;
      box-sizing: border-box !important;
    }
  }
`;
