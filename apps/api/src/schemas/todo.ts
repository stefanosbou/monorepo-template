import z from "zod";

export const todosResponseSchema = z.object({
  id: z.string().uuid().openapi({
    description: "Unique identifier of the todo",
    example: "123e4567-e89b-12d3-a456-426614174000",
  }),
  name: z.string().openapi({
    description: "Name of the team or organization",
    example: "Acme Corporation",
  }),
  logoUrl: z.string().url().nullable().openapi({
    description: "URL to the team's logo image",
    example: "https://cdn.midday.ai/logos/acme-corp.png",
  }),
  plan: z.enum(["trial", "starter", "pro"]).openapi({
    description: "Current subscription plan of the team",
    example: "pro",
  }),
  // subscriptionStatus: z
  //   .enum([
  //     "active",
  //     "canceled",
  //     "past_due",
  //     "unpaid",
  //     "trialing",
  //     "incomplete",
  //     "incomplete_expired",
  //   ])
  //   .nullable()
  //   .openapi({
  //     description: "Current subscription status of the team",
  //     example: "active",
  //   }),
});
