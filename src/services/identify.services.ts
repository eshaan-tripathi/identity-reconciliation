import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});
export const identifyService = async (
  email?: string,
  phoneNumber?: string
) => {
  return await prisma.$transaction(async (tx) => {
    // 1️⃣ Find all matching contacts
    const matched = await tx.contact.findMany({
      where: {
        deletedAt: null,
        OR: [
          { email: email ?? undefined },
          { phoneNumber: phoneNumber ?? undefined },
        ],
      },
    });

    // 2️⃣ If none exist → create primary
    if (matched.length === 0) {
      const newContact = await tx.contact.create({
        data: {
          email,
          phoneNumber,
          linkPrecedence: "primary",
        },
      });

      return {
        primaryContactId: newContact.id,
        emails: email ? [email] : [],
        phoneNumbers: phoneNumber ? [phoneNumber] : [],
        secondaryContactIds: [],
      };
    }

    // 3️⃣ Collect full group IDs
    const ids = new Set<number>();
    matched.forEach((c) => {
      ids.add(c.id);
      if (c.linkedId) ids.add(c.linkedId);
    });

    const fullGroup = await tx.contact.findMany({
      where: {
        deletedAt: null,
        OR: [
          { id: { in: Array.from(ids) } },
          { linkedId: { in: Array.from(ids) } },
        ],
      },
    });

    // 4️⃣ Determine true primary (oldest)
    const sorted = fullGroup.sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );

    const primary = sorted[0];

    // 5️⃣ Normalize all contacts under true primary
    await tx.contact.updateMany({
  where: { id: { in: fullGroup.filter(c => c.id !== primary.id).map(c => c.id) } },
  data: { linkPrecedence: "secondary", linkedId: primary.id }
});

    // 6️⃣ Check if new info introduced
    const existingEmails = new Set(fullGroup.map((c) => c.email));
    const existingPhones = new Set(fullGroup.map((c) => c.phoneNumber));

    if (
      (email && !existingEmails.has(email)) ||
      (phoneNumber && !existingPhones.has(phoneNumber))
    ) {
      await tx.contact.create({
        data: {
          email,
          phoneNumber,
          linkPrecedence: "secondary",
          linkedId: primary.id,
        },
      });
    }

    // 7️⃣ Fetch updated group
    const updatedGroup = await tx.contact.findMany({
      where: {
        deletedAt: null,
        OR: [{ id: primary.id }, { linkedId: primary.id }],
      },
    });

    const emails = Array.from(
      new Set(updatedGroup.map((c) => c.email).filter(Boolean))
    ) as string[];

    const phoneNumbers = Array.from(
      new Set(updatedGroup.map((c) => c.phoneNumber).filter(Boolean))
    ) as string[];

    const secondaryIds = updatedGroup
      .filter((c) => c.linkPrecedence === "secondary")
      .map((c) => c.id);

    return {
      primaryContactId: primary.id,
      emails,
      phoneNumbers,
      secondaryContactIds: secondaryIds,
    };
  });
};