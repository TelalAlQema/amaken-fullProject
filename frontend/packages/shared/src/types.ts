// User types
export type UserType = "User" | "Agent" | "Builder";
export type Gender = "Male" | "Female" | "Other";

export interface User {
  uid: number;
  uname: string;
  lname: string;
  uemail: string;
  uphone: string;
  upass: string;
  utype: UserType;
  uimage: string;
  date: string;
  dateofbirth: string | null;
  Address: string | null;
  deactivate: number;
  company: string | null;
  ucompanylogo: string | null;
  state: string | null;
  city: string | null;
  Companyaddress: string | null;
  ugender: Gender | null;
  uloginvalue: number;
  wphone: string | null;
  fb: string | null;
  linkedin: string | null;
  tiktok: string | null;
  instagram: string | null;
  twitter: string | null;
  website: string | null;
  adminblock: number;
  editprofile: Date | null;
  editcomlogo: Date | null;
  editpropic: Date | null;
  linkpagedate: Date | null;
  lastseen: Date | null;
  udate: Date | null;
}

// Admin types
export interface Admin {
  aid: number;
  aname: string;
  aemail: string;
  aphone: string;
  apass: string;
  atype: string;
  aimage: string;
  joinadate: string;
  adateofbirth: string | null;
  alname: string;
  aAddress: string | null;
  awphone: string | null;
  adeactivate: number;
  agency: string | null;
  companylogo: string | null;
  companywebsite: string | null;
  afb: string | null;
  ainstagram: string | null;
  atwitter: string | null;
  atiktok: string | null;
  alinkedin: string | null;
  astate: string | null;
  acity: string | null;
  acompanyAddress: string | null;
  agender: Gender | null;
  onlinetime: string | null;
  aloginvalue: number;
  adminblock: number;
  main: string | null;
  website: string | null;
}

// Property types
export type PropertyType =
  | "Villa"
  | "Apartment"
  | "Town House"
  | "Pent House"
  | "Compound"
  | "Duplex"
  | "Full Floor"
  | "Half Floor"
  | "Building"
  | "Bulk Sale Unit"
  | "Bungalow"
  | "Office"
  | "Shop"
  | "Mall"
  | "Hotel"
  | "Hotel Apartment or Flat"
  | "Restaurant"
  | "Warehouse"
  | "Bedspace"
  | "Partition"
  | "Others";

export type SellingType = "rent" | "sale" | "lease";
export type BHK =
  | "Open"
  | "1 BHK"
  | "2 BHK"
  | "3 BHK"
  | "4 BHK"
  | "5 BHK"
  | "1,2 BHK"
  | "2,3 BHK"
  | "2,3,4 BHK"
  | "2,3,4,5 BHK"
  | "2,3,4,5,6 BHK";
export type PropertyStatus = "available" | "sold out";
export type PlanType = "Off Plan" | "Secondary" | "Ready to Move";
export type Decoration = "Furnished" | "Unfurnished" | "Partially Furnished";
export type Currency = "AED" | "USD" | "EUR" | "GBP" | "SAR" | "PKR" | "INR";

export interface Property {
  id: number;
  email: string;
  date: string;
  title: string;
  pcontent: string;
  type: PropertyType;
  bhk: BHK;
  stype: SellingType;
  bedroom: string;
  bathroom: string;
  balcony: string;
  kitchen: string;
  hall: string;
  floor: string;
  size: string;
  price: string;
  location: string;
  city: string;
  state: string;
  pimage: string;
  pimage1: string;
  pimage2: string;
  pimage3: string;
  pimage4: string;
  uid: number;
  status: PropertyStatus;
  mapimage: string;
  topmapimage: string;
  groundmapimage: string;
  totalfloor: string;
  isFeatured: number;
  offer: number;
  plan: PlanType;
  saleid: number;
  decoration: Decoration;
  curr: Currency;
  feature: string;
  deactivate: number;
  adminapproval: number;
  video1: string;
  video2: string;
  video3: string;
  brochure: string;
  blocked_user: number;
  adminblock: number;
  aemail?: string;
}

// Other table types
export interface PropertyLead {
  id: number;
  pid: number;
  title: string;
  saleid: string;
  name: string;
  email: string;
  nationality: string;
  phone: string;
  ip: string;
  device: string;
  created_at: Date;
}

export interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export interface Feedback {
  fid: number;
  uid: number | null;
  agid: number | null;
  fdescription: string;
  status: number;
  rating: number;
  created_at: Date;
  send_email: string;
  receive_email: string;
  fblock: number;
  fdeactivate: number;
  fadminblock: number;
}

export interface About {
  id: number;
  title: string | null;
  content: string;
  image: string | null;
}

export interface TeamMember {
  id: number;
  fname: string;
  lname: string;
  email: string;
  wnumber: string;
  pnumber: string;
  about: string;
  type: "leader" | "Team";
  fb: string | null;
  ig: string | null;
  linkdin: string | null;
  tiktok: string | null;
  twitter: string | null;
  image: string;
  position: string;
}

export interface City {
  cid: number;
  cname: string;
  sid: number;
}

export interface State {
  sid: number;
  sname: string;
}

export interface DelAccount {
  id: number;
  email: string;
  type: "delete" | "block" | "deactivate";
  utype: "user" | "admin";
  date: Date | string;
}

export interface DeviceToken {
  id: number;
  user_id: number | null;
  token: string;
}

export interface Pin {
  id: number;
  upin: string;
}

export interface RegisterEmail {
  id: number;
  email: string;
  name: string;
  type: string;
  utype: string;
}

export interface AdminSocial {
  admin_id: number;
  website: string | null;
  facebook: string | null;
  linkedin: string | null;
  instagram: string | null;
  tiktok: string | null;
  twitter: string | null;
  updated_at: Date;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
