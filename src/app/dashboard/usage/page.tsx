"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/hooks/useUser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";


interface UsageLog {
  id: string;
  service_id: string;
  credits_used: number;
  status: string;
  channel: string;
  latency_ms: number;
  model_used: string;
  created_at: string;
  services?: { name: string; slug: string } | null;
}

function getServiceName(log: UsageLog): string {
  if (log.services?.name) return log.services.name;
  return log.service_id.substring(0, 8) + "...";
}

interface ServiceStat {
  service: string;
  credits: number;
}

interface TooltipPayload {
  value: number;
  name: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

function CustomBarTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div
      style={{
        background: "rgba(10, 17, 32, 0.95)",
        border: "1px solid rgba(16, 185, 129, 0.3)",
        borderRadius: "8px",
        padding: "10px 14px",
        fontSize: "13px",
      }}
    >
      <p style={{ color: "#94a3b8", marginBottom: 4 }}>{label}</p>
      <p style={{ color: "#a855f7" }}>Credits: {payload[0].value}</p>
    </div>
  );
}

function computeTopServices(logs: UsageLog[]): ServiceStat[] {
  const map: Record<string, number> = {};
  const nameMap: Record<string, string> = {};
  for (const log of logs) {
    const key = log.service_id;
    map[key] = (map[key] ?? 0) + log.credits_used;
    if (log.services?.name) nameMap[key] = log.services.name;
  }
  return Object.entries(map)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([id, credits]) => ({ service: nameMap[id] ?? id.substring(0, 8), credits }));
}

const PAGE_SIZE = 20;

export default function UsagePage() {
  const { user } = useUser();
  const [logs, setLogs] = useState<UsageLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [filterChannel, setFilterChannel] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [allLogs, setAllLogs] = useState<UsageLog[]>([]);
  const [totalCreditsUsed, setTotalCreditsUsed] = useState(0);

  // Fetch paginated logs for the table
  useEffect(() => {
    if (!user?.id) return;

    async function fetchLogs() {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
        if (filterChannel) params.set("channel", filterChannel);
        const res = await fetch(`/api/me/usage?${params}`);
        if (!res.ok) return;
        const data = await res.json();
        setLogs(data.logs ?? []);
        setTotal(data.total ?? 0);
        setTotalCreditsUsed(data.total_credits_used ?? 0);
      } catch {
        // Keep existing state
      } finally {
        setLoading(false);
      }
    }

    fetchLogs();
  }, [user?.id, page, filterChannel]);

  // Fetch a larger set for the bar chart (top services)
  useEffect(() => {
    if (!user?.id) return;

    async function fetchAllLogs() {
      try {
        const res = await fetch("/api/me/usage?page=0&pageSize=200");
        if (!res.ok) return;
        const data = await res.json();
        setAllLogs(data.logs ?? []);
      } catch {
        // Keep existing state
      }
    }

    fetchAllLogs();
  }, [user?.id]);

  const topServices = computeTopServices(allLogs);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Usage & Logs</h1>
        <p className="text-muted-foreground">
          Track all your API requests and credit usage.
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Channel:</span>
        {["", "web", "api", "mcp"].map((ch) => (
          <Button
            key={ch}
            variant={filterChannel === ch ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setFilterChannel(ch);
              setPage(0);
            }}
          >
            {ch || "All"}
          </Button>
        ))}
      </div>

      {/* Stats summary */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total Requests</div>
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total Credits Used</div>
            <div className="text-2xl font-bold">
              {totalCreditsUsed}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Avg Latency (Page)</div>
            <div className="text-2xl font-bold">
              {logs.length > 0
                ? Math.round(
                    logs.reduce((sum, l) => sum + l.latency_ms, 0) / logs.length
                  )
                : 0}
              ms
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logs table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Request Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No usage logs found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Service</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Channel</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Credits</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Latency</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Model</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-border/50 hover:bg-secondary/30">
                      <td className="py-3 px-2 font-medium">{getServiceName(log)}</td>
                      <td className="py-3 px-2">
                        <Badge
                          variant={log.status === "success" ? "success" : "destructive"}
                          className="text-xs"
                        >
                          {log.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-2">
                        <Badge variant="outline" className="text-xs">{log.channel}</Badge>
                      </td>
                      <td className="py-3 px-2">{log.credits_used}</td>
                      <td className="py-3 px-2">{log.latency_ms}ms</td>
                      <td className="py-3 px-2 text-muted-foreground">{log.model_used}</td>
                      <td className="py-3 px-2 text-muted-foreground">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <span className="text-sm text-muted-foreground">
                Page {page + 1} of {totalPages} ({total} total)
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top services bar chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            Top Services by Credits Used
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topServices.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No service data yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={topServices}
                margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a855f7" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(30, 41, 59, 0.8)"
                  vertical={false}
                />
                <XAxis
                  dataKey="service"
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={36}
                />
                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "rgba(168, 85, 247, 0.08)" }} />
                <Bar dataKey="credits" fill="url(#barGrad)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
