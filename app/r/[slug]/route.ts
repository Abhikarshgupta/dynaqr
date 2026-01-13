import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = await createClient();

  // Query for the link
  const { data: link, error } = await supabase
    .from("links")
    .select("original_url, scan_count, id")
    .eq("slug", slug)
    .single();

  if (error || !link) {
    return NextResponse.json(
      { error: "Link not found" },
      { status: 404 }
    );
  }

  // Increment scan count asynchronously (don't wait for it)
  Promise.resolve(
    supabase
      .from("links")
      .update({ scan_count: (link.scan_count || 0) + 1 })
      .eq("id", link.id)
  )
    .then(() => {
      // Successfully updated, but we don't need to wait
    })
    .catch(() => {
      // Silently fail - we don't want to block the redirect
    });

  // Return 302 redirect
  return NextResponse.redirect(link.original_url, { status: 302 });
}