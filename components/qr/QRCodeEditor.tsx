"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { QRCodePreview } from "./QRCodePreview";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import type { QRConfig } from "@/types/qr";
import { Download, Palette } from "lucide-react";
import QRCodeStyling from "qr-code-styling";
import { LogoUpload } from "./LogoUpload";

interface QRCodeEditorProps {
  linkId: string;
  slug: string;
  initialConfig?: QRConfig;
}

const defaultConfig: QRConfig = {
  dots: "square",
  corners: "square",
  color: "#000000",
  logoShape: "square",
  errorCorrection: "H",
};

export function QRCodeEditor({
  linkId,
  slug,
  initialConfig = defaultConfig,
}: QRCodeEditorProps) {
  const [config, setConfig] = useState<QRConfig>(initialConfig);
  const [qrCode, setQrCode] = useState<QRCodeStyling | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const qrUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/r/${slug}`;

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    // Responsive QR code size
    const size = Math.min(300, window.innerWidth - 64);
    
    try {
      // Handle gradient colors
      const getColor = () => {
        if (typeof config.color === "string") {
          return config.color;
        }
        // For gradients, create a gradient object
        const gradientColor = config.color as { type: "linear"; colors: string[] };
        if ("type" in config.color && gradientColor.type === "linear") {
          return {
            type: "linear",
            rotation: 0,
            colorStops: [
              { offset: 0, color: gradientColor.colors[0] || "#000000" },
              { offset: 1, color: gradientColor.colors[1] || "#000000" },
            ],
          };
        }
        return "#000000";
      };

      const colorValue = getColor();

      const qrConfig: any = {
        width: size,
        height: size,
        type: "svg",
        data: qrUrl,
        dotsOptions: {
          color: colorValue,
          type: config.dots || "square",
        },
        cornersSquareOptions: {
          color: colorValue,
          type: config.corners || "square",
        },
        cornersDotOptions: {
          color: colorValue,
          type: config.corners === "dot" ? "dot" : config.corners === "extra-rounded" ? "extra-rounded" : "square",
        },
        backgroundOptions: {
          color: "#ffffff",
        },
        errorCorrectionLevel: config.errorCorrection || "H",
      };

      // Only add image and imageOptions if logo exists
      if (config.logo) {
        qrConfig.image = config.logo;
        qrConfig.imageOptions = {
          crossOrigin: "anonymous",
          margin: 5,
          hideBackgroundDots: true,
          imageSize: 0.4,
        };
      }
      
      const qr = new QRCodeStyling(qrConfig);
      setQrCode(qr);
    } catch (error) {
      console.error("Error creating QR code:", error);
    }
  }, [config, qrUrl]);

  const handleSave = async () => {
    try {
      console.log("[QRCodeEditor] Saving QR config:", {
        linkId,
        slug,
        config: {
          dots: config.dots,
          corners: config.corners,
          hasLogo: !!config.logo,
          logoShape: config.logoShape,
          hasGradient: typeof config.color === "object",
        },
      });
      
      const { error } = await supabase
        .from("links")
        .update({ qr_config: config })
        .eq("id", linkId);

      if (error) {
        console.error("[QRCodeEditor] Save failed:", {
          linkId,
          error: error.message,
          code: error.code,
        });
        toast.error(error.message);
        return;
      }

      console.log("[QRCodeEditor] QR config saved successfully:", linkId);
      toast.success("QR code configuration saved");
      router.refresh();
    } catch (error) {
      console.error("[QRCodeEditor] Unexpected error during save:", error);
      toast.error("Failed to save configuration");
    }
  };

  const handleDownload = async (format: "svg" | "png" = "png") => {
    if (!qrCode) return;
    qrCode.download({ extension: format });
  };

  return (
    <div className="grid gap-6 lg:gap-8 lg:grid-cols-2">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Customize QR Code</h2>
          <div className="space-y-4">
            <div>
              <Label>Dot Style</Label>
              <Select
                value={config.dots}
                onValueChange={(value: QRConfig["dots"]) =>
                  setConfig({ ...config, dots: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="square">Square</SelectItem>
                  <SelectItem value="rounded">Rounded</SelectItem>
                  <SelectItem value="extra-rounded">Extra Rounded</SelectItem>
                  <SelectItem value="classy">Classy</SelectItem>
                  <SelectItem value="classy-rounded">Classy Rounded</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Corner Style</Label>
              <Select
                value={config.corners}
                onValueChange={(value: QRConfig["corners"]) =>
                  setConfig({ ...config, corners: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="square">Square</SelectItem>
                  <SelectItem value="dot">Dot</SelectItem>
                  <SelectItem value="extra-rounded">Extra Rounded</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="use-gradient"
                  checked={typeof config.color === "object"}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setConfig({
                        ...config,
                        color: {
                          type: "linear",
                          colors: ["#000000", "#666666"],
                        },
                      });
                    } else {
                      setConfig({
                        ...config,
                        color: typeof config.color === "string" ? config.color : "#000000",
                      });
                    }
                  }}
                />
                <Label htmlFor="use-gradient" className="cursor-pointer flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Use Gradient
                </Label>
              </div>

              {typeof config.color === "object" && "type" in config.color && config.color.type === "linear" ? (
                <div className="space-y-3 pl-6">
                  {(() => {
                    const gradientColor = config.color as { type: "linear"; colors: string[] };
                    return (
                      <>
                        <div>
                          <Label className="text-sm">Gradient Color 1</Label>
                          <Input
                            type="color"
                            value={gradientColor.colors[0] || "#000000"}
                            onChange={(e) => {
                              setConfig({
                                ...config,
                                color: {
                                  type: "linear",
                                  colors: [e.target.value, gradientColor.colors[1] || "#000000"],
                                },
                              });
                            }}
                            className="h-10"
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Gradient Color 2</Label>
                          <Input
                            type="color"
                            value={gradientColor.colors[1] || "#000000"}
                            onChange={(e) => {
                              setConfig({
                                ...config,
                                color: {
                                  type: "linear",
                                  colors: [gradientColor.colors[0] || "#000000", e.target.value],
                                },
                              });
                            }}
                            className="h-10"
                          />
                        </div>
                      </>
                    );
                  })()}
                </div>
              ) : (
                <div>
                  <Label>Color</Label>
                  <Input
                    type="color"
                    value={typeof config.color === "string" ? config.color : "#000000"}
                    onChange={(e) =>
                      setConfig({ ...config, color: e.target.value })
                    }
                    className="h-12"
                  />
                </div>
              )}
            </div>

            {config.logo && (
              <div>
                <Label>Logo Shape</Label>
                <Select
                  value={config.logoShape || "square"}
                  onValueChange={(value) =>
                    setConfig({ ...config, logoShape: value as QRConfig["logoShape"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="square">Square</SelectItem>
                    <SelectItem value="rounded">Rounded</SelectItem>
                    <SelectItem value="circle">Circle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <LogoUpload
                currentLogo={config.logo}
                onUploadComplete={(url) =>
                  setConfig({ ...config, logo: url || undefined })
                }
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={handleSave} className="w-full sm:flex-1">
                Save Configuration
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDownload("png")}
                className="w-full sm:flex-1"
              >
                <Download className="mr-2 h-4 w-4" />
                Download PNG
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDownload("svg")}
                className="w-full sm:flex-1"
              >
                <Download className="mr-2 h-4 w-4" />
                Download SVG
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center lg:items-start">
        <h3 className="text-lg font-semibold mb-4 w-full text-center lg:text-left">Preview</h3>
        <div className="w-full flex justify-center">
          <QRCodePreview config={config} data={qrUrl} />
        </div>
      </div>
    </div>
  );
}