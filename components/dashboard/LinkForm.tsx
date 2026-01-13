"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { generateSlug, normalizeSlug, validateSlug } from "@/lib/utils/slug";
import type { QRConfig } from "@/types/qr";

const linkSchema = z.object({
  slug: z.string().min(3).max(50),
  original_url: z.string().url("Invalid URL"),
  autoGenerateSlug: z.boolean().optional(),
});

type LinkFormValues = z.infer<typeof linkSchema>;

const defaultQRConfig: QRConfig = {
  dots: "square",
  corners: "square",
  color: "#000000",
  errorCorrection: "H",
};

interface LinkFormProps {
  linkId?: string;
  initialData?: {
    slug: string;
    original_url: string;
  };
}

export function LinkForm({ linkId, initialData }: LinkFormProps) {
  const [loading, setLoading] = useState(false);
  const [autoGenerate, setAutoGenerate] = useState(!initialData);
  const router = useRouter();
  const supabase = createClient();

  const form = useForm<LinkFormValues>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      slug: initialData?.slug || "",
      original_url: initialData?.original_url || "",
      autoGenerateSlug: !initialData,
    },
  });

  const onSubmit = async (values: LinkFormValues) => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("You must be logged in");
        return;
      }

      let finalSlug = values.slug;

      if (autoGenerate || !values.slug) {
        finalSlug = generateSlug(8);
      } else {
        finalSlug = normalizeSlug(values.slug);
        if (!validateSlug(finalSlug)) {
          toast.error("Invalid slug format. Use only lowercase letters, numbers, and hyphens.");
          return;
        }
      }

      // Check if slug already exists (only for new links)
      if (!linkId) {
        const { data: existing } = await supabase
          .from("links")
          .select("id")
          .eq("slug", finalSlug)
          .single();

        if (existing) {
          toast.error("This slug is already taken. Please choose another.");
          return;
        }
      }

      const linkData = {
        user_id: user.id,
        slug: finalSlug,
        original_url: values.original_url,
        qr_config: defaultQRConfig,
      };

      if (linkId) {
        // Update existing link
        const { error } = await supabase
          .from("links")
          .update({
            original_url: values.original_url,
          })
          .eq("id", linkId)
          .eq("user_id", user.id);

        if (error) {
          toast.error(error.message);
          return;
        }

        toast.success("Link updated successfully");
      } else {
        // Create new link
        const { error } = await supabase.from("links").insert(linkData);

        if (error) {
          toast.error(error.message);
          return;
        }

        toast.success("Link created successfully");
      }

      router.push("/dashboard/links");
      router.refresh();
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {!linkId && (
          <FormField
            control={form.control}
            name="autoGenerateSlug"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={autoGenerate}
                    onCheckedChange={(checked) => {
                      setAutoGenerate(checked as boolean);
                      field.onChange(checked);
                    }}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Auto-generate slug</FormLabel>
                  <FormDescription>
                    Let us create a random slug for you
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        )}

        {(!autoGenerate || linkId) && (
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <Input
                    placeholder="my-bio"
                    {...field}
                    disabled={loading || !!linkId}
                  />
                </FormControl>
                <FormDescription>
                  {linkId
                    ? "Slug cannot be changed after creation"
                    : "Custom URL identifier (e.g., my-bio)"}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="original_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Destination URL</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="https://youtube.com/@username"
                  {...field}
                  disabled={loading}
                />
              </FormControl>
              <FormDescription>
                The URL your QR code will redirect to
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col sm:flex-row gap-4">
          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading
              ? linkId
                ? "Updating..."
                : "Creating..."
              : linkId
                ? "Update Link"
                : "Create Link"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}