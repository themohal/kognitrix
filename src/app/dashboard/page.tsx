"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import { useCredits } from "@/context/CreditsContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { UsageChart } from "@/components/dashboard/UsageChart";
import { FadeIn, SpotlightCard } from "@/components/ui/animations";
import { motion } from "framer-motion";
import {
  Zap, BarChart3, CreditCard, ArrowRight, Clock,
  TrendingUp, Activity,
} from "lucide-react";

interface UsageLog {
  id: string;
  service_id: string;
  service_name: string;
  credits_used: number;
  status: string;
  channel: string;
  created_at: string;
}

interface UsageSummary {
  total_requests: number;
  total_credits: number;
  recent_logs: UsageLog[];
}

interface ChartDataPoint {
  date: string;
  requests: number;
  credits: number;
}

function groupLogsByDate(logs: UsageLog[]): ChartDataPoint[] {
  const map: Record<string, { requests: number; credits: number }> = {};
  for (const log of logs) {
    const day = log.created_at.slice(0, 10); // "YYYY-MM-DD"
    if (!map[day]) map[day] = { requests: 0, credits: 0 };
    map[day].requests += 1;
    map[day].credits += log.credits_used;
  }
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({ date, ...v }));
}

export default function DashboardPage() {
  const { user, profile } = useUser();
  const { balance } = useCredits();
  const [usage, setUsage] = useState<UsageSummary>({
    total_requests: 0,
    total_credits: 0,
    recent_logs: [],
  });
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  const fetchUsage = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await fetch("/api/me/usage?page=0&pageSize=3");
      if (!res.ok) return;
      const data = await res.json();
      setUsage({
        total_requests: data.total ?? 0,
        total_credits: data.total_credits_used ?? 0,
        recent_logs: data.logs ?? [],
      });
    } catch {
      // Keep existing state on error
    }
  }, [user?.id]);

  const fetchChartData = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await fetch("/api/me/usage?limit=30&page=0&pageSize=200");
      if (!res.ok) return;
      const data = await res.json();
      const logs: UsageLog[] = data.logs ?? [];
      setChartData(groupLogsByDate(logs));
    } catch {
      // Keep existing chart data on error
    }
  }, [user?.id]);

  // Initial fetch + realtime updates from broadcast
  useEffect(() => {
    fetchUsage();
    fetchChartData();
    const onUpdate = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.total_requests != null && detail?.total_credits_used != null) {
        setUsage((prev) => ({
          ...prev,
          total_requests: detail.total_requests,
          total_credits: detail.total_credits_used,
          recent_logs: [
            {
              id: detail.request_id,
              service_id: detail.service_id,
              service_name: detail.service_name || detail.service_id,
              credits_used: detail.credits_used,
              status: "success",
              channel: detail.channel,
              created_at: detail.created_at,
            },
            ...prev.recent_logs,
          ].slice(0, 3),
        }));
        // Refresh chart data after a new request
        fetchChartData();
      } else {
        fetchUsage();
        fetchChartData();
      }
    };
    window.addEventListener("kognitrix:credits-updated", onUpdate);
    return () => window.removeEventListener("kognitrix:credits-updated", onUpdate);
  }, [fetchUsage, fetchChartData]);

  const stats = [
    {
      label: "Credits Balance",
      value: balance,
      icon: CreditCard,
      color: "text-indigo-500",
      href: "/dashboard/billing",
    },
    {
      label: "Total Requests",
      value: usage.total_requests,
      icon: Activity,
      color: "text-blue-500",
      href: "/dashboard/usage",
    },
    {
      label: "Credits Used",
      value: usage.total_credits,
      icon: TrendingUp,
      color: "text-purple-500",
      href: "/dashboard/usage",
    },
    {
      label: "Plan",
      value: profile?.plan_type?.replace("_", " ") || "Free Trial",
      icon: Zap,
      color: "text-amber-500",
      href: "/dashboard/billing",
    },
  ];

  return (
    <div className="space-y-8">
      <FadeIn>
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your Kognitrix AI usage and account.
          </p>
        </div>
      </FadeIn>

      {/* Stats grid */}
      <StatsCards stats={stats} />

      {/* Request history chart */}
      <FadeIn delay={0.2}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              Request History (30 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <UsageChart data={chartData} />
          </CardContent>
        </Card>
      </FadeIn>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { href: "/dashboard/services", icon: Zap, title: "Use Services", desc: "Generate content, code, images & more" },
          { href: "/dashboard/api-keys", icon: BarChart3, title: "API Access", desc: "Get your API key for REST & MCP" },
          { href: "/dashboard/billing", icon: CreditCard, title: "Buy Credits", desc: "Top up credits or subscribe to a plan" },
        ].map((item, i) => (
          <FadeIn key={item.href} delay={0.3 + i * 0.08}>
            <Link href={item.href}>
              <SpotlightCard>
                <Card className="hover:border-primary/50 transition-all duration-300 cursor-pointer hover-lift h-full">
                  <CardContent className="p-5 flex flex-col items-center text-center">
                    <motion.div
                      whileHover={{ scale: 1.15, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    >
                      <item.icon className="w-8 h-8 text-primary mb-3" />
                    </motion.div>
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              </SpotlightCard>
            </Link>
          </FadeIn>
        ))}
      </div>

      {/* Recent activity */}
      <FadeIn delay={0.45}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {usage.recent_logs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p>No activity yet. Start using services to see your usage here.</p>
                <Link href="/dashboard/services">
                  <Button variant="outline" className="mt-4">
                    Explore Services <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {usage.recent_logs.map((log, i) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={log.status === "success" ? "success" : "destructive"}
                        className="text-xs"
                      >
                        {log.status}
                      </Badge>
                      <div>
                        <div className="text-sm font-medium">{log.service_name}</div>
                        <div className="text-xs text-muted-foreground">
                          via {log.channel} &bull;{" "}
                          {new Date(log.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-medium">
                      -{log.credits_used} credits
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
