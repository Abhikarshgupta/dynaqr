import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LinkForm } from "@/components/dashboard/LinkForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function EditLinkPage({
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
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">Edit Link</CardTitle>
          <CardDescription>
            Update your dynamic QR code link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LinkForm
            linkId={link.id}
            initialData={{
              slug: link.slug,
              original_url: link.original_url,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}