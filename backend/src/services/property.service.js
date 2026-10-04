const { prisma } = require("../platform/db/prisma");
const { AppError } = require("../middleware/errorHandler");
const {
  processAndSaveImage,
  deleteFileIfExists,
  getPropertyUploadDir,
  getFilePath,
} = require("./upload.service");

const VISIBLE_CONDITIONS = {
  deactivate: 1,
  adminapproval: 1,
  blocked_user: 1,
  adminblock: 0,
};

// ─── Property CRUD ──────────────────────────────────────────────────

async function createProperty(email, data, files) {
  const user = await prisma.user.findFirst({ where: { uemail: email } });
  if (!user) throw new AppError("User not found", 404, "USER_NOT_FOUND");

  const propDir = getPropertyUploadDir();
  const saleid = Math.floor(100000 + Math.random() * 900000);

  const imageData = {};
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

async function updateProperty(propertyId, userId, email, data, files) {
  const property = await prisma.property.findFirst({ where: { id: propertyId } });
  if (!property) throw new AppError("Property not found", 404, "PROPERTY_NOT_FOUND");
  if (property.uid !== userId) throw new AppError("Not authorized", 403, "FORBIDDEN");

  const propDir = getPropertyUploadDir();
  const imageData = {};
  const imageFields = [
    "pimage", "pimage1", "pimage2", "pimage3", "pimage4",
    "mapimage", "topmapimage", "groundmapimage",
  ];

  if (files && files.length > 0) {
    for (const file of files) {
      const field = file.fieldname;
      if (imageFields.includes(field)) {
        const oldFile = property[field];
        if (oldFile) {
          deleteFileIfExists(getFilePath(propDir, oldFile));
        }
        imageData[field] = await processAndSaveImage(file, propDir, `prop_${field}`, 1200, 1200);
      }
    }
  }

  const updateData = {};
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

async function deleteProperty(propertyId, userId) {
  const property = await prisma.property.findFirst({ where: { id: propertyId } });
  if (!property) throw new AppError("Property not found", 404, "PROPERTY_NOT_FOUND");
  if (userId && property.uid !== userId) throw new AppError("Not authorized", 403, "FORBIDDEN");

  const propDir = getPropertyUploadDir();
  const imageFields = [
    "pimage", "pimage1", "pimage2", "pimage3", "pimage4",
    "mapimage", "topmapimage", "groundmapimage",
  ];
  for (const field of imageFields) {
    const filename = property[field];
    if (filename) {
      deleteFileIfExists(getFilePath(propDir, filename));
    }
  }

  await prisma.propertyLead.deleteMany({ where: { pid: propertyId } });
  await prisma.property.delete({ where: { id: propertyId } });

  return { message: "Property deleted" };
}

// ─── Public Property Listing (4-condition visibility) ────────────────

async function listVisibleProperties(filters) {
  const page = filters.page || 1;
  const limit = Math.min(filters.limit || 20, 100);

  const where = { ...VISIBLE_CONDITIONS };

  if (filters.type) where.type = filters.type;
  if (filters.stype) where.stype = filters.stype;
  if (filters.status) where.status = filters.status;
  if (filters.plan) where.plan = filters.plan;
  if (filters.bhk) where.bhk = filters.bhk;
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

  let orderBy = { id: "desc" };
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

async function getPropertyById(id) {
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

async function getPropertiesByState(stateSlug, page = 1, limit = 20) {
  const where = {
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

async function getMyProperties(userId, page = 1, limit = 50) {
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

async function adminListProperties(page = 1, limit = 50, filters) {
  const where = {};
  if (filters?.status) where.status = filters.status;
  if (filters?.stype) where.stype = filters.stype;
  if (filters?.type) where.type = filters.type;
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

async function adminListPendingApproval(page = 1, limit = 50) {
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

async function approveProperty(propertyId) {
  const property = await prisma.property.findFirst({ where: { id: propertyId } });
  if (!property) throw new AppError("Property not found", 404, "PROPERTY_NOT_FOUND");

  return prisma.property.update({
    where: { id: propertyId },
    data: { adminapproval: 1 },
  });
}

async function disapproveProperty(propertyId) {
  const property = await prisma.property.findFirst({ where: { id: propertyId } });
  if (!property) throw new AppError("Property not found", 404, "PROPERTY_NOT_FOUND");

  return prisma.property.update({
    where: { id: propertyId },
    data: { adminapproval: 0 },
  });
}

async function hideProperty(propertyId) {
  const property = await prisma.property.findFirst({ where: { id: propertyId } });
  if (!property) throw new AppError("Property not found", 404, "PROPERTY_NOT_FOUND");

  return prisma.property.update({
    where: { id: propertyId },
    data: { adminapproval: 0 },
  });
}

async function displayProperty(propertyId) {
  const property = await prisma.property.findFirst({ where: { id: propertyId } });
  if (!property) throw new AppError("Property not found", 404, "PROPERTY_NOT_FOUND");

  return prisma.property.update({
    where: { id: propertyId },
    data: { adminapproval: 1 },
  });
}

async function freezeProperty(propertyId) {
  const property = await prisma.property.findFirst({ where: { id: propertyId } });
  if (!property) throw new AppError("Property not found", 404, "PROPERTY_NOT_FOUND");

  return prisma.property.update({
    where: { id: propertyId },
    data: { adminblock: 1 },
  });
}

async function releaseProperty(propertyId) {
  const property = await prisma.property.findFirst({ where: { id: propertyId } });
  if (!property) throw new AppError("Property not found", 404, "PROPERTY_NOT_FOUND");

  return prisma.property.update({
    where: { id: propertyId },
    data: { adminblock: 0 },
  });
}

module.exports = {
  createProperty,
  updateProperty,
  deleteProperty,
  listVisibleProperties,
  getPropertyById,
  getPropertiesByState,
  getMyProperties,
  adminListProperties,
  adminListPendingApproval,
  approveProperty,
  disapproveProperty,
  hideProperty,
  displayProperty,
  freezeProperty,
  releaseProperty,
};
