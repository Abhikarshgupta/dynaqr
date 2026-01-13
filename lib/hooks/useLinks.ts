"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Link } from "@/types/qr";

export function useLinks() {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        setLoading(true);
        console.log("[useLinks] Fetching links for user");
        
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          console.log("[useLinks] No user found, skipping fetch");
          setLoading(false);
          return;
        }

        console.log("[useLinks] User authenticated:", {
          userId: user.id,
          email: user.email,
        });

        const { data, error } = await supabase
          .from("links")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("[useLinks] Fetch failed:", {
            userId: user.id,
            error: error.message,
            code: error.code,
          });
          setError(error.message);
        } else {
          console.log("[useLinks] Links fetched successfully:", {
            count: data?.length || 0,
            userId: user.id,
          });
          setLinks((data as Link[]) || []);
        }
      } catch (err) {
        console.error("[useLinks] Unexpected error:", err);
        setError("Failed to fetch links");
      } finally {
        setLoading(false);
      }
    };

    fetchLinks();
  }, [supabase]);

  return { links, loading, error, refetch: () => {} };
}