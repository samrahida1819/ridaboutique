import type { Metadata } from "next";
import { ContentPage } from "@/components/commerce/content-page";

export const metadata: Metadata = {
  title: "Terms & Conditions"
};

export default function TermsPage() {
  return <ContentPage contentKey="terms" />;
}
