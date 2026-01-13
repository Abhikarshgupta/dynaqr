"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let mounted = true;

    const getUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (mounted) {
          setUser(user);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error getting user:", error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  return { user, loading };
}