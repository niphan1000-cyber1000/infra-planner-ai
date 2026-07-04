import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini API client safely
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is required");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// API: Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// API: Design IT Architecture & Cloud Strategy
app.post("/api/analyze-architecture", async (req, res) => {
  try {
    const {
      businessType,
      userVolume,
      compliance,
      budget,
      cloudPreference,
      existingTech,
      extraDescription,
      itGoal,
      riskFocus,
    } = req.body;

    const ai = getGeminiClient();

    // Mapping values to Thai for clearer prompt understanding
    const goalMap: Record<string, string> = {
      modernize: "การปรับปรุงระบบเดิมและเชื่อมต่อ Legacy ให้มีประสิทธิภาพสูงสุด (Modernize Legacy & Interoperability)",
      greenfield: "การวางแผนออกแบบระบบใหม่ทั้งหมดตั้งแต่ต้นให้เหมาะกับเป้าหมายธุรกิจและการเติบโต (Greenfield System Design)",
      security: "เน้นยกระดับความปลอดภัยและความน่าเชื่อถือสูงสุดเพื่อปกป้องทรัพย์สินดิจิทัล (Maximum Security & High Availability)",
      cost: "เน้นความคุ้มค่า ควบคุมต้นทุนระยะยาว และใช้ทรัพยากรอย่างเสถียร (Cost Optimization & Lean Operations)"
    };

    const riskMap: Record<string, string> = {
      standard: "มาตรฐานความปลอดภัยระดับพื้นฐาน (Standard Security Best Practices)",
      strict: "มาตรการความปลอดภัยเข้มงวดสูงสำหรับองค์กรที่มีกฎหมายควบคุม (Highly Regulated Enterprise)",
      zero_trust: "การจัดการความเสี่ยงด้วยสถาปัตยกรรม Zero-Trust และแผนกู้คืนระบบระดับสูง (Full Zero-Trust & Disaster Recovery)"
    };

    const targetGoal = goalMap[itGoal] || "การวางแผนระบบและเป้าหมายธุรกิจแบบสมดุล";
    const targetRisk = riskMap[riskFocus] || "มาตรฐานความปลอดภัยระดับมาตรฐาน";

    // Construct prompt
    const prompt = `
คุณเป็นที่ปรึกษาสถาปัตยกรรมไอทีระดับองค์กร (Lead Enterprise IT Architect) และผู้เชี่ยวชาญด้านกลยุทธ์คลาวด์และการจัดการความเสี่ยงความมั่นคงปลอดภัยชั้นนำ
จงออกแบบสถาปัตยกรรมระบบไอที วางกลยุทธ์ด้าน IT และวางมาตรการบริหารความเสี่ยงสำหรับธุรกิจและเงื่อนไขต่อไปนี้อย่างมืออาชีพ:

- ประเภทธุรกิจ: ${businessType}
- เป้าหมายทางไอที/ธุรกิจหลัก: ${targetGoal}
- มาตรการจัดการความเสี่ยงและความปลอดภัย: ${targetRisk}
- ปริมาณผู้ใช้งานสูงสุดที่รองรับ: ${userVolume}
- มาตรฐานความปลอดภัย/ความคุ้มครองข้อมูลที่จำเป็น: ${compliance.length > 0 ? compliance.join(", ") : "ไม่มีข้อกำหนดพิเศษ"}
- ระดับงบประมาณ: ${budget}
- รูปแบบคลาวด์ที่อยากใช้หรือพิจารณา: ${cloudPreference}
- ระบบเดิมที่มีอยู่เดิม / เทคโนโลยีเดิม: ${existingTech || "ไม่มีระบบเดิม (Greenfield)"}
- รายละเอียดหรือข้อกำหนดเพิ่มเติมจากผู้ใช้: ${extraDescription || "ไม่มีข้อกำหนดเพิ่มเติม"}

ข้อมูลที่ท่านต้องวิเคราะห์และให้คำปรึกษาเชิงลึกโดยละเอียดตามเป้าหมายขององค์กร:
1. การวิเคราะห์และประเมินระบบ (System Analysis & Assessment):
   - ประเมินสถานะและจุดอ่อนของระบบเดิม (หากมี) หรือสิ่งท้าทายหลักในการออกแบบระบบใหม่ให้เข้ากับเป้าหมายธุรกิจ
   - วางขั้นตอนและแนวทางปรับปรุงระบบ (Improvement Path) ให้เข้ากับเป้าหมายทางธุรกิจ
2. การวางกลยุทธ์ IT (IT Strategic Roadmap):
   - แผนพัฒนาโครงสร้างพื้นฐานไอทีแบบเป็นขั้นเป็นตอน (Short-term, Mid-term, Long-term) เพื่อรองรับการขยายตัวและการเปลี่ยนแปลงในอนาคต (Future Growth & Adaptability)
3. การจัดการความเสี่ยงและความปลอดภัย (Risk Management & Security Plan):
   - การประเมินและระบุความเสี่ยงด้าน IT (Cyber threats, network downtime, database lock, data breaches)
   - แผนป้องกันควบคุมระบบ (Security controls) รวมถึงแผนความต่อเนื่องทางธุรกิจและการสำรองข้อมูลกู้คืนระบบกรณีภัยพิบัติ (Disaster Recovery Plan RTO/RPO)

ให้ตอบกลับในรูปแบบ JSON ตาม Schema ที่กำหนดไว้อย่างเคร่งครัด
ข้อความอธิบายความรู้และคำตอบทั้งหมดต้องเป็นภาษาไทยที่สุภาพ มีน้ำหนัก น่าเชื่อถือ อธิบายเป็นรูปธรรม และมีความลึกซึ้งทางวิศวกรรมซอฟต์แวร์
    `;

    // Define response schema to match the frontend types cleanly
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        executiveSummary: {
          type: Type.STRING,
          description: "สรุปคำแนะนำผู้บริหาร สไตล์ที่ปรึกษาระดับแนวหน้า เน้นเป้าหมายธุรกิจควบคู่กับประสิทธิภาพไอทีและต้นทุนในระยะยาว อธิบายเป็นภาษาไทยเชิงลึก 2-3 ย่อหน้าย่อย",
        },
        architectureStyle: {
          type: Type.STRING,
          description: "สไตล์โครงสร้างสถาปัตยกรรม เช่น Microservices Architecture, Hybrid Cloud Integration, Serverless Event-Driven, Secure Monolithic",
        },
        hybridCloudStrategy: {
          type: Type.STRING,
          description: "แผนกลยุทธ์การเชื่อมโยงระบบและข้อมูลและการใช้ประโยชน์ไฮบริดคลาวด์ เพื่อความคุ้มทุน ยืดหยุ่น และลดการผูกขาดกับผู้ให้บริการรายเดียว อธิบายภาษาไทย",
        },
        systemAnalysis: {
          type: Type.OBJECT,
          description: "การวิเคราะห์และประเมินระบบเพื่อปรับปรุงหรือสร้างใหม่ให้ตรงเป้าหมายธุรกิจ",
          properties: {
            legacyStatusAssessment: {
              type: Type.STRING,
              description: "การประเมินวิเคราะห์สถาปัตยกรรมระบบเดิม ปัญหาหลัก เช่น คอขวดข้อมูล คลาวด์ลิงก์ หรือความเสี่ยงหากเป็นระบบเดิม และสิ่งที่ต้องระวังหากเป็นระบบ Greenfield อธิบายภาษาไทยเชิงลึก",
            },
            improvementPath: {
              type: Type.STRING,
              description: "แนวทางและเฟสการปรับปรุงระบบเดิม หรือลำดับขั้นการพัฒนาไอทีให้ได้มาตรฐาน อธิบายภาษาไทยชัดเจน",
            },
            businessGoalAlignment: {
              type: Type.STRING,
              description: "อธิบายว่าสถาปัตยกรรมและโครงสร้างไอทีที่ออกแบบนี้ ตอบโจทย์เป้าหมายทางธุรกิจและความต้องการขององค์กรอย่างไรอย่างเป็นรูปธรรม อธิบายภาษาไทย",
            }
          },
          required: ["legacyStatusAssessment", "improvementPath", "businessGoalAlignment"]
        },
        itStrategyRoadmap: {
          type: Type.OBJECT,
          description: "การวางกลยุทธ์ IT เพื่อรองรับการเติบโตและการเปลี่ยนแปลงในอนาคต",
          properties: {
            phase1ShortTerm: {
              type: Type.STRING,
              description: "แผนยุทธศาสตร์ระยะสั้น (0-6 เดือน) เช่น การทำ Migration, การตั้งเครือข่ายความปลอดภัยขั้นต้น, การสอยผลไม้ใกล้ตัว (Quick Wins) อธิบายภาษาไทย",
            },
            phase2MidTerm: {
              type: Type.STRING,
              description: "แผนยุทธศาสตร์ระยะกลาง (6-18 เดือน) เช่น การปรับเป็น Microservices การทำซิงค์ข้อมูลไฮบริดขั้นสมบูรณ์ หรือระบบขยายตัวอัตโนมัติ อธิบายภาษาไทย",
            },
            phase3LongTerm: {
              type: Type.STRING,
              description: "แผนยุทธศาสตร์ระยะยาว (18+ เดือน) เช่น การนำข้อมูลมาวิเคราะห์ต่อยอด (Data Analytics/AI), การขับเคลื่อนด้วยเทคโนโลยีไร้เซิร์ฟเวอร์ (Serverless) และเสถียรภาพสูงสุด อธิบายภาษาไทย",
            },
            futureGrowthAdaptability: {
              type: Type.STRING,
              description: "การเตรียมพร้อมระบบเพื่อรองรับการเปลี่ยนแปลงทางธุรกิจขนาดใหญ่หรือการเติบโตของทราฟฟิกในอนาคต 3-5 ปีข้างหน้าอย่างยืดหยุ่น อธิบายภาษาไทย",
            }
          },
          required: ["phase1ShortTerm", "phase2MidTerm", "phase3LongTerm", "futureGrowthAdaptability"]
        },
        riskManagementPlan: {
          type: Type.OBJECT,
          description: "การบริหารความเสี่ยงและความปลอดภัยทางเทคโนโลยีสารสนเทศ",
          properties: {
            riskIdentification: {
              type: Type.STRING,
              description: "การระบุประเมินความเสี่ยงที่มีโอกาสเกิดสูงสุด (เช่น ระบบเครือข่ายขัดข้อง, ข้อมูลรั่วไหล, รหัสผ่านหลุด, ภัยโจมตี) พร้อมจัดระดับความรุนแรง อธิบายภาษาไทย",
            },
            threatMitigationControls: {
              type: Type.STRING,
              description: "มาตรการควบคุมและเครื่องมือในการปกป้องระบบ (เช่น การตั้ง WAF Rule, การทำเครือข่าย Private Subnet, การใช้ IAM Role, ระบบถอดรหัส Key Management) อธิบายภาษาไทย",
            },
            businessContinuityPlan: {
              type: Type.STRING,
              description: "แผนรักษาความต่อเนื่องทางธุรกิจและการกู้คืนข้อมูลกรณีฉุกเฉุกเฉิน (Disaster Recovery) พร้อมกำหนดเป้าหมาย RTO (Recovery Time Objective) และ RPO (Recovery Point Objective) อธิบายภาษาไทย",
            }
          },
          required: ["riskIdentification", "threatMitigationControls", "businessContinuityPlan"]
        },
        nodes: {
          type: Type.ARRAY,
          description: "รายการองค์ประกอบหรือระบบย่อยในผังโครงสร้าง (Topology Nodes) มีอย่างน้อย 6-9 โหนดเพื่อแสดงความครบถ้วนของระบบระดับ Enterprise",
          items: {
            type: Type.OBJECT,
            properties: {
              id: {
                type: Type.STRING,
                description: "รหัสโหนดที่ไม่ซ้ำกัน (เช่น load_balancer, waf, api_gateway, web_frontend, user_service, order_service, redis_cache, primary_db, replica_db, onprem_core_db, message_broker, legacy_sync_service)",
              },
              name: {
                type: Type.STRING,
                description: "ชื่อระบบย่อยภาษาไทยหรืออังกฤษกระชับ เช่น CloudFront CDN, AWS WAF Shield, API Gateway, Order Microservice, Primary Postgres (Multi-AZ), On-Premises Oracle Core DB",
              },
              category: {
                type: Type.STRING,
                description: "หมวดหมู่โหนด: ingress, security, gateway, compute, cache, database, queue, integration, other",
              },
              serviceName: {
                type: Type.STRING,
                description: "บริการหรือเทคโนโลยีเฉพาะ เช่น Amazon CloudFront, AWS WAF, AWS ECS / EKS, Redis Enterprise, Amazon RDS, Apache Kafka, Site-to-Site VPN, RabbitMQ",
              },
              details: {
                type: Type.STRING,
                description: "รายละเอียดสเปค คอนฟิก และฟีเจอร์เด่นเป็นภาษาไทย เช่น Auto-scaling 2-10 instances, Multi-AZ replication, VPC Private Subnet, In-memory clustering, SSL/TLS Offloading",
              },
              status: {
                type: Type.STRING,
                description: "สถานะเริ่มต้นประเมินความปลอดภัย: secure, warning, critical (โหนดที่มีความเสี่ยงต้องวิเคราะห์ให้ตรงกัน)",
              },
              provider: {
                type: Type.STRING,
                description: "ผู้บริการระบบ: aws, azure, gcp, hybrid, on-premise",
              },
              description: {
                type: Type.STRING,
                description: "หน้าที่และความรับผิดชอบของโหนดนี้ในภาพรวมระบบ ภาษาไทย",
              },
            },
            required: ["id", "name", "category", "serviceName", "details", "status", "provider", "description"],
          },
        },
        connections: {
          type: Type.ARRAY,
          description: "ความเชื่อมโยงและทิศทางข้อมูลระหว่างโหนดต่างๆ (Topology Connections) แสดงการไหลของข้อมูลจากผู้ใช้ไปจนถึงระบบฐานข้อมูลและ On-premise",
          items: {
            type: Type.OBJECT,
            properties: {
              from: { type: Type.STRING, description: "id ของโหนดต้นทาง เช่น waf" },
              to: { type: Type.STRING, description: "id ของโหนดปลายทาง เช่น api_gateway" },
              label: { type: Type.STRING, description: "คำอธิบายเส้นทางไหลข้อมูล เช่น HTTPS (TLS 1.3), REST API, gRPC, CDC Async Sync, JDBC/TCP" },
            },
            required: ["from", "to", "label"],
          },
        },
        bottlenecks: {
          type: Type.ARRAY,
          description: "รายการปัญหาคอขวดที่อาจเกิดขึ้นและข้อเสนอแนะในการแก้ไข (มีอย่างน้อย 3 รายการ)",
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING, description: "รหัสคอขวด เช่น bottleneck_1" },
              title: { type: Type.STRING, description: "หัวข้อปัญหาคอขวด ภาษาไทย" },
              description: { type: Type.STRING, description: "รายละเอียดและปัจจัยกระตุ้นให้เกิดปัญหานั้นๆ ภาษาไทย" },
              severity: { type: Type.STRING, description: "ระดับความรุนแรง: high, medium, low" },
              solution: { type: Type.STRING, description: "แผนหรือเทคนิคการสลายคอขวดอย่างละเอียด ภาษาไทย" },
            },
            required: ["id", "title", "description", "severity", "solution"],
          },
        },
        securityRisks: {
          type: Type.ARRAY,
          description: "รายการความเสี่ยงด้านความปลอดภัยและการบรรเทาความเสียหาย (มีอย่างน้อย 3 รายการ)",
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING, description: "รหัส เช่น sec_risk_1" },
              title: { type: Type.STRING, description: "หัวข้อความเสี่ยง ภาษาไทย" },
              description: { type: Type.STRING, description: "รายละเอียดความเสี่ยง วิธีที่ผู้โจมตีอาจทำ หรือช่องโหว่ทางเทคนิค ภาษาไทย" },
              severity: { type: Type.STRING, description: "ระดับความรุนแรง: high, medium, low" },
              mitigation: { type: Type.STRING, description: "มาตรการแก้ไขและตั้งค่าระบบไอทีเชิงรับเชิงรุก ภาษาไทย" },
            },
            required: ["id", "title", "description", "severity", "mitigation"],
          },
        },
        costOptimization: {
          type: Type.ARRAY,
          description: "คำแนะนำกลยุทธ์การลดต้นทุนระยะยาว (มีอย่างน้อย 3 รายการ)",
          items: {
            type: Type.OBJECT,
            properties: {
              item: { type: Type.STRING, description: "รายการวิธีการประหยัด เช่น Instance Savings Plans, Auto-shutdown dev servers, Spot Instances, Hybrid Database offloading" },
              currentEstimate: { type: Type.STRING, description: "ค่าใช้จ่ายโดยประมาณต่อเดือนในกรณีปกติ (ระบุเป็นดอลลาร์สหรัฐหรือบาทต่อเดือน)" },
              hybridStrategy: { type: Type.STRING, description: "กลยุทธ์ไฮบริดหรือเครื่องมือประหยัดเฉพาะด้าน ภาษาไทย" },
              potentialSavings: { type: Type.STRING, description: "ส่วนลดหรือยอดที่คาดว่าจะประหยัดได้ เช่น ประหยัดเพิ่ม 35%, ลดค่าดาต้าลง 50%" },
            },
            required: ["item", "currentEstimate", "hybridStrategy", "potentialSavings"],
          },
        },
        techComparison: {
          type: Type.ARRAY,
          description: "การเปรียบเทียบเทคโนโลยีในแต่ละชั้นระบบ (อย่างน้อย 4 ชั้นระบบหลัก เช่น Compute, Database, Caching, API Gateway)",
          items: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING, description: "หมวดหมู่บริการ" },
              awsProduct: { type: Type.STRING, description: "บริการในค่าย AWS" },
              azureProduct: { type: Type.STRING, description: "บริการในค่าย Azure" },
              gcpProduct: { type: Type.STRING, description: "บริการในค่าย GCP" },
              hybridApproach: { type: Type.STRING, description: "ทางเลือกแบบผสม Hybrid / Open-Source และการเชื่อมต่อระบบ On-Premise" },
              pros: { type: Type.STRING, description: "ข้อดีเด่น เปรียบเทียบเป็นข้อๆ ภาษาไทย" },
              cons: { type: Type.STRING, description: "ข้อเสีย/ข้อควรระวัง เปรียบเทียบเป็นข้อๆ ภาษาไทย" },
            },
            required: ["category", "awsProduct", "azureProduct", "gcpProduct", "hybridApproach", "pros", "cons"],
          },
        },
      },
      required: [
        "executiveSummary",
        "architectureStyle",
        "hybridCloudStrategy",
        "systemAnalysis",
        "itStrategyRoadmap",
        "riskManagementPlan",
        "nodes",
        "connections",
        "bottlenecks",
        "securityRisks",
        "costOptimization",
        "techComparison",
      ],
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema,
        temperature: 0.2,
      },
    });

    const reportJson = JSON.parse(response.text?.trim() || "{}");
    res.json(reportJson);
  } catch (error: any) {
    console.error("Error analyzing architecture:", error);
    res.status(500).json({
      error: "เกิดข้อผิดพลาดในการวิเคราะห์สถาปัตยกรรมระบบระบบไอที",
      details: error.message,
    });
  }
});

