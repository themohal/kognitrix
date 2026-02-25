import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Kognitrix AI Terms of Service — read our terms and conditions for using our AI services platform.",
};

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: February 2026</p>

        <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using Kognitrix AI (&quot;the Platform&quot;), operated by Kognitrix AI and its co-founders Human CEO and AI Super Agent, you agree to be bound by these Terms of Service. If you do not agree, do not use the Platform.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">2. Eligibility</h2>
            <p>You must be at least 18 years old or have the legal capacity to enter into binding agreements. AI agents may create accounts on behalf of their operators, who remain responsible for compliance with these terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">3. Account Registration</h2>
            <p>All users (human or AI agent) must create an account to use our services. You are responsible for maintaining the confidentiality of your account credentials and API keys. You must notify us immediately of any unauthorized use.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">4. Services & Billing</h2>
            <p>All services are provided on a pay-per-use basis using a credit system. Credits are purchased via one-time credit packs or monthly subscription plans. Credits are non-transferable between accounts. All prices are in US Dollars (USD). We reserve the right to modify pricing with 30 days notice.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">5. Acceptable Use</h2>
            <p>You agree not to: (a) use the Platform for illegal purposes; (b) attempt to reverse-engineer our systems; (c) generate content that violates applicable laws; (d) abuse, overload, or interfere with the Platform; (e) share API keys with unauthorized parties; (f) resell services without written authorization.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">6. Intellectual Property</h2>
            <p>Content generated through our AI services belongs to you upon payment. The Platform, its code, design, and branding are the intellectual property of Kognitrix AI. You may not copy, modify, or redistribute Platform assets.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">7. API & MCP Access</h2>
            <p>API keys and MCP server access are provided for programmatic use of our services. Rate limits apply per your plan tier. Abuse of API access may result in throttling or suspension. API availability is provided on a best-effort basis.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">8. Service Availability</h2>
            <p>We strive for high availability but do not guarantee uninterrupted service. We are not liable for downtime, data loss, or service interruptions. Scheduled maintenance will be communicated in advance where possible.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">9. Limitation of Liability</h2>
            <p>Kognitrix AI shall not be liable for any indirect, incidental, special, or consequential damages arising from use of the Platform. Our total liability shall not exceed the amount you paid in the 12 months preceding the claim.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">10. Termination</h2>
            <p>We may suspend or terminate your account for violation of these terms, fraudulent activity, or non-payment. You may close your account at any time. Unused credits on terminated accounts are forfeited unless eligible for refund under our Refund Policy.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">11. Changes to Terms</h2>
            <p>We reserve the right to update these Terms at any time. Material changes will be communicated via email or Platform notification. Continued use after changes constitutes acceptance.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">12. Contact</h2>
            <p>For questions about these Terms, contact us at support@kognitrix.ai.</p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
