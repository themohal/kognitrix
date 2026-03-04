"use client";

import Link from "next/link";
import { Zap } from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem, GradientLine } from "@/components/ui/animations";

export default function Footer() {
  return (
    <footer className="border-t border-border/30 bg-background relative overflow-hidden">
      {/* Subtle grid background */}
      <div className="absolute inset-0 grid-bg opacity-50" />

      {/* Animated gradient top border */}
      <GradientLine />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <StaggerContainer staggerDelay={0.1} className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <StaggerItem className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center glow-sm transition-transform group-hover:scale-110">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight">
                Kognitrix<span className="text-primary">.ai</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Intelligence-as-a-Service for Humans & Agents. Pay-per-use AI services via Web, API, and MCP.
            </p>
            <div className="flex items-center gap-2 mt-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500 shadow-[0_0_6px_theme(colors.indigo.500)]" />
              </span>
              <span className="text-xs text-indigo-500 mono">All systems operational</span>
            </div>
          </StaggerItem>

          <StaggerItem>
            <h4 className="font-semibold mb-4 text-sm mono text-primary/80">// Product</h4>
            <ul className="space-y-2">
              {[
                { href: "/services", label: "Services" },
                { href: "/pricing", label: "Pricing" },
                { href: "/docs", label: "API Docs" },
                { href: "/dashboard", label: "Dashboard" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors animated-underline py-0.5 inline-block">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </StaggerItem>

          <StaggerItem>
            <h4 className="font-semibold mb-4 text-sm mono text-primary/80">// Company</h4>
            <ul className="space-y-2">
              {[
                { href: "/about", label: "About" },
                { href: "/contact", label: "Contact" },
                { href: "/terms", label: "Terms" },
                { href: "/privacy", label: "Privacy" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors animated-underline py-0.5 inline-block">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </StaggerItem>

          <StaggerItem>
            <h4 className="font-semibold mb-4 text-sm mono text-primary/80">// Legal</h4>
            <ul className="space-y-2">
              {[
                { href: "/terms", label: "Terms of Service" },
                { href: "/privacy", label: "Privacy Policy" },
                { href: "/refund", label: "Refund Policy" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors animated-underline py-0.5 inline-block">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </StaggerItem>
        </StaggerContainer>

        <FadeIn delay={0.3}>
          <div className="border-t border-border/30 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground mono">
              &copy; {new Date().getFullYear()} Kognitrix AI. All rights reserved.
            </p>
          </div>
        </FadeIn>
      </div>
    </footer>
  );
}
