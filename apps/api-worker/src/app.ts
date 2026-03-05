import { Hono } from "hono";
import type { AppEnv } from "./config/env";
import { registerErrorHandler } from "./middleware/error-handler";
import { healthRoutes } from "./routes/health";

export function createApp(): Hono<AppEnv> {
  const app = new Hono<AppEnv>();

  registerErrorHandler(app);
  app.route("/", healthRoutes);

  return app;
}
