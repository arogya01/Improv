import { Hono } from "hono";

type Env = {
  Bindings: {};
};

const app = new Hono<Env>();

app.get("/health", (context) => {
  return context.json(
    {
      ok: true,
      service: "api-worker"
    },
    200
  );
});

export default app;
