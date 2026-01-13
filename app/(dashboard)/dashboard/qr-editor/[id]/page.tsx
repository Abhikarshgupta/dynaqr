import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { QRCodeEditor } from "@/components/qr/QRCodeEditor";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { QRConfig } from "@/types/qr";

export default async function QREditorPage({
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

  const qrConfig: QRConfig = (link.qr_config as QRConfig) || {
    dots: "square",
    corners: "square",
    color: "#000000",
    errorCorrection: "H",
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">QR Code Editor</CardTitle>
          <CardDescription>
            Customize the appearance of your QR code for <span className="font-mono">{link.slug}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <QRCodeEditor
            linkId={link.id}
            slug={link.slug}
            initialConfig={qrConfig}
          />
        </CardContent>
      </Card>
    </div>
  );
}