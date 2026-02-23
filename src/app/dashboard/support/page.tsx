"use client";

import { useState } from "react";
import { useUser } from "@/hooks/useUser";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, Send, Loader2, Check, MessageCircle } from "lucide-react";
import { useEffect } from "react";

interface Ticket {
  id: string;
  subject: string;
  status: string;
  priority: string;
  created_at: string;
}

export default function SupportPage() {
  const { user } = useUser();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    if (!user?.id) return;

    async function fetchTickets() {
      const supabase = createClient();
      const { data } = await supabase
        .from("support_tickets")
        .select("id, subject, status, priority, created_at")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(10);
      setTickets(data ?? []);
    }

    fetchTickets();
  }, [user?.id]);

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim() || !user?.id) return;

    setSending(true);
    setSent(false);

    const supabase = createClient();
    await supabase.from("support_tickets").insert({
      user_id: user.id,
      subject,
      message,
      status: "open",
      priority: "medium",
    });

    setSending(false);
    setSent(true);
    setSubject("");
    setMessage("");

    // Refresh tickets
    const { data } = await supabase
      .from("support_tickets")
      .select("id, subject, status, priority, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);
    setTickets(data ?? []);

    setTimeout(() => setSent(false), 3000);
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "open": return "secondary";
      case "in_progress": return "default";
      case "resolved": return "success";
      case "closed": return "outline";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Support</h1>
        <p className="text-muted-foreground">
          Need help? Submit a support ticket and we&apos;ll get back to you.
        </p>
      </div>

      {/* New ticket form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            Submit a Ticket
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Subject</label>
            <Input
              placeholder="Brief description of your issue"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Message</label>
            <textarea
              className="w-full min-h-[120px] p-3 rounded-lg bg-secondary/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-y"
              placeholder="Describe your issue in detail..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <Button
            variant="gradient"
            onClick={handleSubmit}
            disabled={sending || !subject.trim() || !message.trim()}
          >
            {sending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : sent ? (
              <Check className="w-4 h-4 mr-2" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            {sent ? "Submitted!" : "Submit Ticket"}
          </Button>
        </CardContent>
      </Card>

      {/* Existing tickets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Your Tickets
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tickets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No support tickets yet.
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-secondary/30"
                >
                  <div>
                    <div className="text-sm font-medium">{ticket.subject}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusColor(ticket.status) as "default" | "secondary" | "destructive" | "outline" | "success"} className="text-xs">
                      {ticket.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contact info */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>For urgent issues, email us at{" "}
              <a href="mailto:support@kognitrix.ai" className="text-primary hover:underline">
                support@kognitrix.ai
              </a>
            </p>
            <p className="mt-1">We typically respond within 24 hours.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
