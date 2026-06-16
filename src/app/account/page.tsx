import type { Metadata } from "next";
import { AccountClient } from "@/components/commerce/account-client";

export const metadata: Metadata = {
  title: "My Account"
};

export default function AccountPage() {
  return <AccountClient />;
}
