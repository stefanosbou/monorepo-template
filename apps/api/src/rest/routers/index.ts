import { OpenAPIHono } from "@hono/zod-openapi";
import { protectedMiddleware } from "../middleware";
import { todosRouter } from "./todos";

const routers = new OpenAPIHono();

// Public routes
// routers.route("/oauth", new OpenAPIHono());
// routers.route("/webhook", new OpenAPIHono());
// routers.route("/files", new OpenAPIHono());
// routers.route("/apps", new OpenAPIHono());

// Mount the todos router as an example concrete router (public)

// Apply protected middleware to subsequent routes
routers.use(...protectedMiddleware);

// Protected routes (minimal placeholders)
routers.route("/todos", todosRouter);

// routers.route("/notifications", new OpenAPIHono());
// routers.route("/transactions", new OpenAPIHono());
// routers.route("/teams", new OpenAPIHono());
// routers.route("/users", new OpenAPIHono());
// routers.route("/customers", new OpenAPIHono());
// routers.route("/documents", new OpenAPIHono());
// routers.route("/search", new OpenAPIHono());
// routers.route("/reports", new OpenAPIHono());
// routers.route("/chat", new OpenAPIHono());

export { routers, protectedMiddleware };
