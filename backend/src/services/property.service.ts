import prisma from "../lib/prisma";
import { AppError } from "../middleware/errorHandler";
import {
  processAndSaveImage,
  deleteFileIfExists,
  getPropertyUploadDir,
  getFilePath,
} from "./upload.service";

const VISIBLE_CONDITIONS = {
  deactivate: 1,
  adminapproval: 1,
  blocked_user: 1,
  adminblock: 0,
};

// ─── Property CRUD ──────────────────────────────────────────────────

export async function createProperty(
  email: string,
  data: Record<string, any>,
  files?: Express.Multer.File[]
) {
  const user = await prisma.user.findFirst({ where: { uemail: email } });
  if (!user) throw new AppError("User not found", 404, "USER_NOT_FOUND");

  const propDir = getPropertyUploadDir();
  const saleid = Math.floor(100000 + Math.random() * 900000);

  const imageData: Record<string, string> = {};
  const imageFields = [
    "pimage", "pimage1", "pimage2", "pimage3", "pimage4",
    "mapimage", "topmapimage", "groundmapimage",
  ];

  if (files && files.length > 0) {
    for (const file of files) {
      const field = file.fieldname;
      if (imageFields.includes(field)) {
        imageData[field] = await processAndSaveImage(file, propDir, `prop_${field}`, 1200, 1200);
      }
    }
  }

  const now = new Date();
  const dateStr = `${now.getDate().toString().padStart(2, "0")}-${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][now.getMonth()]}-${now.getFullYear()}`;

  const property = await prisma.property.create({
    data: {
      email,
      date: dateStr,
      title: data.title?.substring(0, 191) || "",
      pcontent: data.pcontent || "",
      type: data.type || "Villa",
      bhk: data.bhk || "Open",
      stype: data.stype || "sale",
      bedroom: String(data.bedroom || ""),
      bathroom: String(data.bathroom || ""),
      balcony: String(data.balcony || ""),
      kitchen: String(data.kitchen || ""),
      hall: String(data.hall || ""),
      floor: String(data.floor || ""),
      size: String(data.size || ""),
      price: String(data.price || ""),
      curr: data.curr || "AED",
      location: data.location || "",
      city: data.city || "",
      state: data.state || "",
      feature: data.feature || "",
      pimage: imageData.pimage || "",
      pimage1: imageData.pimage1 || "",
      pimage2: imageData.pimage2 || "",
      pimage3: imageData.pimage3 || "",
      pimage4: imageData.pimage4 || "",
      uid: user.uid,
      status: data.status || "available",
      mapimage: imageData.mapimage || "",
      topmapimage: imageData.topmapimage || "",
      groundmapimage: imageData.groundmapimage || "",
      totalfloor: String(data.totalfloor || ""),
      isFeatured: data.isFeatured === "1" || data.isFeatured === 1 ? 1 : 0,
      offer: data.offer === "1" || data.offer === 1 ? 1 : 0,
      plan: data.plan || "Secondary",
      saleid,
      decoration: data.decoration || "Unfurnished",
      deactivate: 1,
      adminapproval: 0,
      video1: data.video1 || "",
      video2: data.video2 || "",
      video3: data.video3 || "",
      brochure: data.brochure || "",
      blocked_user: 1,
      adminblock: 0,
    },
  });

  return property;
}

