"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types";
import type { User } from "@supabase/supabase-js";

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function fetchProfile(u: User) {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", u.id)
        .single();
      if (data) setProfile(data as Profile);
    }

    async function init() {
      // Use getSession() — reads from cookie/localStorage, no network call
      // Much more reliable than getUser() which requires a Supabase round-trip
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user);
      }
      setLoading(false);
    }

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async (_event: any, session: any) => {
        const u = session?.user ?? null;
        setUser(u);
        if (u) {
          await fetchProfile(u);
        } else {
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { user, profile, loading };
}
