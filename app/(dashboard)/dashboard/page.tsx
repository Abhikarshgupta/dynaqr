import { createClient } from "@/lib/supabase/server";
import { UserProfile } from "@/components/dashboard/UserProfile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get user's links count
  const { count } = await supabase
    .from("links")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user?.id);

  // Get total scan count
  const { data: links } = await supabase
    .from("links")
    .select("scan_count")
    .eq("user_id", user?.id);

  const totalScans = links?.reduce((acc, link) => acc + (link.scan_count || 0), 0) || 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage your dynamic QR codes</p>
        </div>
        <UserProfile />
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/dashboard/links">
          <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
            <CardHeader>
              <CardTitle>Total Links</CardTitle>
              <CardDescription>QR codes you&apos;ve created</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{count || 0}</div>
              <p className="text-sm text-muted-foreground mt-2">Click to view all links</p>
            </CardContent>
          </Card>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Total Scans</CardTitle>
            <CardDescription>Times your QR codes were scanned</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalScans}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started quickly</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/links/new">
              <Button className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Create New Link
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}