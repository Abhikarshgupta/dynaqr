import { LinkForm } from "@/components/dashboard/LinkForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewLinkPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">Create New Link</CardTitle>
          <CardDescription>
            Create a new dynamic QR code link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LinkForm />
        </CardContent>
      </Card>
    </div>
  );
}