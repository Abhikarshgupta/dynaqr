"use client";

import { useEffect } from "react";
import { useQRCode } from "@/lib/hooks/useQRCode";
import type { QRConfig } from "@/types/qr";

interface QRCodePreviewProps {
  config: QRConfig;
  data: string;
  size?: number;
}

export function QRCodePreview({ config, data, size }: QRCodePreviewProps) {
  const { ref } = useQRCode({ config, data, size });

  // Apply logo shape styling via CSS
  useEffect(() => {
    if (ref.current && config.logo && config.logoShape) {
      const svg = ref.current.querySelector("svg");
      if (svg) {
        const image = svg.querySelector("image");
        if (image) {
          const logoShape = config.logoShape || "square";
          if (logoShape === "rounded") {
            image.setAttribute("rx", "8");
            image.setAttribute("ry", "8");
          } else if (logoShape === "circle") {
            // For circle, we need to use clipPath
            const clipPathId = `logo-clip-${Date.now()}`;
            let defs = svg.querySelector("defs");
            if (!defs) {
              defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
              svg.insertBefore(defs, svg.firstChild);
            }
            
            // Remove existing clipPath if any
            const existingClip = defs.querySelector(`#${clipPathId}`);
            if (existingClip) {
              existingClip.remove();
            }
            
            const clipPath = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
            clipPath.setAttribute("id", clipPathId);
            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            const size = parseFloat(image.getAttribute("width") || "0");
            circle.setAttribute("cx", String(size / 2));
            circle.setAttribute("cy", String(size / 2));
            circle.setAttribute("r", String(size / 2));
            clipPath.appendChild(circle);
            defs.appendChild(clipPath);
            image.setAttribute("clip-path", `url(#${clipPathId})`);
          }
        }
      }
    }
  }, [ref, config.logo, config.logoShape]);

  return (
    <div 
      className="flex items-center justify-center bg-white rounded-lg border"
      style={size ? { width: `${size}px`, height: `${size}px`, padding: '8px' } : { padding: '16px 24px', width: '100%' }}
    >
      <div 
        ref={ref} 
        className="flex items-center justify-center"
        style={size ? { width: '100%', height: '100%' } : { width: '100%' }}
      />
    </div>
  );
}