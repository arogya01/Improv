import type { Hono } from "hono";
import type { AppEnv } from "../config/env";

export function registerErrorHandler(app: Hono<AppEnv>): void {
    app.onError((error, context) => {
        const err = error as unknown as { status?: number };
        const status =
            typeof err.status === "number" && err.status >= 400 && err.status < 600 ? err.status : 500;

        console.error(error);

        return context.json({
            ok: false,
            error: {
                code: status === 500 ? "INTERNAL_ERROR" : "REQUEST_ERROR",
                message: status === 500 ? "Internal Server Error" : error.message,
            },
            status
        })
    })
}