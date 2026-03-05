import type { Hono } from "hono";
import type { AppEnv } from "../config/env";
import { HTTPException } from "hono/http-exception";
import type { ContentfulStatusCode } from "hono/utils/http-status";

export function registerErrorHandler(app: Hono<AppEnv>): void {
  app.onError((error, context) => {
    let status = 500;
    if (error instanceof HTTPException) {
      status = error.status;
    } else if (
      "status" in error &&
      typeof error.status === "number" &&
      error.status >= 400 &&
      error.status < 600
    ) {
      status = error.status;
    }

    console.error(error);

    return context.json(
      {
        ok: false,
        error: {
          code: status === 500 ? "INTERNAL_ERROR" : "REQUEST_ERROR",
          message: status === 500 ? "Internal Server Error" : error.message
        }
      },
      status as ContentfulStatusCode
    );
  });
}
