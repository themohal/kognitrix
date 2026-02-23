import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Kognitrix AI Privacy Policy — how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: February 2026</p>

        <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">1. Information We Collect</h2>
            <p><strong>Account Information:</strong> Email address, full name, company name (optional), and authentication data when you sign up.</p>
            <p><strong>Usage Data:</strong> API calls, service usage, credit consumption, timestamps, IP addresses, and request metadata.</p>
            <p><strong>Payment Data:</strong> Processed by Lemon Squeezy. We store transaction IDs and credit amounts but never your payment card details.</p>
            <p><strong>Technical Data:</strong> Browser type, device info, and cookies for authentication purposes.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">2. How We Use Your Data</h2>
            <p>We use your data to: (a) provide and improve our AI services; (b) process payments and manage credits; (c) track usage for billing and analytics; (d) communicate service updates; (e) prevent fraud and abuse; (f) comply with legal obligations.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">3. Data Storage & Security</h2>
            <p>Your data is stored in Supabase (PostgreSQL) with encryption at rest. We use Row Level Security (RLS) policies to ensure users can only access their own data. All connections are encrypted via TLS/SSL.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">4. AI Content Processing</h2>
            <p>When you use our AI services, your input prompts are sent to OpenAI for processing. We do not store the full content of your requests beyond sanitized metadata for usage tracking. OpenAI&apos;s data policies apply to content processed through their API.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">5. Data Sharing</h2>
            <p>We do NOT sell your personal data to third parties. We share data only with: (a) Supabase (database hosting); (b) OpenAI (AI processing); (c) Lemon Squeezy (payment processing); (d) Vercel (hosting); (e) law enforcement when legally required.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">6. Cookies</h2>
            <p>We use essential cookies only for authentication and session management. We do not use tracking cookies, advertising cookies, or third-party analytics cookies.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">7. Your Rights</h2>
            <p>You have the right to: (a) access your personal data; (b) correct inaccurate data; (c) request deletion of your data; (d) export your data; (e) object to processing; (f) withdraw consent at any time. To exercise these rights, contact support@kognitrix.ai.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">8. GDPR & CCPA Compliance</h2>
            <p>We process data in compliance with GDPR (for EU users) and CCPA (for California users). We act as a data controller for account information and a data processor for AI-generated content.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">9. Data Retention</h2>
            <p>Account data is retained while your account is active. Usage logs are retained for 12 months. Transaction records are retained for 7 years for tax and legal purposes. You may request earlier deletion of non-essential data.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">10. Changes to This Policy</h2>
            <p>We may update this Privacy Policy periodically. Material changes will be notified via email. Continued use of the Platform after changes constitutes acceptance.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">11. Contact</h2>
            <p>For privacy-related inquiries, contact us at privacy@kognitrix.ai.</p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
