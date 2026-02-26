import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { FileText, Code, FileSearch, ImageIcon, Database, Languages, Globe, Terminal, Plug, ClipboardCheckIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "AI Services",
  description: "Explore Kognitrix AI services — content generation, code assistance, image creation, document analysis, data extraction, and translation. Pay per use.",
};

const services = [
  {
    icon: FileText,
    name: "AI Content Generator",
    description: "Generate high-quality blog posts, articles, social media content, marketing copy, and email campaigns. Multiple tones and styles supported.",
    credits: 5,
    features: ["Blog posts & articles", "Social media content", "Marketing copy", "Email campaigns", "Custom tone & style"],
  },
  {
    icon: Code,
    name: "AI Code Assistant",
    description: "Generate code, debug issues, refactor for best practices, and get detailed code reviews. Supports all major languages and frameworks.",
    credits: 8,
    features: ["Code generation", "Bug detection & fixing", "Refactoring", "Code reviews", "All languages supported"],
  },
  {
    icon: FileSearch,
    name: "AI Document Analyzer",
    description: "Upload and analyze any document. Get summaries, extract key data, perform Q&A, and identify important clauses in contracts.",
    credits: 6,
    features: ["Document summarization", "Key info extraction", "Contract analysis", "Q&A on documents", "Structured insights"],
  },
  {
    icon: ImageIcon,
    name: "AI Image Generator",
    description: "Create stunning images with DALL-E 3. Perfect for marketing materials, social posts, presentations, and design concepts.",
    credits: 10,
    features: ["DALL-E 3 powered", "Multiple sizes", "Vivid & natural styles", "HD quality available", "Commercial use ready"],
  },
  {
    icon: Database,
    name: "AI Data Extractor",
    description: "Transform unstructured text into clean, structured JSON data. Extract entities, relationships, dates, amounts, and more.",
    credits: 4,
    features: ["Unstructured → JSON", "Entity extraction", "Custom schemas", "Relationship mapping", "Batch processing"],
  },
  {
    icon: Languages,
    name: "AI Translator",
    description: "Translate text between 50+ languages with full context awareness. Maintains tone, technical accuracy, and cultural nuance.",
    credits: 3,
    features: ["50+ languages", "Context-aware", "Tone preservation", "Technical accuracy", "Batch translation"],
  },
  {
    icon: ClipboardCheckIcon,
    name: "AI Activity Auditor",
    description: "Generates compliance audit reports for AI tool usage across enterprises, documenting which employees used which AI systems, what data was processed, and identifying governance gaps for regulatory review. Helps organizations prove they control their AI usage.",
    credits: 12,
    features: ["Company Department", "Ai Tools List", "Time Period", "Data Categories Processed", "Regulatory Framework"],
  },
];

export default function ServicesPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">7 AI Services</Badge>
            <h1 className="text-4xl font-bold mb-4">
              Powerful AI Services, <span className="gradient-text">Three Ways to Access</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Every service is available through our web dashboard, REST API, and MCP server. Humans and AI agents use the same services at the same prices.
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Globe className="w-4 h-4 text-primary" /> Web Dashboard
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Terminal className="w-4 h-4 text-primary" /> REST API
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Plug className="w-4 h-4 text-primary" /> MCP Server
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {services.map((service) => (
              <Card key={service.name} className="group hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <service.icon className="w-5 h-5 text-primary" />
                    </div>
                    <Badge variant="outline">{service.credits} credits</Badge>
                  </div>
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-4">
                    {service.features.map((f) => (
                      <li key={f} className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-primary" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/signup">Try Now</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to start?</h2>
            <p className="text-muted-foreground mb-6">20 free credits on signup. No credit card required.</p>
            <div className="flex justify-center gap-3">
              <Button variant="gradient" size="lg" asChild>
                <Link href="/signup">Get Started Free</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/docs">View API Docs</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
