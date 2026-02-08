import type { Context } from "@api/rest/types";
import { todosResponseSchema } from "@api/schemas/todo";
import { validateResponse } from "@api/utils/validate-response";
import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { listTodos } from "@humblebrag/db/queries";
import { withRequiredScope } from "../middleware";

const app = new OpenAPIHono<Context>();

app.openapi(
  createRoute({
    method: "get",
    path: "/",
    summary: "List all todos",
    operationId: "listTodos",
    "x-speakeasy-name-override": "list",
    description: "Retrieve a list of todos for the authenticated user.",
    tags: ["Todos"],
    responses: {
      200: {
        description: "Retrieve a list of todos for the authenticated user.",
        content: {
          "application/json": {
            schema: todosResponseSchema,
          },
        },
      },
    },
    middleware: [withRequiredScope("todos.read")],
  }),
  async (c) => {
    const db = c.get("db");
    // const session = c.get("session");

    const result = await listTodos(db);

    return c.json(validateResponse({ data: result }, todosResponseSchema));
  },
);

export const todosRouter = app;
