import { ImageResponse } from "next/og";
import { OgCard, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og-card";

export const alt = "CerpaMedia — technology for business owners";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <OgCard
        title="Technology for business owners"
        detail="Web, AI, and automation. A clear plan first."
      />
    ),
    { ...size }
  );
}
