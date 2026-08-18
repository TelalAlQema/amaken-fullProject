// Property types
export const PROPERTY_TYPES = [
  "Villa",
  "Apartment",
  "Town House",
  "Pent House",
  "Compound",
  "Duplex",
  "Full Floor",
  "Half Floor",
  "Building",
  "Bulk Sale Unit",
  "Bungalow",
  "Office",
  "Shop",
  "Mall",
  "Hotel",
  "Hotel Apartment or Flat",
  "Restaurant",
  "Warehouse",
  "Bedspace",
  "Partition",
  "Others",
] as const;

export const SELLING_TYPES = ["rent", "sale", "lease"] as const;

export const BHK_OPTIONS = [
  "Open",
  "1 BHK",
  "2 BHK",
  "3 BHK",
  "4 BHK",
  "5 BHK",
  "1,2 BHK",
  "2,3 BHK",
  "2,3,4 BHK",
  "2,3,4,5 BHK",
  "2,3,4,5,6 BHK",
] as const;

export const PROPERTY_STATUS = ["available", "sold out"] as const;

export const PLAN_TYPES = ["Off Plan", "Secondary", "Ready to Move"] as const;

export const DECORATION_TYPES = [
  "Furnished",
  "Unfurnished",
  "Partially Furnished",
] as const;

export const CURRENCIES = ["AED", "USD", "EUR", "GBP", "SAR", "PKR", "INR"] as const;

export const USER_TYPES = ["User", "Agent", "Builder"] as const;

export const GENDERS = ["Male", "Female", "Other"] as const;

// Pagination defaults
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 12;
export const MAX_LIMIT = 100;

// File upload limits
export const MAX_FILE_SIZE = 6 * 1024 * 1024; // 6MB
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

// Property visibility conditions (all must be true for public visibility)
export const PROPERTY_VISIBILITY = {
  DEACTIVATE: 1,
  ADMIN_APPROVAL: 1,
  BLOCKED_USER: 1,
  ADMIN_BLOCK: 0,
} as const;

// Contact info
export const CONTACT = {
  PHONE: "+971 55 261 5993",
  EMAIL: "info@amaken-realestate.com",
  WHATSAPP: "+971552615993",
  ADDRESS: "Dubai, United Arab Emirates",
} as const;

// Site info
export const SITE = {
  NAME: "Amaken Real Estate",
  URL: "https://amaken-realestate.com",
  TAGLINE: "Your Trusted Real Estate Partner in Dubai",
} as const;

// Social links defaults
export const SOCIAL_PLATFORMS = [
  "facebook",
  "instagram",
  "twitter",
  "linkedin",
  "tiktok",
  "website",
] as const;
