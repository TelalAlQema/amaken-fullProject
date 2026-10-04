const { prisma } = require("../platform/db/prisma");
const { AppError } = require("../middleware/errorHandler");

// ─── Public: Get All Cities ─────────────────────────────────────────

async function getCities() {
  return prisma.city.findMany({
    include: { state: { select: { sid: true, sname: true } } },
    orderBy: { cid: "asc" },
  });
}

// ─── Public: Get All States ─────────────────────────────────────────

async function getStates() {
  return prisma.state.findMany({
    include: { cities: true },
    orderBy: { sid: "asc" },
  });
}

// ─── Admin: Create City ─────────────────────────────────────────────

async function createCity(data) {
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

async function updateCity(cid, data) {
  const city = await prisma.city.findFirst({ where: { cid } });
  if (!city) throw new AppError("City not found", 404, "CITY_NOT_FOUND");

  const updateData = {};
  if (data.cname !== undefined) updateData.cname = data.cname.substring(0, 255);
  if (data.sid !== undefined) {
    const state = await prisma.state.findFirst({ where: { sid: data.sid } });
    if (!state) throw new AppError("State not found", 404, "STATE_NOT_FOUND");
    updateData.sid = data.sid;
  }

  return prisma.city.update({ where: { cid }, data: updateData });
}

// ─── Admin: Delete City ─────────────────────────────────────────────

async function deleteCity(cid) {
  const city = await prisma.city.findFirst({ where: { cid } });
  if (!city) throw new AppError("City not found", 404, "CITY_NOT_FOUND");

  await prisma.city.delete({ where: { cid } });
  return { message: "City deleted" };
}

// ─── Admin: Create State ────────────────────────────────────────────

async function createState(data) {
  return prisma.state.create({
    data: { sname: data.sname.substring(0, 255) },
  });
}

// ─── Admin: Update State ────────────────────────────────────────────

async function updateState(sid, data) {
  const state = await prisma.state.findFirst({ where: { sid } });
  if (!state) throw new AppError("State not found", 404, "STATE_NOT_FOUND");

  return prisma.state.update({
    where: { sid },
    data: { sname: data.sname.substring(0, 255) },
  });
}

// ─── Admin: Delete State ────────────────────────────────────────────

async function deleteState(sid) {
  const state = await prisma.state.findFirst({ where: { sid } });
  if (!state) throw new AppError("State not found", 404, "STATE_NOT_FOUND");

  const cityCount = await prisma.city.count({ where: { sid } });
  if (cityCount > 0) {
    throw new AppError("Cannot delete state with associated cities", 400, "STATE_HAS_CITIES");
  }

  await prisma.state.delete({ where: { sid } });
  return { message: "State deleted" };
}

module.exports = {
  getCities,
  getStates,
  createCity,
  updateCity,
  deleteCity,
  createState,
  updateState,
  deleteState,
};
