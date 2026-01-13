import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  console.log("[Redirect] Processing redirect for slug:", slug);
  
  const supabase = await createClient();

  // Query for the link
  const { data: link, error } = await supabase
    .from("links")
    .select("original_url, scan_count, id")
    .eq("slug", slug)
    .single();

  if (error || !link) {
    console.error("[Redirect] Link not found:", {
      slug,
      error: error?.message,
      code: error?.code,
    });
    return NextResponse.json(
      { error: "Link not found" },
      { status: 404 }
    );
  }

  console.log("[Redirect] Link found:", {
    slug,
    linkId: link.id,
    destination: link.original_url,
    currentScans: link.scan_count,
  });

  // Increment scan count asynchronously (don't wait for it)
  Promise.resolve(
    supabase
      .from("links")
      .update({ scan_count: (link.scan_count || 0) + 1 })
      .eq("id", link.id)
  )
    .then(() => {
      console.log("[Redirect] Scan count incremented for:", slug);
    })
    .catch((err) => {
      console.error("[Redirect] Failed to increment scan count:", {
        slug,
        error: err,
      });
      // Silently fail - we don't want to block the redirect
    });

  console.log("[Redirect] Redirecting to:", link.original_url);
  // Return 302 redirect
  return NextResponse.redirect(link.original_url, { status: 302 });
}