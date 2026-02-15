import { createTool } from "@mastra/core/tools";
import { z } from "zod";

/**
 * Tool for persisting and retrieving user profile information
 * Used by AI to remember user context across conversations
 */
export const profilePersistenceTool = createTool({
  id: "profile-persistence",
  description:
    "Store and retrieve enriched user profile information with contextual calibration signals",
  inputSchema: z.object({
    userId: z.string().describe("The user's ID"),
    action: z
      .enum(["get", "update", "append"])
      .describe(
        "Action to perform: get (retrieve profile), update (replace profile data), append (add to existing data)",
      ),
    data: z
      .object({
        // Core identity
        role: z.string().optional(),
        yearsExperience: z.number().optional(),
        companyName: z.string().optional(),

        // Tier 1: Critical context (user-provided, required)
        companySize: z
          .enum([
            "STARTUP_1_10",
            "STARTUP_11_50",
            "SMALL_51_200",
            "MEDIUM_201_1000",
            "LARGE_1001_5000",
            "ENTERPRISE_5001_PLUS",
          ])
          .optional(),
        careerTrack: z
          .enum(["IC", "MANAGER", "STAFF_PLUS_IC", "TECH_LEAD", "EXECUTIVE"])
          .optional(),
        immediateTeamSize: z.number().optional(),
        crossFunctionalTeams: z.number().optional(),
        directReports: z.number().optional(),
        industry: z
          .enum([
            "TECH_CONSUMER",
            "TECH_ENTERPRISE",
            "FINTECH",
            "HEALTHCARE_TECH",
            "ECOMMERCE",
            "CRYPTO_WEB3",
            "GAMING",
            "INFRASTRUCTURE",
            "AI_ML",
            "CONSULTING",
            "NON_TECH",
          ])
          .optional(),
        region: z
          .enum([
            "US_BAY_AREA",
            "US_OTHER",
            "EUROPE",
            "ASIA_PACIFIC",
            "LATIN_AMERICA",
            "REMOTE_GLOBAL",
          ])
          .optional(),

        // Tier 2: Enriched context (automated)
        companyEmployeeCount: z.number().optional(),
        companyFundingStage: z.string().optional(),
        companyKnownLeveling: z.string().optional(),
        selfReportedLevel: z.string().optional(),
        primaryTechStack: z.array(z.string()).optional(),
        enrichedAt: z.string().optional(),

        // Calibration signals
        scopeConfidence: z.number().optional(),
        trackConsistency: z.boolean().optional(),
        industryAlignmentScore: z.number().optional(),
        anomalyFlags: z.array(z.string()).optional(),
        enrichmentConfidence: z.number().optional(),
      })
      .optional()
      .describe("Profile data to store (required for update/append actions)"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
  }),
  execute: async (context) => {
    // Placeholder implementation - in a real implementation, you'd interact with your database here
    console.log("Profile Persistence Tool called with context:", context);
    return {
      success: true,
    };
  },
});
