import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ASSET_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");

const PROPERTY_IMAGE_BASE = (process.env.NEXT_PUBLIC_PROPERTY_IMAGE_BASE || "https://amaken-realestate.com/admin/property").replace(/\/+$/, "");

export function getAssetUrl(path?: string | null): string {
  if (!path) return "";
  if (/^(https?:)?\/\//.test(path) || path.startsWith("data:")) return path;
  if (path.startsWith("/uploads/properties/")) {
    const filename = path.slice("/uploads/properties/".length).split("?")[0];
    return `${PROPERTY_IMAGE_BASE}/${encodeURI(filename)}`;
  }
  return path.startsWith("/uploads/") ? `${ASSET_BASE}${path}` : path;
}

export function formatPrice(price: number, currency: string = "AED"): string {
  const cur = currency.trim().toUpperCase();
  try {
    return new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: cur,
      maximumFractionDigits: 0,
    }).format(price);
  } catch {
    return `${cur} ${new Intl.NumberFormat("en-AE", { maximumFractionDigits: 0 }).format(price)}`;
  }
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getPropertyStatusColor(status: string): string {
  switch (status) {
    case "available":
      return "text-green-600 bg-green-100";
    case "sold out":
      return "text-red-600 bg-red-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
}
