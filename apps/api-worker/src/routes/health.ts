
import { Hono } from "hono";
import type { AppEnv } from "../config/env";

export const healthRoutes = new Hono<AppEnv>();

healthRoutes.get("/health", (context) => {
    return context.json({
        ok: true,
        service: "api-worker"
    }, 200);
});