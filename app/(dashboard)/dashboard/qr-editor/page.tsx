import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LinkIcon } from "lucide-react";

export default async function QREditorIndexPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: links } = await supabase
    .from("links")
    .select("id, slug")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (!links || links.length === 0) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No links found</p>
            <Link href="/dashboard/links/new">
              <Button>
                <LinkIcon className="mr-2 h-4 w-4" />
                Create Your First Link
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">QR Code Editor</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Select a link to customize its QR code</p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((link) => (
          <Card key={link.id}>
            <CardHeader>
              <CardTitle>{link.slug}</CardTitle>
            </CardHeader>
            <CardContent>
              <Link href={`/dashboard/qr-editor/${link.id}`}>
                <Button className="w-full">Edit QR Code</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}