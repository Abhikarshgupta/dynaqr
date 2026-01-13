import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, Link as LinkIcon, Zap } from "lucide-react";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect authenticated users to dashboard
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold">Open-QR</h1>
          <div className="flex gap-2 sm:gap-4">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm" className="text-sm">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm" className="text-sm">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
            Dynamic QR Code Management
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-8 sm:mb-12 max-w-2xl mx-auto px-4">
            Create a single QR code that stays the same, but redirects to any URL you choose. Change destinations anytime without reprinting.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="text-base sm:text-lg px-6 sm:px-8">
              Start Creating QR Codes
            </Button>
          </Link>
        </section>

        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <Card>
              <CardHeader>
                <QrCode className="h-12 w-12 mb-4 text-primary" />
                <CardTitle>Dynamic Redirects</CardTitle>
                <CardDescription>
                  Change your QR code destination anytime without reprinting
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <LinkIcon className="h-12 w-12 mb-4 text-primary" />
                <CardTitle>Custom Slugs</CardTitle>
                <CardDescription>
                  Choose your own URL slug or let us generate one for you
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="h-12 w-12 mb-4 text-primary" />
                <CardTitle>Fast & Secure</CardTitle>
                <CardDescription>
                  Lightning-fast redirects with enterprise-grade security
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 sm:py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
          <p>© 2025 Open-QR. Open source QR code management platform.</p>
        </div>
      </footer>
    </div>
  );
}