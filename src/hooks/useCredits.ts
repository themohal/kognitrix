"use client";

import { useCallback, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function useCredits(userId: string | undefined) {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const fetchBalance = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("profiles")
      .select("credits_balance")
      .eq("id", userId)
      .single();
    if (data) setBalance(data.credits_balance);
    setLoading(false);
  }, [userId]);

  return { balance, loading, fetchBalance, setBalance };
}
