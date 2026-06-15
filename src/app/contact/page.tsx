import type { Metadata } from "next";
import { ContactDetailsClient } from "@/components/commerce/contact-details-client";
import { SectionHeading } from "@/components/commerce/section-heading";
import { ContactForm } from "@/components/forms/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Rida Boutique for order support, custom requests, returns, WhatsApp chat, and FAQ."
};

const faq = [
  ["Do you deliver outside Kashmir?", "Rida Boutique is Kashmir-only for now."],
  ["Can I pay for custom products directly?", "Custom requests are reviewed first. Admin approves pricing, then you complete payment."],
  ["Who can leave reviews?", "Only verified buyers can review, and reviews are published after admin approval."],
  ["Which payments are supported?", "Razorpay supports UPI, debit cards, credit cards, net banking, and wallets."]
];

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-brand-ivory pt-32 md:pt-40">
      <section className="luxury-container grid gap-6 pb-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10 md:pb-20">
        <div>
          <SectionHeading
            description="Order support, custom order help, returns, collaborations, and WhatsApp assistance."
            eyebrow="Contact"
            title="Boutique support, without the clutter."
          />
          <ContactDetailsClient />
        </div>
        <ContactForm />
      </section>

      <section className="bg-white py-10 md:py-12">
        <div className="luxury-container">
          <SectionHeading
            description="A concise set of answers for purchase confidence and order support."
            eyebrow="FAQ"
            title="Common questions."
          />
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {faq.map(([question, answer]) => (
              <article className="rounded-2xl border border-brand-green/10 bg-brand-ivory p-6" key={question}>
                <h2 className="font-serif text-2xl text-brand-green sm:text-3xl">{question}</h2>
                <p className="mt-3 text-sm leading-7 text-brand-charcoal/65">{answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
