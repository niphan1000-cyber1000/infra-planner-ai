export interface ArchitectureRequirements {
  businessType: string;
  userVolume: string; // 'low' (1k), 'medium' (10k), 'high' (100k), 'extreme' (1M+)
  compliance: string[]; // 'PDPA', 'HIPAA', 'PCI-DSS', 'GDPR'
  budget: string; // 'low', 'balanced', 'unlimited'
  cloudPreference: string; // 'aws', 'azure', 'gcp', 'hybrid', 'on-premise'
  existingTech: string; // e.g., 'None', 'On-Premises Oracle', 'Legacy Monolith'
  extraDescription: string;
  itGoal: string; // 'modernize' | 'greenfield' | 'security' | 'cost'
  riskFocus: string; // 'standard' | 'strict' | 'zero_trust'
}

export interface TopologyNode {
  id: string;
  name: string;
  category:
    | "ingress"
    | "security"
    | "gateway"
    | "compute"
    | "cache"
    | "database"
    | "queue"
    | "integration"
    | "other";
  serviceName: string; // e.g. Amazon CloudFront, Azure WAF, On-Premises DB
  details: string; // Specifications like "Multi-AZ, Auto-scaling, SSL termination"
  status: "secure" | "warning" | "critical";
  provider: "aws" | "azure" | "gcp" | "hybrid" | "on-premise";
  description: string;
}

export interface TopologyConnection {
  from: string;
  to: string;
  label?: string;
}

export interface BottleneckItem {
  id: string;
  title: string;
  description: string;
  severity: "high" | "medium" | "low";
  solution: string;
}

export interface SecurityRiskItem {
  id: string;
  title: string;
  description: string;
  severity: "high" | "medium" | "low";
  mitigation: string;
}

export interface CostOptimizationItem {
  item: string;
  currentEstimate: string;
  hybridStrategy: string;
  potentialSavings: string;
}

export interface TechComparisonItem {
  category: string;
  awsProduct: string;
  azureProduct: string;
  gcpProduct: string;
  hybridApproach: string;
  pros: string;
  cons: string;
}

export interface SystemAnalysisAndAssessment {
  legacyStatusAssessment: string; // การประเมินสถานะและปัญหาหลักของระบบเดิม
  improvementPath: string; // แนวทางการปรับปรุงระบบเดิมทีละเฟส
  businessGoalAlignment: string; // การออกแบบที่ตอบโจทย์เป้าหมายทางธุรกิจโดยตรง
}

export interface ITStrategyRoadmap {
  phase1ShortTerm: string; // แผนระยะสั้น (0-6 เดือน) - การย้ายและเตรียมความพร้อม
  phase2MidTerm: string; // แผนระยะกลาง (6-18 เดือน) - การขยายตัวและการจัดโครงสร้างใหม่
  phase3LongTerm: string; // แผนระยะยาว (18+ เดือน) - นวัตกรรมและความคุ้มทุน
  futureGrowthAdaptability: string; // การรองรับการเติบโตและการเปลี่ยนแปลงทางเทคโนโลยีในอนาคต
}

export interface ComprehensiveRiskManagement {
  riskIdentification: string; // การระบุและประเมินระดับความเสี่ยงที่สำคัญด้าน IT
  threatMitigationControls: string; // มาตรการควบคุมเพื่อบรรเทาภัยคุกคามทางไซเบอร์
  businessContinuityPlan: string; // แผนความต่อเนื่องทางธุรกิจและการกู้คืนระบบกรณีภัยพิบัติ (DR Plan RTO/RPO)
}

export interface ArchitectureReport {
  executiveSummary: string;
  architectureStyle: string; // e.g. 'Microservices', 'Hybrid Cloud', 'Serverless'
  nodes: TopologyNode[];
  connections: TopologyConnection[];
  bottlenecks: BottleneckItem[];
  securityRisks: SecurityRiskItem[];
  costOptimization: CostOptimizationItem[];
  techComparison: TechComparisonItem[];
  hybridCloudStrategy: string;
  systemAnalysis: SystemAnalysisAndAssessment;
  itStrategyRoadmap: ITStrategyRoadmap;
  riskManagementPlan: ComprehensiveRiskManagement;
  cacheStatus?: "hit-redis" | "hit-memory" | "miss";
  cacheKey?: string;
}

export interface SimulationMetric {
  name: string;
  value: number;
  max: number;
  unit: string;
  status: "normal" | "warning" | "danger";
}

export interface SimulationResult {
  eventName: string;
  isSuccessful: boolean;
  systemStatus: "healthy" | "degraded" | "failed";
  log: string[];
  metrics: {
    latency: number;
    throughput: number;
    cpuLoad: number;
    dbConnections: number;
  };
  bottlenecksTriggered: string[];
  recommendations: string[];
}
