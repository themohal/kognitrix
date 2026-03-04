"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
  AnimatedCounter,
  HoverTilt,
  SpotlightCard,
  FloatingParticles,
  GradientLine,
  TextReveal,
  ScaleHover,
} from "@/components/ui/animations";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, FileText, Code, FileSearch, ImageIcon, Database, Languages, Search, Mail,
  ArrowRight, Globe, Terminal, Plug, Check, ChevronDown, Sparkles,
  CreditCard, BarChart3, Shield, Bot, Cpu, Activity,
} from "lucide-react";

const services = [
  { icon: FileText, name: "AI Content Generator", desc: "Blog posts, articles, social media, marketing copy", credits: 5 },
  { icon: Code, name: "AI Code Assistant", desc: "Code generation, debugging, refactoring, review", credits: 8 },
  { icon: FileSearch, name: "AI Document Analyzer", desc: "Summarize, extract, analyze documents & contracts", credits: 6 },
  { icon: ImageIcon, name: "AI Image Generator", desc: "DALL-E powered image creation for marketing & design", credits: 10 },
  { icon: Database, name: "AI Data Extractor", desc: "Structured data extraction from unstructured text", credits: 4 },
  { icon: Languages, name: "AI Translator", desc: "Multi-language translation with context awareness", credits: 3 },
  { icon: Search, name: "AI SEO Optimizer", desc: "SEO audit, keywords, meta tags, content optimization", credits: 7 },
  { icon: Mail, name: "AI Email Writer", desc: "Sales emails, cold outreach, follow-ups, campaigns", credits: 5 },
];

const faqs = [
  { q: "Who can use Kognitrix AI?", a: "Anyone — human developers, businesses, and AI agents. All customers get access to the Web dashboard, REST API, and MCP server." },
  { q: "Do I need a subscription?", a: "No. You can buy one-time credit packs starting at $8 for 100 credits. Subscriptions are optional and give you monthly credit allowances at better rates." },
  { q: "How does MCP access work?", a: "AI agents (like Claude Code) can connect directly to our MCP server. Add our endpoint to your agent's MCP config, authenticate with your API key, and the agent can discover and use all services natively." },
  { q: "What happens if a service fails?", a: "Credits are automatically refunded for server errors. If a request fails due to our infrastructure, you won't be charged." },
  { q: "Can AI agents sign up and pay?", a: "Yes. AI agents can create accounts, purchase credits via our API, and consume services. We support agent-to-agent commerce." },
  { q: "What AI models power the services?", a: "We use OpenAI's GPT-4o for text services and DALL-E 3 for image generation. We continuously evaluate and upgrade to the best available models." },
];

