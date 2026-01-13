import Link from "next/link";
import { SignupForm } from "@/components/auth/SignupForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-8 bg-background">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription>Sign up to start creating dynamic QR codes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SignupForm />
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}