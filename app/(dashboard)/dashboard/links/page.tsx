import { LinkList } from "@/components/dashboard/LinkList";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function LinksPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">My Links</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage your dynamic QR codes</p>
        </div>
        <Link href="/dashboard/links/new" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Create New Link
          </Button>
        </Link>
      </div>

      <LinkList />
    </div>
  );
}