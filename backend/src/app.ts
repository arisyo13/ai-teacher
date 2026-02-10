import Fastify from "fastify";
import cors from "@fastify/cors";
import { healthModule } from "./modules/health/health.js";
import { chatModule } from "./modules/chat/chat.js";

export async function buildApp() {
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: true });

  await app.register(healthModule, { prefix: "/api" });
  await app.register(chatModule, { prefix: "/api" });

  return app;
}
