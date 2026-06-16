import type { Metadata } from "next";
import { ContentPage } from "@/components/commerce/content-page";

export const metadata: Metadata = {
  title: "FAQ"
};

export default function FaqPage() {
  return <ContentPage contentKey="faq" />;
}
