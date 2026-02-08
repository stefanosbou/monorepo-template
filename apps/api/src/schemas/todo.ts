import z from "zod";

export const todoResponseSchema = z.object({
  id: z.string().uuid().openapi({
    description: "Unique identifier of the todo",
    example: "123e4567-e89b-12d3-a456-426614174000",
  }),
  title: z.string().openapi({
    description: "Title of the todo",
    example: "Buy groceries",
  }),
  completed: z.boolean().openapi({
    description: "Whether the todo is completed or not",
    example: false,
  }),
  createdAt: z.date().openapi({
    description: "ISO timestamp of when the todo was created",
    example: "2024-01-01T12:00:00Z",
  }),
});

export const todosResponseSchema = z.object({
  data: z.array(todoResponseSchema).openapi({
    description: "Array of todos that the user has access to",
  }),
});
