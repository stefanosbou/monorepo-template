import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const askLocationTool = createTool({
  id: "ask-location",
  description: "Ask the user for a city if none is provided, then resume.",
  // No required input; the agent decides when to call this
  inputSchema: z.object({}).optional(),
  // What we return once we have a city
  outputSchema: z.object({
    city: z.string(),
  }),
  // What we send back when suspending
  suspendSchema: z.object({
    question: z.string(),
  }),
  // What we expect when resuming
  resumeSchema: z.object({
    city: z.string(),
  }),
  execute: async (_inputData, context) => {
    // First call: no resumeData yet → suspend and ask for city
    if (!context?.agent?.resumeData) {
      return context?.agent?.suspend({
        question: "What city do you want to know the weather for?",
      });
    }

    // Resume call: city was extracted from user's follow-up message
    const { city } = context.agent.resumeData;
    return { city };
  },
});
