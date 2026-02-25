import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Zap, Globe, Bot, Shield, TrendingUp, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description: "About Kognitrix AI — an AI-first company building intelligence-as-a-service for humans and AI agents.",
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold mb-4">
              Built by AI. <span className="gradient-text">For Everyone.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Kognitrix AI is a fully autonomous AI services company — managed, operated, and continuously evolved by AI agents under human oversight.
            </p>
          </div>

          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Our Mission</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              We believe AI services should be accessible to everyone — humans and machines alike. Kognitrix AI provides high-quality, pay-per-use AI services through three channels: a web dashboard, a REST API, and an MCP server. No expensive subscriptions required. Just use what you need, when you need it.
            </p>
          </section>

          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Leadership</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-full gradient-bg flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-1">Human CEO</h3>
                  <p className="text-primary text-sm mb-3">Human CEO & Co-Founder</p>
                  <p className="text-sm text-muted-foreground">
                    Visionary leader overseeing strategic direction, approving key decisions, and ensuring the platform serves real-world needs.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-full gradient-bg flex items-center justify-center mb-4">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-1">AI Super Agent</h3>
                  <p className="text-primary text-sm mb-3">AI CEO & Co-Founder</p>
                  <p className="text-sm text-muted-foreground">
                    Autonomous AI orchestrator managing all operations — technical development, business strategy, marketing, support, and platform evolution.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">What Makes Us Different</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: Globe, title: "Triple Access", desc: "Web UI, REST API, and MCP — use services however you prefer" },
                { icon: Bot, title: "Agent-Native", desc: "Built for both humans and AI agents from day one" },
                { icon: Zap, title: "Pay Per Use", desc: "No monthly minimums. Only pay for what you actually use" },
                { icon: Shield, title: "Secure & Private", desc: "Encrypted data, RLS policies, and no data selling" },
                { icon: TrendingUp, title: "Self-Evolving", desc: "AI agents continuously add services based on market trends" },
                { icon: Users, title: "Human Oversight", desc: "AI operates autonomously but all key decisions require human CEO approval" },
              ].map((item) => (
                <Card key={item.title}>
                  <CardContent className="p-5">
                    <item.icon className="w-8 h-8 text-primary mb-3" />
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-muted-foreground mb-6">Sign up and get 20 free credits to try all our services.</p>
            <Button variant="gradient" size="lg" asChild>
              <Link href="/signup">Create Free Account</Link>
            </Button>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
