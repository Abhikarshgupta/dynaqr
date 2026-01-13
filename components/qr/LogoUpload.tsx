"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";

interface LogoUploadProps {
  onUploadComplete: (url: string) => void;
  currentLogo?: string;
}

export function LogoUpload({ onUploadComplete, currentLogo }: LogoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentLogo || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const { user } = useAuth();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Supabase Storage
    await handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    if (!user) {
      toast.error("You must be logged in");
      return;
    }

    try {
      setUploading(true);

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      // Don't include bucket name in path - it's already specified in .from("qr-logos")
      const filePath = fileName;

      // Delete old logo if exists
      if (currentLogo) {
        try {
          // Extract the path from the full URL
          // URL format: https://...supabase.co/storage/v1/object/public/qr-logos/userId/filename.png
          const urlParts = currentLogo.split("/qr-logos/");
          if (urlParts.length > 1) {
            const oldPath = urlParts[1];
            await supabase.storage.from("qr-logos").remove([oldPath]);
          }
        } catch (error) {
          // Ignore errors when deleting old logo
          console.warn("Could not delete old logo:", error);
        }
      }

      // Upload new file
      const { error: uploadError } = await supabase.storage
        .from("qr-logos")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        toast.error(uploadError.message);
        return;
      }

      // Get public URL - construct URL directly without /public/ segment
      // URL format: https://[project].supabase.co/storage/v1/object/qr-logos/[path]
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!supabaseUrl) {
        toast.error("Supabase URL not configured");
        return;
      }
      
      // Remove trailing slash if present
      const baseUrl = supabaseUrl.replace(/\/$/, "");
      const publicUrl = `${baseUrl}/storage/v1/object/qr-logos/${filePath}`;

      onUploadComplete(publicUrl);
      toast.success("Logo uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload logo");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!currentLogo || !user) return;

    try {
      // Extract the path from the full URL
      // URL format: https://...supabase.co/storage/v1/object/qr-logos/userId/filename.png
      const urlParts = currentLogo.split("/qr-logos/");
      if (urlParts.length > 1) {
        const path = urlParts[1];
        await supabase.storage.from("qr-logos").remove([path]);
        setPreview(null);
        onUploadComplete("");
        toast.success("Logo removed");
      } else {
        toast.error("Invalid logo URL");
      }
    } catch (error) {
      console.error("Failed to remove logo:", error);
      toast.error("Failed to remove logo");
    }
  };

  return (
    <div className="space-y-4">
      <Label>Logo (PNG/SVG)</Label>
      {preview && (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Logo preview"
            className="h-24 w-24 sm:h-32 sm:w-32 object-contain border rounded"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      <div className="flex gap-4">
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/svg+xml"
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full sm:w-auto"
        >
          <Upload className="mr-2 h-4 w-4" />
          {uploading ? "Uploading..." : "Upload Logo"}
        </Button>
      </div>
      <p className="text-xs sm:text-sm text-muted-foreground">
        Upload a PNG or SVG logo to display in the center of your QR code. Max size: 5MB
      </p>
    </div>
  );
}