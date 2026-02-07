import { prisma } from "@/lib/prisma";
import { getRequestUserId } from "@/lib/request-user";
import { NextResponse } from "next/server";

type Params = { params: { id: string } };

export async function PATCH(req: Request, { params }: Params) {
  const userId = await getRequestUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name } = await req.json();

  const project = await prisma.project.findFirst({
    where: { id: params.id, workspace: { userId } }
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const updated = await prisma.project.update({
    where: { id: params.id },
    data: { name }
  });

  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: Params) {
  const userId = await getRequestUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const project = await prisma.project.findFirst({
    where: { id: params.id, workspace: { userId } }
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  await prisma.project.delete({ where: { id: params.id } });

  return NextResponse.json({ ok: true });
}
