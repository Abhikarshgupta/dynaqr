import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Redirect to dashboard on success
      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  // Handle errors - redirect to login with error message
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");
  
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