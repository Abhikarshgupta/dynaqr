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
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("links")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          setError(error.message);
        } else {
          setLinks((data as Link[]) || []);
        }
      } catch (err) {
        setError("Failed to fetch links");
      } finally {
        setLoading(false);
      }
    };

    fetchLinks();
  }, [supabase]);

  return { links, loading, error, refetch: () => {} };
}