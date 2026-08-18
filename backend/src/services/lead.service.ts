import prisma from "../lib/prisma";
import { AppError } from "../middleware/errorHandler";

// ─── Lead Submission ────────────────────────────────────────────────

export async function submitLead(
  propertyId: number,
  data: {
    name: string;
    email: string;
    phone: string;
    nationality?: string;
  },
  ip?: string,
  device?: string
) {
  const property = await prisma.property.findFirst({ where: { id: propertyId } });
  if (!property) throw new AppError("Property not found", 404, "PROPERTY_NOT_FOUND");

  const lead = await prisma.propertyLead.create({
    data: {
      pid: propertyId,
      title: property.title,
      saleid: String(property.saleid),
      name: data.name.substring(0, 255),
      email: data.email.substring(0, 255),
      nationality: (data.nationality || "").substring(0, 100),
      phone: data.phone.substring(0, 100),
      ip: (ip || "").substring(0, 50),
      device: (device || "").substring(0, 255),
    },
  });

  return lead;
}

// ─── Admin Lead Management ──────────────────────────────────────────

export async function listLeads(
  page = 1,
  limit = 10,
  filters?: { from?: string; to?: string }
) {
  const where: any = {};

  if (filters?.from && filters?.to) {
    where.created_at = {
      gte: new Date(`${filters.from}T00:00:00.000Z`),
      lte: new Date(`${filters.to}T23:59:59.999Z`),
    };
  }

  const [leads, total] = await Promise.all([
    prisma.propertyLead.findMany({
      where,
      orderBy: { id: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.propertyLead.count({ where }),
  ]);

  return {
    leads,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function deleteLead(id: number) {
  const lead = await prisma.propertyLead.findFirst({ where: { id } });
  if (!lead) throw new AppError("Lead not found", 404, "LEAD_NOT_FOUND");

  await prisma.propertyLead.delete({ where: { id } });
  return { message: "Lead deleted" };
}

export async function bulkDeleteLeads(ids: number[]) {
  if (!ids.length) throw new AppError("No IDs provided", 400, "NO_IDS");

  const result = await prisma.propertyLead.deleteMany({
    where: { id: { in: ids } },
  });

  return { deleted: result.count, message: `${result.count} leads deleted` };
}

export async function deleteAllLeads() {
  const result = await prisma.propertyLead.deleteMany();
  return { deleted: result.count, message: `${result.count} leads deleted` };
}

export async function exportLeads(
  mode: "all" | "page" | "range",
  page = 1,
  limit = 10,
  filters?: { from?: string; to?: string }
) {
  const where: any = {};

  if (mode === "range" && filters?.from && filters?.to) {
    where.created_at = {
      gte: new Date(`${filters.from}T00:00:00.000Z`),
      lte: new Date(`${filters.to}T23:59:59.999Z`),
    };
  } else if (mode === "page") {
    // handled by skip/take below
  }

  const leads = await prisma.propertyLead.findMany({
    where,
    orderBy: { id: "desc" },
    ...(mode === "page" ? { skip: (page - 1) * limit, take: limit } : {}),
  });

  // Build TSV content
  const header = "ID\tPID\tTitle\tName\tEmail\tNationality\tPhone\tIP\tDevice\tCreated At\n";
  const rows = leads
    .map((r) =>
      [
        r.id,
        r.pid,
        r.title,
        r.name,
        r.email,
        r.nationality,
        r.phone,
        r.ip,
        r.device,
        r.created_at?.toISOString() || "",
      ]
        .map((v) => String(v).replace(/[\t\r\n]/g, " "))
        .join("\t")
    )
    .join("\n");

  return header + rows;
}
