import { prisma } from "@/lib/prisma";
import { getRequestUserId } from "@/lib/request-user";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const userId = await getRequestUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { workspaceId, name } = await req.json();
  if (!workspaceId || !name) {
    return NextResponse.json({ error: "workspaceId and name are required" }, { status: 400 });
  }

  const workspace = await prisma.workspace.findFirst({
    where: { id: workspaceId, userId }
  });

  if (!workspace) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  const project = await prisma.project.create({
    data: {
      name,
      workspace: { connect: { id: workspaceId } }
    },
    include: {
      messages: true
    }
  });

  return NextResponse.json(project);
}
