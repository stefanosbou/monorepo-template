import { enrichCustomer } from "@humblebrag/companies/enrichment";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const companyEnrichmentTool = createTool({
  id: "enrich-company",
  description:
    "Enriches company data with employee count, industry, funding stage, and known leveling framework. Use this immediately when a company name is mentioned to populate Tier 2 profile context.",
  inputSchema: z.object({
    companyName: z
      .string()
      .describe("The name of the company to enrich (required)"),
  }),
  outputSchema: z.object({
    success: z.boolean().describe("Whether enrichment completed successfully"),
    companyName: z.string().describe("The company name that was enriched"),
    enrichedData: z
      .object({
        employeeCount: z
          .number()
          .nullable()
          .describe("Approximate employee count"),
        industry: z
          .string()
          .nullable()
          .describe(
            "Industry classification (TECH_CONSUMER, TECH_ENTERPRISE, FINTECH, etc.)",
          ),
        fundingStage: z
          .string()
          .nullable()
          .describe("Funding stage (Seed, Series A-F, Public, etc.)"),
        knownLeveling: z
          .string()
          .nullable()
          .describe(
            "Known leveling framework (e.g., 'Google L3-L10', 'Meta E3-E9')",
          ),
        description: z.string().nullable().describe("Company description"),
        linkedinUrl: z
          .string()
          .nullable()
          .describe("LinkedIn company page URL"),
      })
      .describe("Enriched company data for profile context"),
    enrichmentConfidence: z
      .number()
      .describe("Confidence score of enrichment data (0.0-1.0)"),
    error: z.string().optional().describe("Error message if enrichment failed"),
  }),
  execute: async (context) => {
    try {
      const result = await enrichCustomer({
        companyName: context.companyName,
        website: "", // Will be populated by enrichment service if needed
      });

      // Calculate enrichment confidence based on verified field count
      const maxFields = 6; // employeeCount, industry, fundingStage, knownLeveling, description, linkedinUrl
      const enrichmentConfidence = Math.min(
        result.verifiedFieldCount / maxFields,
        1.0,
      );

      // Parse employee count from range string (e.g., "51-200" -> 125)
      let employeeCount: number | null = null;
      if (result.verified.employeeCount) {
        const match = result.verified.employeeCount.match(/(\d+)-(\d+)/);
        if (match) {
          const [, min, max] = match;
          employeeCount = Math.floor((Number(min) + Number(max)) / 2);
        }
      }

      return {
        success: true,
        companyName: context.companyName,
        enrichedData: {
          employeeCount,
          industry: result.verified.industry,
          fundingStage: null, // TODO: Extract from description or additional data sources
          knownLeveling: null, // TODO: Map company to known leveling frameworks
          description: result.verified.description,
          linkedinUrl: result.verified.linkedinUrl,
        },
        enrichmentConfidence,
      };
    } catch (error) {
      return {
        success: false,
        companyName: context.companyName,
        enrichedData: {
          employeeCount: null,
          industry: null,
          fundingStage: null,
          knownLeveling: null,
          description: null,
          linkedinUrl: null,
        },
        enrichmentConfidence: 0.0,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  },
});