export async function updateProperty(
  propertyId: number,
  userId: number,
  email: string,
  data: Record<string, any>,
  files?: Express.Multer.File[]
) {
  const property = await prisma.property.findFirst({ where: { id: propertyId } });
  if (!property) throw new AppError("Property not found", 404, "PROPERTY_NOT_FOUND");
  if (property.uid !== userId) throw new AppError("Not authorized", 403, "FORBIDDEN");

  const propDir = getPropertyUploadDir();
  const imageData: Record<string, string> = {};
  const imageFields = [
    "pimage", "pimage1", "pimage2", "pimage3", "pimage4",
    "mapimage", "topmapimage", "groundmapimage",
  ];

  if (files && files.length > 0) {
    for (const file of files) {
      const field = file.fieldname;
      if (imageFields.includes(field)) {
        const oldFile = (property as any)[field];
        if (oldFile) {
          deleteFileIfExists(getFilePath(propDir, oldFile));
        }
        imageData[field] = await processAndSaveImage(file, propDir, `prop_${field}`, 1200, 1200);
      }
    }
  }

  const updateData: Record<string, any> = {};
  const allowedFields = [
    "title", "pcontent", "type", "bhk", "stype", "bedroom", "bathroom",
    "balcony", "kitchen", "hall", "floor", "size", "price", "curr",
    "location", "city", "state", "feature", "status", "totalfloor",
    "isFeatured", "offer", "plan", "decoration", "video1", "video2",
    "video3", "brochure",
  ];

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      if (field === "isFeatured" || field === "offer") {
        updateData[field] = data[field] === "1" || data[field] === 1 ? 1 : 0;
      } else {
        updateData[field] = String(data[field]);
      }
    }
  }

  for (const [key, value] of Object.entries(imageData)) {
    updateData[key] = value;
  }

  return prisma.property.update({
    where: { id: propertyId },
    data: updateData,
  });
}

export async function deleteProperty(propertyId: number, userId?: number) {
  const property = await prisma.property.findFirst({ where: { id: propertyId } });
  if (!property) throw new AppError("Property not found", 404, "PROPERTY_NOT_FOUND");
  if (userId && property.uid !== userId) throw new AppError("Not authorized", 403, "FORBIDDEN");

  const propDir = getPropertyUploadDir();
  const imageFields = [
    "pimage", "pimage1", "pimage2", "pimage3", "pimage4",
    "mapimage", "topmapimage", "groundmapimage",
  ];
  for (const field of imageFields) {
    const filename = (property as any)[field];
    if (filename) {
      deleteFileIfExists(getFilePath(propDir, filename));
    }
  }

  await prisma.propertyLead.deleteMany({ where: { pid: propertyId } });
  await prisma.property.delete({ where: { id: propertyId } });

  return { message: "Property deleted" };
}

// ─── Public Property Listing (4-condition visibility) ────────────────

