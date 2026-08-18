import prisma from "../lib/prisma";

// ─── Dashboard Stats ────────────────────────────────────────────────

export async function getDashboardStats() {
  const [
    adminCount,
    userCount,
    agentCount,
    builderCount,
    totalProperties,
    availableProperties,
    soldOutProperties,
    forRent,
    forSale,
    pendingApproval,
    totalLeads,
    totalContacts,
    totalFeedback,
    totalCities,
    totalStates,
    totalTeamMembers,
    totalAboutEntries,
  ] = await Promise.all([
    prisma.admin.count(),
    prisma.user.count({ where: { utype: "User" } }),
    prisma.user.count({ where: { utype: "Agent" } }),
    prisma.user.count({ where: { utype: "Builder" } }),
    prisma.property.count(),
    prisma.property.count({ where: { status: "available" } }),
    prisma.property.count({ where: { status: "sold_out" } }),
    prisma.property.count({ where: { stype: "rent" } }),
    prisma.property.count({ where: { stype: "sale" } }),
    prisma.property.count({ where: { adminapproval: 0 } }),
    prisma.propertyLead.count(),
    prisma.contact.count(),
    prisma.feedback.count(),
    prisma.city.count(),
    prisma.state.count(),
    prisma.teamMember.count(),
    prisma.about.count(),
  ]);

  return {
    adminCount,
    userCount,
    agentCount,
    builderCount,
    totalProperties,
    availableProperties,
    soldOutProperties,
    forRent,
    forSale,
    pendingApproval,
    totalLeads,
    totalContacts,
    totalFeedback,
    totalCities,
    totalStates,
    totalTeamMembers,
    totalAboutEntries,
  };
}

// ─── Dashboard Chart Data ───────────────────────────────────────────

export async function getChartData(email?: string, status?: string) {
  const where: any = {};
  if (email) where.email = email;
  if (status) where.status = status;

  const total = await prisma.property.count({ where });
  const available = await prisma.property.count({
    where: { ...where, status: "available" },
  });
  const soldOut = await prisma.property.count({
    where: { ...where, status: "sold_out" },
  });

  return {
    total,
    available,
    sold: soldOut,
  };
}

// ─── Dashboard Sidebar Counts ───────────────────────────────────────

export async function getSidebarCounts() {
  const [
    admins,
    users,
    agents,
    builders,
    totalProperties,
    availableProperties,
    pendingApproval,
    contacts,
    companyFeedback,
    agentFeedback,
    leads,
    aboutEntries,
    teamMembers,
    registeredAccounts,
    deletedAccounts,
    blockedAccounts,
  ] = await Promise.all([
    prisma.admin.count(),
    prisma.user.count({ where: { utype: "User" } }),
    prisma.user.count({ where: { utype: "Agent" } }),
    prisma.user.count({ where: { utype: "Builder" } }),
    prisma.property.count(),
    prisma.property.count({ where: { status: "available" } }),
    prisma.property.count({ where: { adminapproval: 0 } }),
    prisma.contact.count(),
    prisma.feedback.count(),
    prisma.feedback.count({
      where: { user: { utype: "Agent" } },
    }),
    prisma.propertyLead.count(),
    prisma.about.count(),
    prisma.teamMember.count(),
    prisma.registerEmail.count(),
    prisma.delAccount.count({ where: { type: "delete" } }),
    prisma.delAccount.count({ where: { type: "block" } }),
  ]);

  return {
    admins,
    users,
    agents,
    builders,
    totalProperties,
    availableProperties,
    pendingApproval,
    contacts,
    companyFeedback,
    agentFeedback,
    leads,
    aboutEntries,
    teamMembers,
    registeredAccounts,
    deletedAccounts,
    blockedAccounts,
  };
}
