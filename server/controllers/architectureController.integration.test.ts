import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../server";
import * as geminiService from "../services/geminiService";

// Mock the geminiService to keep integration test predictable, fast, and quota-friendly
vi.mock("../services/geminiService", () => {
  return {
    analyzeArchitecture: vi.fn(),
    consultChatAdvisor: vi.fn(),
  };
});

describe("Architecture Controller - Full Integration Lifecycle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/health/liveness", () => {
    it("should return 200 status code and healthy liveness state", async () => {
      const res = await request(app)
        .get("/api/health/liveness")
        .expect("Content-Type", /json/)
        .expect(200);

      expect(res.body).toHaveProperty("status", "ok");
      expect(res.body).toHaveProperty("checkedAt");
    });
  });

  describe("GET /api/health/readiness", () => {
    it("should return 200 status code when backend and downstream APIs are healthy", async () => {
      const res = await request(app)
        .get("/api/health/readiness")
        .expect(200);

      expect(res.body).toHaveProperty("status", "ready");
      expect(res.body.dependencies).toHaveProperty("gemini", "healthy");
      expect(res.body.dependencies).toHaveProperty("cache");
    });
  });

  describe("POST /api/analyze-architecture", () => {
    it("should return 400 Bad Request if mandatory fields are missing", async () => {
      const res = await request(app)
        .post("/api/analyze-architecture")
        .send({
          budget: "balanced",
          cloudPreference: "hybrid",
        })
        .expect(400);

      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toContain("โปรดระบุประเภทธุรกิจที่ถูกต้อง");
    });

    it("should pass input validation, invoke geminiService, propagate request headers, and return 200", async () => {
      const mockResult = {
        executiveSummary: "สรุปคำแนะนำจำลอง",
        architectureStyle: "Microservices Hybrid Architecture",
        hybridCloudStrategy: "กลยุทธ์ไฮบริดจำลอง",
        systemAnalysis: {
          legacyStatusAssessment: "วิเคราะห์ระบบเดิม",
          improvementPath: "เส้นทางการอัปเกรด",
          businessGoalAlignment: "สอดคล้องเป้าหมายธุรกิจ"
        },
        itStrategyRoadmap: {
          phase1ShortTerm: "ระยะสั้น",
          phase2MidTerm: "ระยะกลาง",
          phase3LongTerm: "ระยะยาว",
          futureGrowthAdaptability: "การขยายตัว"
        },
        riskManagementPlan: {
          riskIdentification: "ความเสี่ยงหลัก",
          threatMitigationControls: "การควบคุมความเสี่ยง",
          businessContinuityPlan: "แผนบีซีพี"
        },
        nodes: [
          { id: "node1", name: "เซิร์ฟเวอร์เว็บ", category: "compute", serviceName: "ECS", details: "Auto-scaled", status: "secure", provider: "aws", description: "เครื่องหลัก" }
        ],
        connections: [
          { from: "node1", to: "node1", label: "Self loop" }
        ],
        bottlenecks: [
          { id: "b1", title: "คอขวด", description: "รายละเอียด", severity: "medium", solution: "แก้ไขคอขวด" }
        ],
        securityRisks: [
          { id: "s1", title: "ความมั่นคงปลอดภัย", description: "รายละเอียดภัยคุกคาม", severity: "high", mitigation: "วิธีบรรเทา" }
        ],
        costOptimization: [
          { item: "ประหยัดต้นทุน", currentEstimate: "100$", hybridStrategy: "ลดพอร์ต", potentialSavings: "50%" }
        ],
        techComparison: [
          { category: "Compute", awsProduct: "ECS", azureProduct: "Container Apps", gcpProduct: "Cloud Run", hybridApproach: "K8s", pros: "ข้อดี", cons: "ข้อเสีย" }
        ],
        cacheStatus: "miss",
        cacheKey: "mock-key",
      };

      vi.spyOn(geminiService, "analyzeArchitecture").mockResolvedValue(mockResult);

      const payload = {
        businessType: "ระบบ E-Commerce ยอดขายสูง",
        userVolume: "medium",
        budget: "balanced",
        cloudPreference: "hybrid",
        itGoal: "security",
        riskFocus: "strict",
        compliance: ["PCI-DSS"],
        existingTech: "PHP Monolith",
        extraDescription: "ไม่มี",
      };

      const res = await request(app)
        .post("/api/analyze-architecture")
        .set("X-Request-Id", "test-req-correlation-123")
        .send(payload)
        .expect(200);

      expect(res.headers).toHaveProperty("x-request-id", "test-req-correlation-123");
      expect(res.body).toHaveProperty("architectureStyle", "Microservices Hybrid Architecture");
      expect(res.body).toHaveProperty("cacheStatus", "miss");
      expect(geminiService.analyzeArchitecture).toHaveBeenCalledWith(expect.objectContaining({
        businessType: "ระบบ E-Commerce ยอดขายสูง",
        userVolume: "medium",
        budget: "balanced",
        cloudPreference: "hybrid",
        itGoal: "security",
        riskFocus: "strict",
      }));
    });
  });

  describe("POST /api/chat-advisor", () => {
    it("should return 400 if user messages format is invalid", async () => {
      const res = await request(app)
        .post("/api/chat-advisor")
        .send({
          newMessage: "สวัสดีครับ",
          messages: "ไม่ใช่ array"
        })
        .expect(400);

      expect(res.body).toHaveProperty("error");
    });

    it("should process advisor consultation and return AI responses with 200", async () => {
      const mockChatReply = {
        reply: "คำแนะนำจาก AI Advisor จำลอง",
        cacheStatus: "miss",
        cacheKey: "chat-mock-key"
      };

      vi.spyOn(geminiService, "consultChatAdvisor").mockResolvedValue(mockChatReply);

      const payload = {
        newMessage: "อยากทราบเกี่ยวกับ VPN",
        messages: [
          { sender: "user", text: "แนะนำหน่อย" }
        ]
      };

      const res = await request(app)
        .post("/api/chat-advisor")
        .send(payload)
        .expect(200);

      expect(res.body).toHaveProperty("reply", "คำแนะนำจาก AI Advisor จำลอง");
      expect(res.body).toHaveProperty("cacheStatus", "miss");
    });
  });
});
