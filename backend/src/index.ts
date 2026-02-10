import { buildApp } from "./app.js";

const app = await buildApp();

try {
  const port = Number(process.env.PORT) || 3001;
  await app.listen({ port, host: process.env.HOST ?? "127.0.0.1" });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