// Typing animation hook
function useTypingEffect(texts: string[], typingSpeed = 50, deletingSpeed = 30, pauseTime = 2000) {
  const [displayText, setDisplayText] = useState("");
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentText = texts[textIndex];

    if (!isDeleting && charIndex < currentText.length) {
      const timer = setTimeout(() => setCharIndex((c) => c + 1), typingSpeed);
      return () => clearTimeout(timer);
    }

    if (!isDeleting && charIndex === currentText.length) {
      const timer = setTimeout(() => setIsDeleting(true), pauseTime);
      return () => clearTimeout(timer);
    }

    if (isDeleting && charIndex > 0) {
      const timer = setTimeout(() => setCharIndex((c) => c - 1), deletingSpeed);
      return () => clearTimeout(timer);
    }

    if (isDeleting && charIndex === 0) {
      setIsDeleting(false);
      setTextIndex((i) => (i + 1) % texts.length);
    }
  }, [charIndex, isDeleting, textIndex, texts, typingSpeed, deletingSpeed, pauseTime]);

  useEffect(() => {
    setDisplayText(texts[textIndex].slice(0, charIndex));
  }, [charIndex, textIndex, texts]);

  return displayText;
}

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const typedText = useTypingEffect([
    "for Humans & Agents",
    "for Developers",
    "for AI Agents",
    "for Businesses",
  ]);

  return (
    <>
      <Navbar />
      <main className="dark">
        {/* Hero */}
        <section className="relative pt-32 pb-24 overflow-hidden">
          {/* Grid background */}
          <div className="absolute inset-0 grid-bg" />
          {/* Animated gradient orbs */}
          <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-blue-500/8 rounded-full blur-[120px] aurora-orb" />
          <div className="absolute top-40 right-1/4 w-[400px] h-[400px] bg-indigo-500/8 rounded-full blur-[100px] aurora-orb-2" />
          <div className="absolute bottom-0 left-1/2 w-[600px] h-[300px] bg-violet-500/5 rounded-full blur-[150px] aurora-orb-3" />

          {/* Floating particles */}
          <FloatingParticles count={15} />

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <FadeIn delay={0.1}>
              <Badge variant="secondary" className="mb-6 mono text-xs border-primary/20 bg-primary/5">
                <span className="relative flex h-2 w-2 mr-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
                </span>
                System Online &mdash; 20 Free Credits on Signup
              </Badge>
            </FadeIn>

            <FadeIn delay={0.2}>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
                Intelligence-as-a-Service{" "}
                <br className="hidden sm:block" />
                <span className="text-shimmer">
                  {typedText}
                  <span className="typing-cursor ml-0.5" />
                </span>
              </h1>
            </FadeIn>

            <FadeIn delay={0.35}>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
                8 powerful AI services accessible via Web Dashboard, REST API, and MCP Server.
                {" "}Pay per use. No subscriptions required. Built for developers and AI agents alike.
              </p>
            </FadeIn>

            <FadeIn delay={0.5}>
              <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
                <ScaleHover>
                  <Button variant="gradient" size="xl" asChild>
                    <Link href="/signup">
                      <Bot className="w-5 h-5 mr-1" />
                      Get Started Free
                      <ArrowRight className="w-5 h-5 ml-1" />
                    </Link>
                  </Button>
                </ScaleHover>
                <ScaleHover>
                  <Button variant="outline" size="xl" asChild>
                    <Link href="/docs">
                      <Terminal className="w-5 h-5 mr-1.5" />
                      View API Docs
                    </Link>
                  </Button>
                </ScaleHover>
              </div>
            </FadeIn>

            {/* Access channels */}
            <FadeIn delay={0.65}>
              <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
                <motion.span className="flex items-center gap-2 mono" whileHover={{ scale: 1.05, y: -2 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}>
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-400 shadow-[0_0_6px_theme(colors.blue.400)]" />
                  </span>
                  <Globe className="w-4 h-4 text-blue-400" /> Web Dashboard
                </motion.span>
                <motion.span className="flex items-center gap-2 mono" whileHover={{ scale: 1.05, y: -2 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}>
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-400 shadow-[0_0_6px_theme(colors.indigo.400)]" />
                  </span>
                  <Terminal className="w-4 h-4 text-indigo-400" /> REST API
                </motion.span>
                <motion.span className="flex items-center gap-2 mono" whileHover={{ scale: 1.05, y: -2 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}>
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-violet-400 shadow-[0_0_6px_theme(colors.violet.400)]" />
                  </span>
                  <Plug className="w-4 h-4 text-violet-400" /> MCP Server
                </motion.span>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Terminal Preview */}
        <section className="py-8 -mt-8">
          <div className="max-w-3xl mx-auto px-4">
            <FadeIn>
              <HoverTilt tiltAmount={3}>
                <div className="glass rounded-xl overflow-hidden glow-sm hover:glow-md transition-shadow duration-500">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-border/30">
                    <motion.span
                      className="w-3 h-3 rounded-full bg-red-500/60"
                      whileHover={{ scale: 1.3, backgroundColor: "rgba(239, 68, 68, 0.9)" }}
                    />
                    <motion.span
                      className="w-3 h-3 rounded-full bg-yellow-500/60"
                      whileHover={{ scale: 1.3, backgroundColor: "rgba(234, 179, 8, 0.9)" }}
                    />
                    <motion.span
                      className="w-3 h-3 rounded-full bg-green-500/60"
                      whileHover={{ scale: 1.3, backgroundColor: "rgba(34, 197, 94, 0.9)" }}
                    />
                    <span className="text-xs text-muted-foreground mono ml-2">kognitrix-api</span>
                  </div>
                  <div className="p-5 mono text-sm space-y-2">
                    <div className="text-muted-foreground">
                      <span className="text-blue-400">$</span> curl -X POST https://kognitrix.com/api/v1/generate/content \
                    </div>
                    <div className="text-muted-foreground pl-4">
                      -H &quot;Authorization: Bearer kgx_live_...&quot; \
                    </div>
                    <div className="text-muted-foreground pl-4">
                      -d &apos;{`{"prompt": "Write a product launch email", "tone": "professional"}`}&apos;
                    </div>
                    <div className="mt-3 pt-3 border-t border-border/20">
                      <span className="text-indigo-400">{"{"}</span>
                      <span className="text-foreground/80"> &quot;success&quot;: </span>
                      <span className="text-violet-400">true</span>
                      <span className="text-foreground/80">, &quot;credits_used&quot;: </span>
                      <span className="text-blue-400">5</span>
                      <span className="text-foreground/80">, &quot;credits_remaining&quot;: </span>
                      <span className="text-blue-400">45</span>
                      <span className="text-indigo-400"> {"}"}</span>
                    </div>
                  </div>
                </div>
              </HoverTilt>
            </FadeIn>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="border-y border-border/30 glass py-10 mt-8">
          <StaggerContainer staggerDelay={0.15} className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { val: "20", label: "Free credits on signup", suffix: "" },
              { val: "8", label: "AI services", suffix: "" },
              { val: "3", label: "Access channels", suffix: "" },
              { val: "60", label: "Cost savings vs direct API", suffix: "%+" },
            ].map((s) => (
              <StaggerItem key={s.label}>
                <motion.div
                  whileHover={{ scale: 1.05, y: -3 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  <div className="text-3xl font-bold gradient-text mono">
                    <AnimatedCounter value={parseInt(s.val)} />{s.suffix}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

        {/* Services */}
        <section className="py-24 relative">
          <div className="absolute inset-0 grid-bg opacity-30" />
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeIn className="text-center mb-14">
              <Badge variant="secondary" className="mb-4 mono text-xs border-primary/20 bg-primary/5">
                <Cpu className="w-3 h-3 mr-1.5" /> Services
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-3">Powerful AI Services</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">Every service works via Web, API, and MCP. Same quality, same pricing.</p>
            </FadeIn>
            <StaggerContainer staggerDelay={0.08} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((s) => (
                <StaggerItem key={s.name}>
                  <SpotlightCard>
                    <Card className="group hover:border-primary/40 neon-border hover-lift h-full">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <motion.div
                            className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:glow-sm transition-all"
                            whileHover={{ rotate: 5, scale: 1.1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 15 }}
                          >
                            <s.icon className="w-5 h-5 text-primary" />
                          </motion.div>
                          <Badge variant="outline" className="text-xs mono border-primary/20">{s.credits} credits</Badge>
                        </div>
                        <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">{s.name}</h3>
                        <p className="text-sm text-muted-foreground">{s.desc}</p>
                      </CardContent>
                    </Card>
                  </SpotlightCard>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* How it Works */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 glass" />
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeIn className="text-center mb-14">
              <Badge variant="secondary" className="mb-4 mono text-xs border-primary/20 bg-primary/5">
                <Zap className="w-3 h-3 mr-1.5" /> Workflow
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground">Three steps. Three access channels. Unlimited possibilities.</p>
            </FadeIn>
            <StaggerContainer staggerDelay={0.15} className="grid md:grid-cols-3 gap-8">
              {[
                { step: "01", icon: CreditCard, title: "Sign Up & Get Credits", desc: "Create a free account, get 20 credits instantly. Buy more credits or subscribe anytime." },
                { step: "02", icon: Zap, title: "Choose Your Channel", desc: "Use services via the web dashboard, call our REST API from code, or connect via MCP from your AI agent." },
                { step: "03", icon: BarChart3, title: "Get Results & Scale", desc: "Receive high-quality AI outputs. Track usage, monitor costs, and scale with your needs." },
              ].map((s) => (
                <StaggerItem key={s.step} className="text-center group">
                  <motion.div
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  >
                    <div className="text-5xl font-bold text-primary/15 mb-4 mono">{s.step}</div>
                    <motion.div
                      className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4 group-hover:glow-sm transition-all"
                      whileHover={{ rotate: 10, scale: 1.1 }}
                    >
                      <s.icon className="w-7 h-7 text-primary" />
                    </motion.div>
                    <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                    <p className="text-sm text-muted-foreground">{s.desc}</p>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-24 relative">
          <div className="absolute inset-0 grid-bg opacity-20" />
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeIn className="text-center mb-14">
              <Badge variant="secondary" className="mb-4 mono text-xs border-primary/20 bg-primary/5">
                <CreditCard className="w-3 h-3 mr-1.5" /> Pricing
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-3">Simple, Transparent Pricing</h2>
              <p className="text-muted-foreground">Start free. Pay as you grow. No hidden fees.</p>
            </FadeIn>
            <StaggerContainer staggerDelay={0.12} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {[
                { name: "Free Trial", price: "$0", credits: "20 credits", features: ["All 8 services", "Web + API + MCP", "5 req/min"], popular: false },
                { name: "Starter", price: "$29/mo", credits: "500 credits/mo", features: ["All 8 services", "30 req/min", "Email support"], popular: false },
                { name: "Pro", price: "$79/mo", credits: "1,500 credits/mo", features: ["All 8 services", "60 req/min", "Priority support"], popular: true },
              ].map((p) => (
                <StaggerItem key={p.name}>
                  <HoverTilt tiltAmount={3}>
                    <Card className={`relative ${p.popular ? "border-primary/50 glow-sm rotating-border" : "hover-lift"}`}>
                      {p.popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                          <Badge className="gradient-bg border-0 shadow-lg shadow-primary/20">Most Popular</Badge>
                        </div>
                      )}
                      <CardContent className="p-6">
                        <h3 className="font-semibold mb-1 mono text-sm">{p.name}</h3>
                        <div className="text-3xl font-bold mb-1">{p.price}</div>
                        <p className="text-sm text-primary mono mb-4">{p.credits}</p>
                        <ul className="space-y-2 mb-6">
                          {p.features.map((f) => (
                            <li key={f} className="text-sm text-muted-foreground flex items-center gap-2">
                              <Check className="w-4 h-4 text-indigo-500" /> {f}
                            </li>
                          ))}
                        </ul>
                        <ScaleHover>
                          <Button variant={p.popular ? "gradient" : "outline"} className="w-full" asChild>
                            <Link href="/signup">Get Started</Link>
                          </Button>
                        </ScaleHover>
                      </CardContent>
                    </Card>
                  </HoverTilt>
                </StaggerItem>
              ))}
            </StaggerContainer>
            <FadeIn>
              <p className="text-center text-sm text-muted-foreground mono">
                Or buy credit packs: <Link href="/pricing" className="text-primary hover:underline">100 for $8 &bull; 500 for $35 &bull; 1,000 for $60 &bull; 2,000 for $100</Link>
              </p>
            </FadeIn>
          </div>
        </section>

        {/* Security */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 glass" />
          <div className="relative max-w-5xl mx-auto px-4 text-center">
            <FadeIn>
              <motion.div
                className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6 pulse-glow"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                <Shield className="w-8 h-8 text-primary" />
              </motion.div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">Secure & Private</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Encrypted data at rest, Row Level Security on all tables, TLS on all connections.
                We never sell your data. GDPR and CCPA compliant.
              </p>
            </FadeIn>
            <StaggerContainer staggerDelay={0.08} className="flex flex-wrap justify-center gap-4 mt-8">
              {["HMAC-SHA256 Webhooks", "Timing-Safe Auth", "Row Level Security", "HSTS Enforced"].map((item) => (
                <StaggerItem key={item}>
                  <motion.span
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-border/30 bg-secondary/30 mono text-xs text-muted-foreground"
                    whileHover={{ scale: 1.05, borderColor: "rgba(16, 185, 129, 0.3)" }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  >
                    <Check className="w-3 h-3 text-indigo-500" /> {item}
                  </motion.span>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-24 relative">
          <div className="absolute inset-0 grid-bg opacity-20" />
          <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeIn className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold">Frequently Asked Questions</h2>
            </FadeIn>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <FadeIn key={i} delay={i * 0.05}>
                  <div className="border border-border/30 rounded-xl overflow-hidden glass hover:border-primary/20 transition-colors">
                    <button
                      className="w-full flex items-center justify-between p-5 text-left hover:bg-primary/5 transition-colors cursor-pointer"
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    >
                      <span className="font-medium pr-4">{faq.q}</span>
                      <motion.div
                        animate={{ rotate: openFaq === i ? 180 : 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />
                      </motion.div>
                    </button>
                    <AnimatePresence>
                      {openFaq === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{faq.a}</div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 gradient-bg opacity-5" />
          <div className="absolute inset-0 grid-bg" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] aurora-orb" />
          <FloatingParticles count={10} />
          <div className="relative max-w-3xl mx-auto px-4 text-center">
            <FadeIn>
              <h2 className="text-3xl sm:text-5xl font-bold mb-4">
                Start Building with{" "}
                <span className="text-shimmer">Kognitrix AI</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-10">
                20 free credits. 8 AI services. 3 access channels. Zero risk.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <ScaleHover>
                  <Button variant="gradient" size="xl" asChild>
                    <Link href="/signup">
                      <Sparkles className="w-5 h-5 mr-1" />
                      Create Free Account
                      <ArrowRight className="w-5 h-5 ml-1" />
                    </Link>
                  </Button>
                </ScaleHover>
                <ScaleHover>
                  <Button variant="outline" size="xl" asChild>
                    <Link href="/docs">
                      <Terminal className="w-5 h-5 mr-1.5" />
                      Read the Docs
                    </Link>
                  </Button>
                </ScaleHover>
              </div>
            </FadeIn>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
