import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "Kognitrix AI Refund Policy — our refund terms for credit packs and subscriptions.",
};

export default function RefundPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-2">Refund Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: February 2026</p>

        <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">1. Credit Packs (One-Time Purchases)</h2>
            <p><strong>Full refund within 7 days</strong> of purchase if no credits have been used. If credits have been partially used, we will refund the unused portion minus a 10% processing fee. No refunds after 7 days or if all credits have been consumed.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">2. Monthly Subscriptions</h2>
            <p>You may cancel your subscription at any time. Cancellation takes effect at the end of the current billing period. <strong>No prorated refunds</strong> are provided for the remaining days in the current period. Monthly credits from subscriptions expire at the end of each billing cycle and do not roll over.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">3. Service Errors</h2>
            <p>If an AI service fails to produce a result due to a platform error (not user input error), credits will be <strong>automatically refunded</strong> to your account. This applies to server errors (5xx), timeout errors, and processing failures. No refund is given for poor-quality results, as AI output quality depends on input quality.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">4. Free Trial Credits</h2>
            <p>The 20 free credits provided on signup are non-refundable and have no cash value. They cannot be transferred or exchanged.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">5. How to Request a Refund</h2>
            <p>To request a refund, submit a support ticket from your dashboard or email support@kognitrix.ai with your account email and order ID. Refund requests are processed within 5 business days. Approved refunds are returned to the original payment method via Lemon Squeezy.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">6. Disputes</h2>
            <p>If you dispute a charge, please contact us first at support@kognitrix.ai. We aim to resolve all disputes within 5 business days. Filing a chargeback without contacting us first may result in account suspension.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">7. Changes to This Policy</h2>
            <p>We reserve the right to update this Refund Policy. Changes will be communicated via email or Platform notification.</p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
