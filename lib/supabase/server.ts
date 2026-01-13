import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log("[Supabase Server] Initializing server client");
  console.log("[Supabase Server] URL present:", !!supabaseUrl);
  console.log("[Supabase Server] Key present:", !!supabaseAnonKey);

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[Supabase Server] Missing env vars:", {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
    });
    throw new Error(
      "Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set."
    );
  }

  // Validate URL format
  try {
    const urlObj = new URL(supabaseUrl);
    console.log("[Supabase Server] URL validated:", {
      protocol: urlObj.protocol,
      hostname: urlObj.hostname,
    });
  } catch (error) {
    console.error("[Supabase Server] Invalid URL format:", supabaseUrl);
    throw new Error(
      `Invalid Supabase URL format: ${supabaseUrl}. Must be a valid URL (e.g., https://xxxxx.supabase.co)`
    );
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch (error) {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
}