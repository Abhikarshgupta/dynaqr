"use client";

import { useLinks } from "@/lib/hooks/useLinks";
import { LinkCard } from "./LinkCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";
import { Plus } from "lucide-react";

export function LinkList() {
  const { links, loading, error } = useLinks();

  if (loading) {
    return (
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (links.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground mb-4">No links yet</p>
        <Link href="/dashboard/links/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Your First Link
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {links.map((link) => (
        <LinkCard key={link.id} link={link} />
      ))}
    </div>
  );
}