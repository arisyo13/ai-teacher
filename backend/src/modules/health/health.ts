import type { FastifyInstance, FastifyPluginOptions } from "fastify";

export const healthModule = async (
  app: FastifyInstance,
  _opts: FastifyPluginOptions
) => {
  app.get("/health", async () => ({ status: "ok", timestamp: new Date().toISOString() }));
}
