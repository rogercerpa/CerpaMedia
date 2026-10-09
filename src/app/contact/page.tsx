import { getSeoMeta } from "@/lib/seo";
import type { Metadata } from "next";
import ContactPageClient from "./ContactPageClient";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoMeta("/contact");
  
  // Only override if there's a DB value, otherwise use layout default
  if (!seo.title && !seo.description) {
    return {};
  }
  
  const metadata: Metadata = {};
  if (seo.title) metadata.title = seo.title;
  if (seo.description) metadata.description = seo.description;
  if (seo.ogImageUrl) {
    metadata.openGraph = { images: [seo.ogImageUrl] };
  }
  
  return metadata;
}

export default function ContactPage() {
  return <ContactPageClient />;
}
