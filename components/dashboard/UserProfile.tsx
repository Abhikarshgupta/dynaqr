"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export function UserProfile() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const initials = user.email
    ?.split("@")[0]
    .substring(0, 2)
    .toUpperCase() || "U";

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
        <AvatarFallback className="text-xs sm:text-sm">{initials}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col min-w-0">
        <span className="text-xs sm:text-sm font-medium truncate max-w-[150px] sm:max-w-none">{user.email}</span>
        <span className="text-xs text-muted-foreground hidden sm:inline">Free Plan</span>
      </div>
    </div>
  );
}