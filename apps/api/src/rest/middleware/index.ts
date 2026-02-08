import type { Context } from "hono";

export const authMiddleware = async (
  c: Context,
  next: () => Promise<Response>,
) => {
  const auth = c.req.header("authorization");
  if (!auth) return c.json({ error: "Unauthorized" }, 401);

  // Minimal example: accept any bearer token and attach a simple session
  const token = auth.split(" ")[1];
  // Attach session info to c.env or c.req as needed. Here we use c.req.
  (c as any).session = token ? { userId: token } : null;

  return next();
};

export const protectedMiddleware = [authMiddleware];

export { withRequiredScope } from "@api/rest/middleware/scope";
