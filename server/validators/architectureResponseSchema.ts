import { z } from "zod";

/**
 * Zod schema to validate individual topology nodes
 */
export const NodeSchema = z.object({
  id: z.string().min(1, "Node ID cannot be empty"),
  name: z.string().min(1, "Node Name cannot be empty"),
  category: z
    .enum([
      "ingress",
      "security",
      "gateway",
      "compute",
      "cache",
      "database",
      "queue",
      "integration",
      "other",
    ])
    .default("other"),
  serviceName: z.string().default("Unknown Service"),
  details: z.string().default(""),
  status: z.enum(["secure", "warning", "critical"]).default("secure"),
  provider: z.enum(["aws", "azure", "gcp", "hybrid", "on-premise"]).default("hybrid"),
  description: z.string().default(""),
});

/**
 * Zod schema to validate connection links between nodes
 */
export const ConnectionSchema = z.object({
  from: z.string().min(1, "Connection from node ID is required"),
  to: z.string().min(1, "Connection to node ID is required"),
  label: z.string().default("Connection"),
});

/**
 * Zod schema to validate system bottlenecks
 */
export const BottleneckSchema = z.object({
  id: z.string().min(1, "Bottleneck ID is required"),
  title: z.string().min(1, "Bottleneck title is required"),
  description: z.string().default(""),
  severity: z.enum(["high", "medium", "low"]).default("medium"),
  solution: z.string().default(""),
});

/**
 * Zod schema to validate security risks
 */
export const SecurityRiskSchema = z.object({
  id: z.string().min(1, "Security risk ID is required"),
  title: z.string().min(1, "Security risk title is required"),
  description: z.string().default(""),
  severity: z.enum(["high", "medium", "low"]).default("medium"),
  mitigation: z.string().default(""),
});

/**
 * Zod schema to validate cost optimization suggestions
 */
export const CostOptimizationSchema = z.object({
  item: z.string().min(1, "Cost optimization item is required"),
  currentEstimate: z.string().default("N/A"),
  hybridStrategy: z.string().default(""),
  potentialSavings: z.string().default(""),
});

/**
 * Zod schema to validate technical comparisons between providers
 */
export const TechComparisonSchema = z.object({
  category: z.string().min(1, "Tech comparison category is required"),
  awsProduct: z.string().default("N/A"),
  azureProduct: z.string().default("N/A"),
  gcpProduct: z.string().default("N/A"),
  hybridApproach: z.string().default(""),
  pros: z.string().default(""),
  cons: z.string().default(""),
});

/**
 * Comprehensive Zod Schema for checking and sanitizing Gemini's complete Architecture response
 */
export const ArchitectureResponseSchema = z.object({
  executiveSummary: z.string().min(1, "Executive Summary is required"),
  architectureStyle: z.string().min(1, "Architecture Style is required"),
  hybridCloudStrategy: z.string().min(1, "Hybrid Cloud Strategy is required"),

  systemAnalysis: z
    .object({
      legacyStatusAssessment: z.string().default(""),
      improvementPath: z.string().default(""),
      businessGoalAlignment: z.string().default(""),
    })
    .default({
      legacyStatusAssessment: "",
      improvementPath: "",
      businessGoalAlignment: "",
    }),

  itStrategyRoadmap: z
    .object({
      phase1ShortTerm: z.string().default(""),
      phase2MidTerm: z.string().default(""),
      phase3LongTerm: z.string().default(""),
      futureGrowthAdaptability: z.string().default(""),
    })
    .default({
      phase1ShortTerm: "",
      phase2MidTerm: "",
      phase3LongTerm: "",
      futureGrowthAdaptability: "",
    }),

  riskManagementPlan: z
    .object({
      riskIdentification: z.string().default(""),
      threatMitigationControls: z.string().default(""),
      businessContinuityPlan: z.string().default(""),
    })
    .default({
      riskIdentification: "",
      threatMitigationControls: "",
      businessContinuityPlan: "",
    }),

  nodes: z.array(NodeSchema).min(1, "At least one topology node is required"),
  connections: z.array(ConnectionSchema).default([]),
  bottlenecks: z.array(BottleneckSchema).default([]),
  securityRisks: z.array(SecurityRiskSchema).default([]),
  costOptimization: z.array(CostOptimizationSchema).default([]),
  techComparison: z.array(TechComparisonSchema).default([]),
});

export type ArchitectureResponse = z.infer<typeof ArchitectureResponseSchema>;
