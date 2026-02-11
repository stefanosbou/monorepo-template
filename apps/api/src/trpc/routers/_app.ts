import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { createTRPCRouter } from "../init";
import { chatRouter } from "./chat";
import { todosRouter } from "./todos";

export const appRouter = createTRPCRouter({
  todos: todosRouter,
  chat: chatRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
export type RouterInputs = inferRouterInputs<AppRouter>;
