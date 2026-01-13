"use client";

import { useEffect, useRef, useState } from "react";
import QRCodeStyling from "qr-code-styling";
import type { QRConfig } from "@/types/qr";

interface UseQRCodeOptions {
  config: QRConfig;
  data: string;
  size?: number;
}

export function useQRCode({ config, data, size }: UseQRCodeOptions) {
  const [qrCode, setQrCode] = useState<QRCodeStyling | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    // Use provided size or calculate from container
    let qrSize = size || 300;
    if (!size && ref.current) {
      const containerWidth = ref.current.parentElement?.clientWidth || 300;
      qrSize = Math.min(300, containerWidth - 32);
    }
    
    try {
      // Handle gradient colors
      const getColor = () => {
        if (typeof config.color === "string") {
          return config.color;
        }
        // For gradients, create a gradient object
        if (config.color.type === "linear") {
          return {
            type: "linear",
            rotation: 0,
            colorStops: [
              { offset: 0, color: config.color.colors[0] || "#000000" },
              { offset: 1, color: config.color.colors[1] || "#000000" },
            ],
          };
        }
        return "#000000";
      };

      const colorValue = getColor();

      const qrConfig: any = {
        width: qrSize,
        height: qrSize,
        type: "svg",
        data: data,
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
        
        // Apply logo shape styling via CSS clip-path or border-radius
        const logoShape = config.logoShape || "square";
        let borderRadius = 0;
        if (logoShape === "rounded") {
          borderRadius = 8;
        } else if (logoShape === "circle") {
          borderRadius = 50; // 50% for circle
        }

        qrConfig.imageOptions = {
          crossOrigin: "anonymous",
          margin: 5,
          hideBackgroundDots: true,
          imageSize: 0.4,
          // Note: qr-code-styling doesn't directly support borderRadius,
          // but we can apply it via CSS after rendering
        };
      }
      
      const qr = new QRCodeStyling(qrConfig);
      setQrCode(qr);

      const currentRef = ref.current;
      if (currentRef) {
        currentRef.innerHTML = "";
        qr.append(currentRef);
      }

      return () => {
        if (currentRef) {
          currentRef.innerHTML = "";
        }
      };
    } catch (error) {
      console.error("Error creating QR code:", error);
    }
  }, [config, data, size]);

  const download = async (format: "svg" | "png" = "png") => {
    if (!qrCode) return;
    qrCode.download({ extension: format });
  };

  return { ref, download, qrCode };
}