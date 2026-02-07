import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Returns the current user id or null. In dev, can fall back to a seeded user.
export async function getRequestUserId() {
  const session = await auth();
  if (session?.user?.id) return session.user.id;

  if (process.env.AUTH_DISABLED === "true") {
    if (process.env.DEV_USER_ID) return process.env.DEV_USER_ID;

    const email = process.env.DEV_USER_EMAIL ?? "dev@local.test";
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name: "Dev User"
      }
    });
    return user.id;
  }

  return null;
}
