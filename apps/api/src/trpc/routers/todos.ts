import { listTodos } from "@db/queries";
import z from "zod";
import { createTRPCRouter, publicProcedure } from "../init";

export const todosRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx: { db } }) => {
    const result = await listTodos(db);
    return result;
  }),
  create: publicProcedure
    .input(z.object({ title: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return null;
    }),
  // toggle: publicProcedure
  //   .input(z.object({ id: z.string() }))
  //   .mutation(async ({ ctx, input }) => {
  //     const todo = await ctx.db.todo.findUnique({
  //       where: { id: input.id },
  //     });
  //     if (!todo) throw new Error("Todo not found");
  //     const updated = await ctx.db.todo.update({
  //       where: { id: input.id },
  //       data: { completed: !todo.completed },
  //     });
  //     return updated;
  //   }),
  // delete: publicProcedure
  //   .input(z.object({ id: z.string() }))
  //   .mutation(async ({ ctx, input }) => {
  //     await ctx.db.todo.delete({
  //       where: { id: input.id },
  //     });
  //     return { success: true };
  //   }),
});
