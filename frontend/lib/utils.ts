import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, currency: string = "AED"): string {
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0,
  }).format(price);
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
