import { buildMetadata } from "@/lib/seo";
import ContactPageClient from "./ContactPageClient";

export async function generateMetadata() {
  return buildMetadata("/contact");
}

export default function ContactPage() {
  return <ContactPageClient />;
}
