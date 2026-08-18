import prisma from "../lib/prisma";
import { AppError } from "../middleware/errorHandler";

// ─── Public: Get All Cities ─────────────────────────────────────────

export async function getCities() {
  return prisma.city.findMany({
    include: { state: { select: { sid: true, sname: true } } },
    orderBy: { cid: "asc" },
  });
}

// ─── Public: Get All States ─────────────────────────────────────────

export async function getStates() {
  return prisma.state.findMany({
    include: { cities: true },
    orderBy: { sid: "asc" },
  });
}

// ─── Admin: Create City ─────────────────────────────────────────────

export async function createCity(data: { cname: string; sid: number }) {
  const state = await prisma.state.findFirst({ where: { sid: data.sid } });
  if (!state) throw new AppError("State not found", 404, "STATE_NOT_FOUND");

  return prisma.city.create({
    data: {
      cname: data.cname.substring(0, 255),
      sid: data.sid,
    },
  });
}

// ─── Admin: Update City ─────────────────────────────────────────────

export async function updateCity(cid: number, data: { cname?: string; sid?: number }) {
  const city = await prisma.city.findFirst({ where: { cid } });
  if (!city) throw new AppError("City not found", 404, "CITY_NOT_FOUND");

  const updateData: Record<string, any> = {};
  if (data.cname !== undefined) updateData.cname = data.cname.substring(0, 255);
  if (data.sid !== undefined) {
    const state = await prisma.state.findFirst({ where: { sid: data.sid } });
    if (!state) throw new AppError("State not found", 404, "STATE_NOT_FOUND");
    updateData.sid = data.sid;
  }

  return prisma.city.update({ where: { cid }, data: updateData });
}

// ─── Admin: Delete City ─────────────────────────────────────────────

export async function deleteCity(cid: number) {
  const city = await prisma.city.findFirst({ where: { cid } });
  if (!city) throw new AppError("City not found", 404, "CITY_NOT_FOUND");

  await prisma.city.delete({ where: { cid } });
  return { message: "City deleted" };
}

// ─── Admin: Create State ────────────────────────────────────────────

export async function createState(data: { sname: string }) {
  return prisma.state.create({
    data: { sname: data.sname.substring(0, 255) },
  });
}

// ─── Admin: Update State ────────────────────────────────────────────

export async function updateState(sid: number, data: { sname: string }) {
  const state = await prisma.state.findFirst({ where: { sid } });
  if (!state) throw new AppError("State not found", 404, "STATE_NOT_FOUND");

  return prisma.state.update({
    where: { sid },
    data: { sname: data.sname.substring(0, 255) },
  });
}

// ─── Admin: Delete State ────────────────────────────────────────────

export async function deleteState(sid: number) {
  const state = await prisma.state.findFirst({ where: { sid } });
  if (!state) throw new AppError("State not found", 404, "STATE_NOT_FOUND");

  const cityCount = await prisma.city.count({ where: { sid } });
  if (cityCount > 0) {
    throw new AppError("Cannot delete state with associated cities", 400, "STATE_HAS_CITIES");
  }

  await prisma.state.delete({ where: { sid } });
  return { message: "State deleted" };
}
