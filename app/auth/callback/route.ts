import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  console.log("[Auth Callback] Received callback:", {
    hasCode: !!code,
    origin,
    pathname: requestUrl.pathname,
  });

  if (code) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error) {
        console.log("[Auth Callback] Session exchange successful:", {
          userId: data.user?.id,
          email: data.user?.email,
        });
        // Redirect to dashboard on success
        return NextResponse.redirect(`${origin}/dashboard`);
      } else {
        console.error("[Auth Callback] Session exchange failed:", {
          error: error.message,
          code: error.status,
        });
      }
    } catch (error) {
      console.error("[Auth Callback] Unexpected error during session exchange:", error);
    }
  }

  // Handle errors - redirect to login with error message
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");
  
  console.log("[Auth Callback] Redirecting to login with error:", {
    error,
    errorDescription,
  });
  
  const redirectTo = new URL(`${origin}/auth/login`);
  if (error) {
    redirectTo.searchParams.set("error", error);
    if (errorDescription) {
      redirectTo.searchParams.set("error_description", errorDescription);
    }
  } else {
    redirectTo.searchParams.set("error", "invalid_token");
  }
  
  return NextResponse.redirect(redirectTo);
}