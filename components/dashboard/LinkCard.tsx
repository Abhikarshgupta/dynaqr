"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { MoreVertical, ExternalLink, Edit, Trash2, Copy, QrCode } from "lucide-react";
import type { Link as LinkType } from "@/types/qr";
import { format } from "date-fns";
import { QRCodePreview } from "@/components/qr/QRCodePreview";

interface LinkCardProps {
  link: LinkType;
  onDelete?: () => void;
}

export function LinkCard({ link, onDelete }: LinkCardProps) {
  const [loading, setLoading] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const qrUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/r/${link.slug}`;
  const redirectUrl = `/r/${link.slug}`;
  const qrConfig = (link.qr_config as any) || {
    dots: "square",
    corners: "square",
    color: "#000000",
    errorCorrection: "H",
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this link?")) {
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from("links")
        .delete()
        .eq("id", link.id);

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Link deleted successfully");
      onDelete?.();
      router.refresh();
    } catch (error) {
      toast.error("Failed to delete link");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(qrUrl);
    toast.success("QR URL copied to clipboard");
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
              <span className="truncate">{link.slug}</span>
              <Badge variant="secondary" className="w-fit">{link.scan_count} scans</Badge>
            </CardTitle>
            <CardDescription className="mt-1 break-all text-xs sm:text-sm">
              {link.original_url}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setQrDialogOpen(true)}>
                <QrCode className="mr-2 h-4 w-4" />
                View QR Code
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopy}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Redirect URL
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={redirectUrl} target="_blank">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Test Redirect
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/links/${link.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Link
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/qr-editor/${link.id}`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Customize QR Style
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* QR Code Preview */}
          <div className="flex items-center justify-center">
            <QRCodePreview 
              config={qrConfig} 
              data={qrUrl}
              size={100}
            />
          </div>
          
          {/* View QR Button */}
          <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full" size="sm">
                <QrCode className="mr-2 h-4 w-4" />
                View QR Code
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>QR Code: {link.slug}</DialogTitle>
                <DialogDescription>
                  Scan this QR code to redirect to: {link.original_url}
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center justify-center p-6 bg-white rounded-lg border">
                <div className="w-[300px] h-[300px] flex items-center justify-center">
                  <QRCodePreview 
                    config={qrConfig} 
                    data={qrUrl}
                  />
                </div>
              </div>
              <div className="text-xs text-muted-foreground text-center">
                <p className="font-medium mb-1">Redirect URL:</p>
                <p className="break-all">{qrUrl}</p>
                <p className="mt-2 text-xs">This QR code redirects to your destination URL</p>
              </div>
            </DialogContent>
          </Dialog>

          {/* Link Info */}
          <div className="space-y-2 text-xs sm:text-sm text-muted-foreground">
            <div className="break-all">
              <span className="font-medium">Destination:</span> {link.original_url}
            </div>
            <div>
              <span className="font-medium">Created:</span> {format(new Date(link.created_at), "MMM d, yyyy")}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}