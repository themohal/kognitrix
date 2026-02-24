"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const CREDITS_UPDATE_EVENT = "kognitrix:credits-updated";

// Broadcast to all useCredits instances on this page to re-fetch
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
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("credits_balance")
      .eq("id", userId)
      .single();
    if (data) setBalance(data.credits_balance);
    if (error) console.error("fetchBalance error:", error.message);
    setLoading(false);
  }, [userId]);

  // Fetch when userId becomes available
  useEffect(() => {
    if (userId) fetchBalance();
  }, [userId, fetchBalance]);

  // Re-fetch whenever any component broadcasts a credits update
  useEffect(() => {
    window.addEventListener(CREDITS_UPDATE_EVENT, fetchBalance);
    return () => window.removeEventListener(CREDITS_UPDATE_EVENT, fetchBalance);
  }, [fetchBalance]);

  return { balance, loading, fetchBalance, setBalance };
}
