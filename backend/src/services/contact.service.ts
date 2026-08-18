import prisma from "../lib/prisma";
import { AppError } from "../middleware/errorHandler";

// ─── Public: Submit Contact Form ────────────────────────────────────

export async function submitContact(data: {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}) {
  return prisma.contact.create({
    data: {
      name: data.name.substring(0, 255),
      email: data.email.substring(0, 255),
      phone: data.phone.substring(0, 100),
      subject: data.subject.substring(0, 255),
      message: data.message.substring(0, 65000),
    },
  });
}

// ─── Admin: List Contact Submissions ────────────────────────────────

export async function listContacts(page = 1, limit = 50) {
  const [contacts, total] = await Promise.all([
    prisma.contact.findMany({
      orderBy: { id: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.contact.count(),
  ]);

  return {
    contacts,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

// ─── Admin: Delete Contact Submission ───────────────────────────────

export async function deleteContact(id: number) {
  const contact = await prisma.contact.findFirst({ where: { id } });
  if (!contact) throw new AppError("Contact not found", 404, "CONTACT_NOT_FOUND");

  await prisma.contact.delete({ where: { id } });
  return { message: "Contact deleted" };
}
