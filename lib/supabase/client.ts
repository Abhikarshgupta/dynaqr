import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Debug logging for production
  if (typeof window !== "undefined") {
    console.log("[Supabase Client] Initializing browser client");
    console.log("[Supabase Client] URL present:", !!supabaseUrl);
    console.log("[Supabase Client] URL value:", supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : "undefined");
    console.log("[Supabase Client] Key present:", !!supabaseAnonKey);
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    const error = new Error(
      "Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set."
    );
    console.error("[Supabase Client] Missing env vars:", {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
    });
    throw error;
  }

  // Validate URL format
  try {
    const urlObj = new URL(supabaseUrl);
    if (typeof window !== "undefined") {
      console.log("[Supabase Client] URL validated:", {
        protocol: urlObj.protocol,
        hostname: urlObj.hostname,
        hasTrailingSlash: supabaseUrl.endsWith("/"),
      });
    }
  } catch (error) {
    console.error("[Supabase Client] Invalid URL format:", supabaseUrl);
    throw new Error(
      `Invalid Supabase URL format: ${supabaseUrl}. Must be a valid URL (e.g., https://xxxxx.supabase.co)`
    );
  }

  const client = createBrowserClient(supabaseUrl, supabaseAnonKey);
  
  if (typeof window !== "undefined") {
    console.log("[Supabase Client] Client created successfully");
  }

  return client;
}