"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { CreditsProvider, useCredits } from "@/context/CreditsContext";
import {
  LayoutDashboard, Zap, BarChart3, CreditCard, Key,
  Plug, Settings, HelpCircle, Mail, Menu, X, LogOut, ChevronRight, Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { GradientLine } from "@/components/ui/animations";

const baseSidebarLinks = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/services", label: "Services", icon: Zap },
  { href: "/dashboard/usage", label: "Usage & Logs", icon: BarChart3 },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/api-keys", label: "API Keys", icon: Key },
  { href: "/dashboard/mcp-setup", label: "MCP Setup", icon: Plug },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile } = useUser();

  return (
    <CreditsProvider userId={user?.id}>
      <DashboardShell user={user} profile={profile}>
        {children}
      </DashboardShell>
    </CreditsProvider>
  );
}

function DashboardShell({
  user,
  profile,
  children,
}: {
  user: any;
  profile: any;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { balance } = useCredits();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAdmin = profile?.is_admin === true;
  const sidebarLinks = [
    ...baseSidebarLinks,
    isAdmin
      ? { href: "/dashboard/messages", label: "Messages", icon: Mail }
      : { href: "/dashboard/support", label: "Support", icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-card/80 backdrop-blur-xl border-r border-border/30 transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full relative">
          {/* Subtle grid in sidebar */}
          <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />

          {/* Logo */}
          <div className="relative flex items-center justify-between h-16 px-4 border-b border-border/30">
            <Link href="/dashboard" className="flex items-center gap-2 group">
              <motion.div
                className="w-7 h-7 rounded-lg gradient-bg flex items-center justify-center glow-sm"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                <Zap className="w-4 h-4 text-white" />
              </motion.div>
              <span className="font-bold text-lg tracking-tight">
                Kognitrix<span className="text-primary">.ai</span>
              </span>
            </Link>
            <button
              className="lg:hidden p-1 text-muted-foreground hover:text-foreground"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Credits banner */}
          <div className="relative px-4 py-3 border-b border-border/30 bg-primary/5">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1 mono">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
              </span>
              Credits Balance
            </div>
            <div className="text-2xl font-bold gradient-text mono">{balance}</div>
            <Link href="/dashboard/billing">
              <Button variant="outline" size="sm" className="mt-2 w-full text-xs mono">
                Buy Credits <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>

          {/* Nav links */}
          <nav className="relative flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {sidebarLinks.map((link, i) => {
              const isActive =
                link.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(link.href);

              return (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.3 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                      isActive
                        ? "bg-primary/10 text-primary font-medium border border-primary/20 glow-sm"
                        : "text-muted-foreground hover:bg-primary/5 hover:text-foreground hover:translate-x-0.5"
                    }`}
                  >
                    <link.icon className={`w-4 h-4 transition-transform ${isActive ? "scale-110" : ""}`} />
                    {link.label}
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active-indicator"
                        className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      />
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          {/* User section */}
          <div className="relative border-t border-border/30 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-sm font-medium text-primary">
                {profile?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {profile?.full_name || "User"}
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 mono border-primary/20">
                    {profile?.plan_type || "free_trial"}
                  </Badge>
                </div>
              </div>
            </div>
            <form action="/api/auth/signout" method="POST" className="w-full">
              <button
                type="submit"
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-primary/5 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 glass-strong border-b border-border/30 flex items-center justify-between px-4 lg:px-8">
          <button
            className="lg:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="text-sm text-muted-foreground hidden lg:flex items-center gap-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-500 shadow-[0_0_6px_theme(colors.indigo.500)]" />
            </span>
            <span className="mono">Welcome back, {profile?.full_name || "there"}</span>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-xs mono border-primary/20">
              <Zap className="w-3 h-3 mr-1 text-primary" />
              {balance} credits
            </Badge>
            <Link href="/docs">
              <Button variant="ghost" size="sm" className="mono text-xs">Docs</Button>
            </Link>
          </div>
        </header>

        <GradientLine />

        {/* Page content */}
        <main className="p-4 lg:p-8 relative">
          <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
