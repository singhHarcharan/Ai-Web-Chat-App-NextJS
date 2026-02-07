import { prisma } from "@/lib/prisma";
import { getRequestUserId } from "@/lib/request-user";
import { NextResponse } from "next/server";

type Params = { params: { id: string } };

export async function PATCH(req: Request, { params }: Params) {
  const userId = await getRequestUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, description } = await req.json();

  const workspace = await prisma.workspace.update({
    where: { id: params.id, userId },
    data: {
      name,
      description
    }
  });

  return NextResponse.json(workspace);
}

export async function DELETE(_: Request, { params }: Params) {
  const userId = await getRequestUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.workspace.delete({
    where: { id: params.id, userId }
  });

  return NextResponse.json({ ok: true });
}
