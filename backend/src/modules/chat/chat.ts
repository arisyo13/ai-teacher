import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import { StreamChunk } from "shared";

// Placeholder: real implementation will use RAG over subject content and stream tokens.
export async function chatModule(
  app: FastifyInstance,
  _opts: FastifyPluginOptions
) {
  app.post<{
    Body: { message: string; subjectId?: string; classId?: string };
  }>("/chat/stream", async (request, reply) => {
    const { message } = request.body ?? {};
    if (!message || typeof message !== "string") {
      return reply.code(400).send({ error: "message required" });
    }

    reply.raw.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    const encoder = new TextEncoder();
    const send = (chunk: StreamChunk) => {
      const line = `data: ${JSON.stringify(chunk)}\n\n`;
      reply.raw.write(encoder.encode(line));
    };

    // Placeholder: echo back until RAG is implemented
    const words = message.split(/\s+/);
    for (const word of words) {
      send({ type: "text", data: word + " " });
    }
    send({ type: "done" });

    reply.raw.end();
  });
}
