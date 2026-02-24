"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const CREDITS_UPDATE_EVENT = "kognitrix:credits-updated";

export function broadcastCreditsUpdate() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CREDITS_UPDATE_EVENT));
  }
}

export function useCredits(userId: string | undefined) {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const fetchBalance = useCallback(async () => {
    if (!userId) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("profiles")
      .select("credits_balance")
      .eq("id", userId)
      .single();
    if (data) setBalance(data.credits_balance);
  }, [userId]);

  // Fetch when userId becomes available
  useEffect(() => {
    if (userId) fetchBalance();
  }, [userId, fetchBalance]);

  // Re-fetch on broadcast event (after service use)
  useEffect(() => {
    window.addEventListener(CREDITS_UPDATE_EVENT, fetchBalance);
    return () => window.removeEventListener(CREDITS_UPDATE_EVENT, fetchBalance);
  }, [fetchBalance]);

  // Poll every 30s to stay in sync
  useEffect(() => {
    if (!userId) return;
    const interval = setInterval(fetchBalance, 30_000);
    return () => clearInterval(interval);
  }, [userId, fetchBalance]);

  // Re-fetch when tab becomes visible again (user switches back to tab)
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible" && userId) fetchBalance();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [userId, fetchBalance]);

  return { balance, loading, fetchBalance, setBalance };
}
