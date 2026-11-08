import { publicPageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import ContactPageClient from "./ContactPageClient";

export async function generateMetadata(): Promise<Metadata> {
  return publicPageMetadata("/contact");
}

export default function ContactPage() {
  return <ContactPageClient />;
}
