import type { FastifyInstance, FastifyPluginOptions } from "fastify";

export async function healthModule(
  app: FastifyInstance,
  _opts: FastifyPluginOptions
) {
  app.get("/health", async () => ({ status: "ok", timestamp: new Date().toISOString() }));
}
