// app/api/workspaces/route.ts
import { prisma } from "@/lib/prisma";
import { getRequestUserId } from "@/lib/request-user";
import { NextResponse } from "next/server";

export async function GET() {
  const userId = await getRequestUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspaces = await prisma.workspace.findMany({
    where: { userId },
    include: {
      projects: {
        include: {
          messages: true
        },
        orderBy: { createdAt: "desc" }
      },
    },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(workspaces);
}

export async function POST(req: Request) {
  const userId = await getRequestUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, description } = await req.json();

  const workspace = await prisma.workspace.create({
    data: {
      name,
      description,
      user: { connect: { id: userId } },
    },
    include: {
      projects: true
    }
  });

  return NextResponse.json(workspace);
}