export async function listVisibleProperties(filters: {
  page?: number;
  limit?: number;
  type?: string;
  stype?: string;
  status?: string;
  plan?: string;
  minPrice?: string;
  maxPrice?: string;
  bhk?: string;
  city?: string;
  state?: string;
  search?: string;
  sort?: string;
  isFeatured?: number;
  offer?: number;
}) {
  const page = filters.page || 1;
  const limit = Math.min(filters.limit || 20, 100);

  const where: any = { ...VISIBLE_CONDITIONS };

  if (filters.type) where.type = filters.type as any;
  if (filters.stype) where.stype = filters.stype as any;
  if (filters.status) where.status = filters.status as any;
  if (filters.plan) where.plan = filters.plan as any;
  if (filters.bhk) where.bhk = filters.bhk as any;
  if (filters.city) where.city = { contains: filters.city };
  if (filters.state) where.state = { contains: filters.state };
  if (filters.isFeatured !== undefined) where.isFeatured = filters.isFeatured;
  if (filters.offer !== undefined) where.offer = filters.offer;

  if (filters.minPrice || filters.maxPrice) {
    where.price = {};
    if (filters.minPrice) where.price.gte = filters.minPrice;
    if (filters.maxPrice) where.price.lte = filters.maxPrice;
  }

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search } },
      { location: { contains: filters.search } },
      { city: { contains: filters.search } },
      { state: { contains: filters.search } },
    ];
  }

  let orderBy: any = { id: "desc" };
  if (filters.sort === "price_asc") orderBy = { price: "asc" };
  else if (filters.sort === "price_desc") orderBy = { price: "desc" };
  else if (filters.sort === "date_asc") orderBy = { id: "asc" };

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: {
          select: { uid: true, uname: true, lname: true, uimage: true, uemail: true, utype: true },
        },
      },
    }),
    prisma.property.count({ where }),
  ]);

  return {
    properties,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getPropertyById(id: number) {
  const property = await prisma.property.findFirst({
    where: { id },
    include: {
      user: {
        select: {
          uid: true, uname: true, lname: true, uemail: true,
          uimage: true, utype: true, uphone: true, wphone: true,
          company: true, ucompanylogo: true, state: true, city: true,
          fb: true, linkedin: true, tiktok: true, instagram: true, twitter: true, website: true,
        },
      },
      admin: {
        select: {
          aid: true, aname: true, alname: true, aemail: true,
          aimage: true, atype: true, companylogo: true,
        },
      },
      leads: true,
    },
  });

  if (!property) throw new AppError("Property not found", 404, "PROPERTY_NOT_FOUND");
  return property;
}

export async function getPropertiesByState(stateSlug: string, page = 1, limit = 20) {
  const where: any = {
    ...VISIBLE_CONDITIONS,
    state: { contains: stateSlug },
  };

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      orderBy: { id: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: {
          select: { uid: true, uname: true, lname: true, uimage: true },
        },
      },
    }),
    prisma.property.count({ where }),
  ]);

  return {
    properties,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

// ─── Owner Properties ───────────────────────────────────────────────

export async function getMyProperties(userId: number, page = 1, limit = 50) {
  const where = { uid: userId };

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      orderBy: { id: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.property.count({ where }),
  ]);

  return {
    properties,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

// ─── Admin Property Management ──────────────────────────────────────

export async function adminListProperties(
  page = 1,
  limit = 50,
  filters?: { status?: string; stype?: string; type?: string; search?: string }
) {
  const where: any = {};
  if (filters?.status) where.status = filters.status as any;
  if (filters?.stype) where.stype = filters.stype as any;
  if (filters?.type) where.type = filters.type as any;
  if (filters?.search) {
    where.OR = [
      { title: { contains: filters.search } },
      { location: { contains: filters.search } },
      { city: { contains: filters.search } },
      { email: { contains: filters.search } },
    ];
  }

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      orderBy: { id: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: {
          select: { uid: true, uname: true, lname: true, uemail: true },
        },
      },
    }),
    prisma.property.count({ where }),
  ]);

  return {
    properties,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function adminListPendingApproval(page = 1, limit = 50) {
  const where = { adminapproval: 0 };

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      orderBy: { id: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: {
          select: { uid: true, uname: true, lname: true, uemail: true },
        },
      },
    }),
    prisma.property.count({ where }),
  ]);

  return {
    properties,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

// ─── Property Approval Workflow ─────────────────────────────────────

export async function approveProperty(propertyId: number) {
  const property = await prisma.property.findFirst({ where: { id: propertyId } });
  if (!property) throw new AppError("Property not found", 404, "PROPERTY_NOT_FOUND");

  return prisma.property.update({
    where: { id: propertyId },
    data: { adminapproval: 1 },
  });
}

export async function disapproveProperty(propertyId: number) {
  const property = await prisma.property.findFirst({ where: { id: propertyId } });
  if (!property) throw new AppError("Property not found", 404, "PROPERTY_NOT_FOUND");

  return prisma.property.update({
    where: { id: propertyId },
    data: { adminapproval: 0 },
  });
}

export async function hideProperty(propertyId: number) {
  const property = await prisma.property.findFirst({ where: { id: propertyId } });
  if (!property) throw new AppError("Property not found", 404, "PROPERTY_NOT_FOUND");

  return prisma.property.update({
    where: { id: propertyId },
    data: { adminapproval: 0 },
  });
}

export async function displayProperty(propertyId: number) {
  const property = await prisma.property.findFirst({ where: { id: propertyId } });
  if (!property) throw new AppError("Property not found", 404, "PROPERTY_NOT_FOUND");

  return prisma.property.update({
    where: { id: propertyId },
    data: { adminapproval: 1 },
  });
}

export async function freezeProperty(propertyId: number) {
  const property = await prisma.property.findFirst({ where: { id: propertyId } });
  if (!property) throw new AppError("Property not found", 404, "PROPERTY_NOT_FOUND");

  return prisma.property.update({
    where: { id: propertyId },
    data: { adminblock: 1 },
  });
}

export async function releaseProperty(propertyId: number) {
  const property = await prisma.property.findFirst({ where: { id: propertyId } });
  if (!property) throw new AppError("Property not found", 404, "PROPERTY_NOT_FOUND");

  return prisma.property.update({
    where: { id: propertyId },
    data: { adminblock: 0 },
  });
}
