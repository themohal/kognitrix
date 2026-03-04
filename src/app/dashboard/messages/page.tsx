"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { ContactMessage } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, ChevronDown, Trash2, CheckCircle, Circle, Reply } from "lucide-react";

type FilterTab = "all" | "unread" | "read";

export default function AdminMessagesPage() {
  const { profile, loading: userLoading } = useUser();
  const router = useRouter();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const supabase = createClient();

  // Redirect non-admin users
  useEffect(() => {
    if (!userLoading && profile && !profile.is_admin) {
      router.push("/dashboard/support");
    }
  }, [userLoading, profile, router]);

  useEffect(() => {
    if (!profile?.is_admin) return;
    fetchMessages();
  }, [profile?.is_admin]);

  async function fetchMessages() {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false });

    setMessages((data as ContactMessage[]) || []);
    setLoading(false);
  }

  async function toggleRead(msg: ContactMessage) {
    const newStatus = !msg.is_read;
    const { error } = await supabase
      .from("messages")
      .update({ is_read: newStatus })
      .eq("id", msg.id);

    if (error) {
      alert("Failed to update message.");
      return;
    }
    setMessages(messages.map((m) => (m.id === msg.id ? { ...m, is_read: newStatus } : m)));
  }

  async function deleteMessage(id: string) {
    if (!confirm("Delete this message?")) return;
    const { error } = await supabase.from("messages").delete().eq("id", id);

    if (error) {
      alert("Failed to delete message.");
      return;
    }
    setMessages(messages.filter((m) => m.id !== id));
    if (expandedId === id) setExpandedId(null);
  }

  if (!profile?.is_admin) {
    return null;
  }

  const filtered = messages.filter((m) => {
    if (filter === "unread") return !m.is_read;
    if (filter === "read") return m.is_read;
    return true;
  });

  const unreadCount = messages.filter((m) => !m.is_read).length;

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: `All (${messages.length})` },
    { key: "unread", label: `Unread (${unreadCount})` },
    { key: "read", label: `Read (${messages.length - unreadCount})` },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Messages</h1>
        <p className="text-muted-foreground">
          View and manage support messages from users.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 bg-secondary/50 rounded-lg p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all cursor-pointer ${
              filter === tab.key
                ? "bg-primary text-primary-foreground shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading messages...</div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Mail className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              {filter === "all" ? "No messages yet." : `No ${filter} messages.`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((msg) => (
            <Card
              key={msg.id}
              className={`overflow-hidden transition-all ${
                !msg.is_read ? "border-l-4 border-l-primary" : ""
              }`}
            >
              <div
                className="p-4 cursor-pointer hover:bg-secondary/30 transition-colors"
                onClick={() => setExpandedId(expandedId === msg.id ? null : msg.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-medium truncate ${!msg.is_read ? "text-foreground" : "text-muted-foreground"}`}>
                        {msg.name}
                      </h3>
                      {!msg.is_read && (
                        <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{msg.email}</p>
                    <p className="text-sm font-medium mt-1">{msg.subject}</p>
                    {expandedId !== msg.id && (
                      <p className="text-sm text-muted-foreground mt-1 truncate">{msg.message}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant="outline" className="text-xs">
                      {new Date(msg.created_at).toLocaleDateString()}
                    </Badge>
                    <ChevronDown
                      className={`w-4 h-4 text-muted-foreground transition-transform ${
                        expandedId === msg.id ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </div>
              </div>

              {expandedId === msg.id && (
                <div className="px-4 pb-4 border-t border-border">
                  <p className="text-sm whitespace-pre-wrap mt-3 leading-relaxed">{msg.message}</p>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); toggleRead(msg); }}
                    >
                      {msg.is_read ? (
                        <><Circle className="w-3 h-3 mr-1.5" /> Mark Unread</>
                      ) : (
                        <><CheckCircle className="w-3 h-3 mr-1.5" /> Mark Read</>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <a
                        href={`mailto:${msg.email}?subject=Re: ${msg.subject}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Reply className="w-3 h-3 mr-1.5" /> Reply
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={(e) => { e.stopPropagation(); deleteMessage(msg.id); }}
                    >
                      <Trash2 className="w-3 h-3 mr-1.5" /> Delete
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
