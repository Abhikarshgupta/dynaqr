import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserProfile } from "@/components/dashboard/UserProfile";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Manage your account settings</p>
      </div>

      <div className="max-w-2xl space-y-4 sm:space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent>
            <UserProfile />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Plan</CardTitle>
            <CardDescription>Your current subscription plan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Free Plan</p>
                <p className="text-sm text-muted-foreground">
                  Unlimited links and QR codes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}