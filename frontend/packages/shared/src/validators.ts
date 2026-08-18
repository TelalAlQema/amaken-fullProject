import { z } from "zod";
import {
  PROPERTY_TYPES,
  SELLING_TYPES,
  BHK_OPTIONS,
  DECORATION_TYPES,
  CURRENCIES,
  PLAN_TYPES,
  USER_TYPES,
  GENDERS,
} from "./constants";

// Strong password schema matching PHP validation (8-16 chars, upper+lower, digit, special)
export const strongPasswordSchema = z
  .string()
  .min(8, "Password must be 8-16 characters")
  .max(16, "Password must be 8-16 characters")
  .regex(/[A-Z]/, "Must contain uppercase letter")
  .regex(/[a-z]/, "Must contain lowercase letter")
  .regex(/\d/, "Must contain a number")
  .regex(/[!@#$%^&*(),.?":{}|<>]/, "Must contain special character");

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  uname: z.string().min(1, "First name is required").max(100),
  lname: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  password: strongPasswordSchema,
  utype: z.enum(USER_TYPES),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const verifyOtpSchema = z.object({
  email: z.string().email("Invalid email address"),
  code: z.string().length(6, "OTP must be 6 digits"),
});

// User profile schemas
export const updateProfileSchema = z.object({
  uname: z.string().min(1).max(100).optional(),
  lname: z.string().min(1).max(100).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  company: z.string().optional(),
  companyAddress: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  gender: z.enum(GENDERS).optional(),
  dateOfBirth: z.string().optional(),
  wphone: z.string().optional(),
});

export const updateSocialLinksSchema = z.object({
  fb: z.string().url().optional().or(z.literal("")),
  linkedin: z.string().url().optional().or(z.literal("")),
  tiktok: z.string().url().optional().or(z.literal("")),
  instagram: z.string().url().optional().or(z.literal("")),
  twitter: z.string().url().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: strongPasswordSchema,
});

// Property schemas
export const createPropertySchema = z.object({
  title: z.string().min(1, "Title is required").max(191),
  pcontent: z.string().optional(),
  type: z.enum(PROPERTY_TYPES),
  bhk: z.enum(BHK_OPTIONS),
  stype: z.enum(SELLING_TYPES),
  bedroom: z.string().optional(),
  bathroom: z.string().optional(),
  balcony: z.string().optional(),
  kitchen: z.string().optional(),
  hall: z.string().optional(),
  floor: z.string().optional(),
  size: z.string().optional(),
  price: z.string().min(1, "Price is required"),
  location: z.string().min(1, "Location is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  status: z.enum(["available", "sold out"]).optional(),
  totalfloor: z.string().optional(),
  plan: z.enum(PLAN_TYPES).optional(),
  decoration: z.enum(DECORATION_TYPES).optional(),
  curr: z.enum(CURRENCIES).optional(),
  feature: z.string().optional(),
  video1: z.string().url().optional().or(z.literal("")),
  video2: z.string().url().optional().or(z.literal("")),
  video3: z.string().url().optional().or(z.literal("")),
  brochure: z.string().url().optional().or(z.literal("")),
});

export const updatePropertySchema = createPropertySchema.partial();

// Lead schema
export const createLeadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  nationality: z.string().optional(),
  phone: z.string().min(1, "Phone number is required"),
});

// Contact schema
export const createContactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(1, "Message is required"),
});

// Feedback schema
export const createFeedbackSchema = z.object({
  rating: z.number().min(1).max(5),
  description: z.string().min(1, "Feedback is required"),
  receiveEmail: z.string().email("Invalid receiver email"),
});

// About schema
export const createAboutSchema = z.object({
  title: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  image: z.string().optional(),
});

// Team member schema
export const createTeamMemberSchema = z.object({
  fname: z.string().min(1, "First name is required"),
  lname: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  wnumber: z.string().optional(),
  pnumber: z.string().optional(),
  about: z.string().optional(),
  type: z.enum(["leader", "Team"]),
  fb: z.string().url().optional().or(z.literal("")),
  ig: z.string().url().optional().or(z.literal("")),
  linkdin: z.string().url().optional().or(z.literal("")),
  tiktok: z.string().url().optional().or(z.literal("")),
  twitter: z.string().url().optional().or(z.literal("")),
  position: z.string().optional(),
});

// City/State schemas
export const createCitySchema = z.object({
  cname: z.string().min(1, "City name is required"),
  sid: z.number().min(1, "State is required"),
});

export const createStateSchema = z.object({
  sname: z.string().min(1, "State name is required"),
});

// Admin schemas
export const adminPinSchema = z.object({
  pin: z.string().min(1, "PIN is required"),
});

export const adminLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const adminUserStatusSchema = z.object({
  action: z.enum(["activate", "deactivate", "freeze", "unfreeze"]),
});

export const adminRegisterSchema = z.object({
  aname: z.string().min(1, "First name is required").max(100),
  alname: z.string().min(1, "Last name is required").max(100),
  aemail: z.string().email("Invalid email address"),
  aphone: z.string().min(1, "Phone number is required"),
  apass: strongPasswordSchema,
  atype: z.string().min(1, "Admin type is required"),
});

// Query params schemas
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(12),
});

export const propertyFilterSchema = z.object({
  type: z.string().optional(),
  stype: z.string().optional(),
  plan: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  bedroom: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  bhk: z.string().optional(),
  decoration: z.string().optional(),
  search: z.string().optional(),
  sort: z.enum(["price_asc", "price_desc", "date_asc", "date_desc"]).optional(),
});
