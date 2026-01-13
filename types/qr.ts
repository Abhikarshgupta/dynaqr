export type QRConfig = {
  dots: "square" | "rounded" | "extra-rounded" | "classy" | "classy-rounded";
  corners: "square" | "dot" | "extra-rounded";
  color: string | { type: "linear"; colors: string[] };
  logo?: string;
  logoShape?: "square" | "circle" | "rounded";
  errorCorrection: "H";
};

export type Link = {
  id: string;
  user_id: string;
  slug: string;
  original_url: string;
  qr_config: QRConfig;
  scan_count: number;
  created_at: string;
  updated_at: string;
};