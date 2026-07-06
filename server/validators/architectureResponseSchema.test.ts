import { describe, it, expect } from "vitest";
import { ArchitectureResponseSchema } from "./architectureResponseSchema";

describe("Architecture Response Validation Schema", () => {
  it("should successfully validate a complete and correct Gemini mock response", () => {
    const validResponse = {
      executiveSummary: "สรุปผู้บริหาร: ระบบคลาวด์เสถียรภาพสูง",
      architectureStyle: "Microservices Hybrid Architecture",
      hybridCloudStrategy: "ใช้ On-Premise เก็บข้อมูลสัญญากู้ยืมเงิน และ GCP สำหรับเว็บแอปทั่วไป",
      systemAnalysis: {
        legacyStatusAssessment: "Legacy เดิมเป็น Monolith ขาดความปลอดภัย",
        improvementPath: "ทำ Containerization ด้วย Kubernetes",
        businessGoalAlignment: "เพิ่มความยืดหยุ่นในการขยายตัวตอบโจทย์ธุรกิจ"
      },
      itStrategyRoadmap: {
        phase1ShortTerm: "บิลด์เว็บใหม่ใน 3 เดือน",
        phase2MidTerm: "ย้ายดาต้าฐานลูกค้า",
        phase3LongTerm: "โอนสัญญากู้ยืมสู่ระบบ Zero-Trust",
        futureGrowthAdaptability: "ขยายเครื่องเพิ่มในอนาคตได้ทันใจ"
      },
      riskManagementPlan: {
        riskIdentification: "ความเสี่ยงการรับ-ส่งข้อมูลไม่ปลอดภัย",
        threatMitigationControls: "เข้ารหัสด้วย TLS 1.3",
        businessContinuityPlan: "ทำ Active-Active Replication ข้ามสาขา"
      },
      nodes: [
        {
          id: "web_app",
          name: "เว็บแอปพลิเคชัน",
          category: "compute",
          serviceName: "Google Cloud Run",
          details: "Multi-AZ Auto-scaling",
          status: "secure",
          provider: "gcp",
          description: "ส่วนรับทราฟฟิกของผู้ใช้"
        },
        {
          id: "core_db",
          name: "ฐานข้อมูลธนาคารเดิม",
          category: "database",
          serviceName: "On-Premises Oracle RAC",
          details: "High Availability Active-Passive",
          status: "warning",
          provider: "on-premise",
          description: "เก็บข้อมูลบัญชีเงินฝากและลูกค้า"
        }
      ],
      connections: [
        {
          from: "web_app",
          to: "core_db",
          label: "Secure IPSec VPN Tunnel Connection"
        }
      ],
      bottlenecks: [
        {
          id: "bt_1",
          title: "คอขวดที่การเชื่อมต่อ On-Premise",
          description: "สาย VPN มี Latency สูงกว่าปกติเมื่อโหลดมาก",
          severity: "medium",
          solution: "อัปเกรดไปใช้ Direct Connect / Dedicated Interconnect"
        }
      ],
      securityRisks: [
        {
          id: "sec_1",
          title: "ความเสี่ยงจากการโจมตี DDoS",
          description: "เครื่องเซิร์ฟเวอร์โดนทราฟฟิกปลอมโจมตีทำให้อืด",
          severity: "high",
          mitigation: "ติดตั้ง Cloud Armor หรือ WAF หน้าระบบ"
        }
      ],
      costOptimization: [
        {
          item: "GCP Committed Use Discounts",
          currentEstimate: "$1,200/เดือน",
          hybridStrategy: "ลดหย่อนด้วยการทำสัญญาเช่าซื้อล่วงหน้า 1-3 ปี",
          potentialSavings: "ลดค่าใช้จ่ายลง 37%"
        }
      ],
      techComparison: [
        {
          category: "Compute",
          awsProduct: "AWS Fargate",
          azureProduct: "Azure Container Apps",
          gcpProduct: "Google Cloud Run",
          hybridApproach: "Self-hosted Docker on Local VM",
          pros: "ประหยัด ดูแลง่าย จ่ายตามจริง",
          cons: "มี Cold-start เล็กน้อยเมื่อเริ่มระบบใหม่"
        }
      ]
    };

    const parseResult = ArchitectureResponseSchema.safeParse(validResponse);
    expect(parseResult.success).toBe(true);
    if (parseResult.success) {
      expect(parseResult.data.architectureStyle).toBe("Microservices Hybrid Architecture");
      expect(parseResult.data.nodes).toHaveLength(2);
      expect(parseResult.data.connections).toHaveLength(1);
    }
  });

  it("should successfully recover and fill defaults for omitted/partial objects", () => {
    const partialResponse = {
      executiveSummary: "สรุปผู้บริหาร: ระบบคลาวด์เสถียรภาพสูง",
      architectureStyle: "Microservices Hybrid Architecture",
      hybridCloudStrategy: "กลยุทธ์ไฮบริดคลาวด์แบบปลอดภัย",
      // Omitted systemAnalysis, itStrategyRoadmap, and riskManagementPlan entirely
      nodes: [
        {
          id: "web_app",
          name: "เว็บแอปพลิเคชัน",
          category: "compute",
          serviceName: "Google Cloud Run",
          details: "Multi-AZ Auto-scaling",
          status: "secure",
          provider: "gcp",
          description: "ส่วนรับทราฟฟิกของผู้ใช้"
        }
      ]
      // Connections, Bottlenecks, Risks, Cost, TechComparison are omitted
    };

    const parseResult = ArchitectureResponseSchema.safeParse(partialResponse);
    expect(parseResult.success).toBe(true);
    if (parseResult.success) {
      expect(parseResult.data.systemAnalysis?.legacyStatusAssessment).toBe("");
      expect(parseResult.data.itStrategyRoadmap?.phase1ShortTerm).toBe("");
      expect(parseResult.data.riskManagementPlan?.riskIdentification).toBe("");
      expect(parseResult.data.connections).toEqual([]);
      expect(parseResult.data.bottlenecks).toEqual([]);
      expect(parseResult.data.securityRisks).toEqual([]);
    }
  });

  it("should fail validation if a critical property like executiveSummary is missing", () => {
    const malformedResponse = {
      // Omitted executiveSummary
      architectureStyle: "Microservices Hybrid Architecture",
      hybridCloudStrategy: "กลยุทธ์ไฮบริดคลาวด์แบบปลอดภัย",
      nodes: [
        {
          id: "web_app",
          name: "เว็บแอปพลิเคชัน",
          category: "compute",
          serviceName: "Google Cloud Run",
          details: "Multi-AZ Auto-scaling",
          status: "secure",
          provider: "gcp",
          description: "ส่วนรับทราฟฟิกของผู้ใช้"
        }
      ]
    };

    const parseResult = ArchitectureResponseSchema.safeParse(malformedResponse);
    expect(parseResult.success).toBe(false);
  });

  it("should fail validation if nodes are completely empty", () => {
    const malformedResponse = {
      executiveSummary: "สรุปผู้บริหาร: ระบบคลาวด์เสถียรภาพสูง",
      architectureStyle: "Microservices Hybrid Architecture",
      hybridCloudStrategy: "กลยุทธ์ไฮบริดคลาวด์แบบปลอดภัย",
      nodes: [] // Must have at least one node
    };

    const parseResult = ArchitectureResponseSchema.safeParse(malformedResponse);
    expect(parseResult.success).toBe(false);
  });
});