// API: Chat Advisor for Follow-up Questions
app.post("/api/chat-advisor", async (req, res) => {
  try {
    const { requirements, currentReport, messages, newMessage } = req.body;

    const ai = getGeminiClient();

    // Construct previous conversation context
    const conversationHistory = messages
      .map((msg: any) => `${msg.sender === "user" ? "ผู้ใช้" : "ที่ปรึกษาสถาปัตยกรรม"}: ${msg.text}`)
      .join("\n");

    const systemInstruction = `
คุณเป็นสถาปนิกไอทีระดับองค์กรอัจฉริยะ (Enterprise IT Architect AI Advisor)
ปัจจุบันคุณกำลังให้คำปรึกษาแก่ผู้ใช้งานเกี่ยวกับการออกแบบระบบสถาปัตยกรรมไอทีและกลยุทธ์คลาวด์สำหรับธุรกิจของเขา

รายละเอียดระบบที่ออกแบบในปัจจุบัน:
- สไตล์สถาปัตยกรรม: ${currentReport?.architectureStyle || "ทั่วไป"}
- ข้อกำหนดธุรกิจ: ${requirements ? JSON.stringify(requirements) : "ทั่วไป"}

ข้อมูลโครงสร้างโหนดที่คุณเพิ่งแนะนำ:
${
  currentReport?.nodes
    ? currentReport.nodes.map((n: any) => `- โหนด: ${n.name} (บริการ: ${n.serviceName}, สเปค: ${n.details}, ผู้บริการ: ${n.provider})`).join("\n")
    : "ไม่มีข้อมูลโหนด"
}

แนวทางการตอบคำถาม:
1. ตอบคำถามด้วยความเป็นมืออาชีพ สุภาพ มีหลักการทางวิศวกรรมซอฟต์แวร์และคลาวด์รองรับอย่างชัดเจน
2. พยายามให้ตัวอย่างที่เป็นประโยชน์ เช่น วิธีการตั้งค่า, แนวคิดในการเชื่อมต่อ (gRPC vs REST, VPN vs Direct Connect), หรือขั้นตอนแก้ปัญหาคอขวด
3. ใช้ภาษาไทยเป็นหลัก สามารถใช้คำศัพท์เทคนิคภาษาอังกฤษทับศัพท์หรือเขียนกำกับได้ตามความคุ้มค่าและเข้าใจง่าย
4. มุ่งเน้นการแก้ปัญหาที่เกิดประโยชน์สูงสุด เช่น การลดต้นทุนและการรักษาระดับความปลอดภัยระดับสูงสุด
    `;

    const chatPrompt = `
บทสนทนาก่อนหน้านี้:
${conversationHistory}

ผู้ใช้ถามคำถามใหม่:
"${newMessage}"

จงให้คำตอบเชิงลึก อธิบายเป็นข้อๆ หรือมีคำแนะนำเชิงเทคนิคที่เป็นรูปธรรม (Concrete Technical Recommendations) ให้ตอบเป็นภาษาไทย
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: chatPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ reply: response.text || "ขออภัยด้วยครับ ผมไม่สามารถวิเคราะห์ข้อมูลนี้ได้ในขณะนี้" });
  } catch (error: any) {
    console.error("Error in chat advisor:", error);
    res.status(500).json({
      error: "เกิดข้อผิดพลาดในการประมวลผลข้อความแชท",
      details: error.message,
    });
  }
});

// Configure serving of Vite build / middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // In dev mode, mount Vite as middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve built files
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
