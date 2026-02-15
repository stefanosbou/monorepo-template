import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const endOnboardingTool = createTool({
  id: "end-onboarding",
  description:
    "Call this tool immediately after calling update_profile when you have collected all required information from the user. This signals that the onboarding conversation is complete.",
  inputSchema: z.object({
    summary: z
      .string()
      .describe(
        "A comprehensive summary of all information collected during onboarding",
      ),
    // Core identity
    role: z.string().describe("Current job title or role"),
    yearsExperience: z.number().describe("Years of professional experience"),
    companyName: z.string().optional().describe("Current company name"),

    // Tier 1: Critical context (required)
    companySize: z
      .enum([
        "STARTUP_1_10",
        "STARTUP_11_50",
        "SMALL_51_200",
        "MEDIUM_201_1000",
        "LARGE_1001_5000",
        "ENTERPRISE_5001_PLUS",
      ])
      .describe("Company size category"),
    careerTrack: z
      .enum(["IC", "MANAGER", "STAFF_PLUS_IC", "TECH_LEAD", "EXECUTIVE"])
      .describe("Career track"),
    immediateTeamSize: z.number().describe("Size of immediate team"),
    crossFunctionalTeams: z
      .number()
      .optional()
      .describe("Number of cross-functional teams worked with"),
    directReports: z
      .number()
      .optional()
      .describe("Number of direct reports (if manager)"),
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
      .describe("Industry sector"),
    region: z
      .enum([
        "US_BAY_AREA",
        "US_OTHER",
        "EUROPE",
        "ASIA_PACIFIC",
        "LATIN_AMERICA",
        "REMOTE_GLOBAL",
      ])
      .describe("Geographic region"),

    // Tier 2: Enriched context (optional, automated)
    companyEmployeeCount: z
      .number()
      .optional()
      .describe("Total company employee count"),
    companyFundingStage: z
      .string()
      .optional()
      .describe("Company funding stage"),
    companyKnownLeveling: z
      .string()
      .optional()
      .describe("Known leveling framework (e.g., L3-L10)"),
    selfReportedLevel: z.string().optional().describe("Self-reported level"),
    primaryTechStack: z
      .array(z.string())
      .optional()
      .describe("Primary technologies used"),

    // Calibration signals
    scopeConfidence: z
      .number()
      .optional()
      .describe("Confidence score for scope plausibility"),
    trackConsistency: z
      .boolean()
      .optional()
      .describe("Whether career track signals align"),
    industryAlignmentScore: z
      .number()
      .optional()
      .describe("Skill-industry fit score"),
    anomalyFlags: z
      .array(z.string())
      .optional()
      .describe("Detected inconsistencies"),
    enrichmentConfidence: z
      .number()
      .optional()
      .describe("Quality of automated enrichment"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    data: z.object({
      summary: z.string(),
      role: z.string(),
      yearsExperience: z.number(),
      companyName: z.string().optional(),
      companySize: z.string(),
      careerTrack: z.string(),
      immediateTeamSize: z.number(),
      crossFunctionalTeams: z.number().optional(),
      directReports: z.number().optional(),
      industry: z.string(),
      region: z.string(),
      companyEmployeeCount: z.number().optional(),
      companyFundingStage: z.string().optional(),
      companyKnownLeveling: z.string().optional(),
      selfReportedLevel: z.string().optional(),
      primaryTechStack: z.array(z.string()).optional(),
      scopeConfidence: z.number().optional(),
      trackConsistency: z.boolean().optional(),
      industryAlignmentScore: z.number().optional(),
      anomalyFlags: z.array(z.string()).optional(),
      enrichmentConfidence: z.number().optional(),
    }),
  }),
  execute: async (context) => {
    // This is a terminal tool - it doesn't need to do anything
    // Its presence in the stream signals completion to the frontend
    return {
      success: true,
      message: "Onboarding complete! Thank you for sharing your information.",
      data: {
        summary: context.summary,
        role: context.role,
        yearsExperience: context.yearsExperience,
        companyName: context.companyName,
        companySize: context.companySize,
        careerTrack: context.careerTrack,
        immediateTeamSize: context.immediateTeamSize,
        crossFunctionalTeams: context.crossFunctionalTeams,
        directReports: context.directReports,
        industry: context.industry,
        region: context.region,
        companyEmployeeCount: context.companyEmployeeCount,
        companyFundingStage: context.companyFundingStage,
        companyKnownLeveling: context.companyKnownLeveling,
        selfReportedLevel: context.selfReportedLevel,
        primaryTechStack: context.primaryTechStack,
        scopeConfidence: context.scopeConfidence,
        trackConsistency: context.trackConsistency,
        industryAlignmentScore: context.industryAlignmentScore,
        anomalyFlags: context.anomalyFlags,
        enrichmentConfidence: context.enrichmentConfidence,
      },
    };
  },
});
