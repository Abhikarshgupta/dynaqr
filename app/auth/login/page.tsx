import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; error_description?: string }>;
}) {
  const params = await searchParams;
  const hasError = params.error || params.error_description;

  return (
    <div className="flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-8 bg-background">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasError && (
            <Alert variant="destructive">
              <AlertDescription>
                {params.error_description || params.error || "An error occurred during authentication"}
              </AlertDescription>
            </Alert>
          )}
          <LoginForm />
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}