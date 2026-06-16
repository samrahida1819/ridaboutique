import type { Metadata } from "next";
import { ContentPage } from "@/components/commerce/content-page";

export const metadata: Metadata = {
  title: "Privacy Policy"
};

export default function PrivacyPolicyPage() {
  return <ContentPage contentKey="privacy" />;
}
