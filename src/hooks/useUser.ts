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
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user);
      }
      setLoading(false);
    }

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: any) => {
        // Only update state on explicit sign-in/sign-out events
        // Ignore TOKEN_REFRESHED failures and other transient events
        // that can happen when Supabase is temporarily unreachable
        if (event === "SIGNED_IN" || event === "USER_UPDATED") {
          const u = session?.user ?? null;
          setUser(u);
          if (u) await fetchProfile(u);
        } else if (event === "SIGNED_OUT") {
          // Only clear state if there's genuinely no session cookie
          // (i.e., user explicitly signed out, not a network failure)
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          if (!currentSession) {
            setUser(null);
            setProfile(null);
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { user, profile, loading };
}
