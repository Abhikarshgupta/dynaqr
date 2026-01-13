import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);
  
  // Protect dashboard routes
  const { pathname } = request.nextUrl;
  
  // Allow public routes
  const publicRoutes = ["/", "/auth/login", "/auth/signup", "/auth/callback", "/r"];
  const isPublicRoute = publicRoutes.some((route) => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  if (isPublicRoute) {
    return response;
  }
  
  // For dashboard routes, check authentication
  if (pathname.startsWith("/dashboard")) {
    // The updateSession already refreshes the session
    // We'll let the layout handle the redirect if not authenticated
    return response;
  }
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Static files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};