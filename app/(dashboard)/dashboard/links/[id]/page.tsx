import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LinkCard } from "@/components/dashboard/LinkCard";
import type { Link } from "@/types/qr";

export default async function LinkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: link, error } = await supabase
    .from("links")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !link) {
    redirect("/dashboard/links");
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <LinkCard link={link as Link} />
    </div>
  );
}