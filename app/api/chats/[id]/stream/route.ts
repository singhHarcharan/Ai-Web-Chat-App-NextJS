import { prisma } from "@/lib/prisma";
import { getRequestUserId } from "@/lib/request-user";
import { streamAgentResponse } from "@/lib/agent";

export const runtime = "nodejs";

type Params = { params: { id: string } };

export async function POST(req: Request, { params }: Params) {
  const userId = await getRequestUserId();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { content } = await req.json();
  if (!content || typeof content !== "string") {
    return new Response("Invalid content", { status: 400 });
  }

  const project = await prisma.project.findFirst({
    where: { id: params.id, workspace: { userId } }
  });

  if (!project) {
    return new Response("Chat not found", { status: 404 });
  }

  const userMessage = await prisma.message.create({
    data: {
      role: "user",
      content,
      project: { connect: { id: project.id } }
    }
  });

  const assistantMessage = await prisma.message.create({
    data: {
      role: "assistant",
      content: "",
      project: { connect: { id: project.id } }
    }
  });

  let fullResponse = "";

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      const send = (payload: string) => {
        controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
      };

      try {
        for await (const token of streamAgentResponse({ prompt: content })) {
          fullResponse += token;
          send(JSON.stringify({ token }));
        }

        await prisma.message.update({
          where: { id: assistantMessage.id },
          data: { content: fullResponse }
        });

        send("[DONE]");
      } catch (error) {
        send(JSON.stringify({ error: "Streaming failed" }));
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive"
    }
  });
}
