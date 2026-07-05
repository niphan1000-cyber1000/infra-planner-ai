import { GoogleGenAI, Type } from "@google/genai";
import { logger } from "../middlewares/security";

// Safe JSON Parsing helper to clean up Markdown-wrapped outputs from Gemini
export const parseGeminiJson = (text: string | undefined | null) => {
  if (!text) return {};
  let cleaned = text.trim();
  
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }
  cleaned = cleaned.trim();
  
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    logger.error("Failed to parse Gemini response as JSON. Raw text:", text);
    throw new Error("Invalid response format received from AI");
  }
};

// Initialize Gemini API client safely
const getGeminiClient = (): GoogleGenAI => {
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

// Define response schema to match the frontend types cleanly
const responseSchema = {
  type: Type.OBJECT,
  properties: {
    executiveSummary: {
      type: Type.STRING,
      description: "สรุปคำแนะนำผู้บริหาร สไตล์ที่ปรึกษาระดับสูง กระชับและทรงพลัง ภาษาไทย",
    },
    architectureStyle: {
      type: Type.STRING,
      description: "รูปแบบสถาปัตยกรรมหลัก เช่น Microservices, Event-Driven, Hybrid Cloud, Serverless, Monolithic Modernization",
    },
    hybridCloudStrategy: {
      type: Type.STRING,
      description: "แนวทางการบูรณาการกลยุทธ์ Hybrid Cloud หรือการรวมเทคโนโลยี On-Premise และ Cloud เข้าด้วยกันอย่างมีประสิทธิภาพ ภาษาไทย",
    },
    systemAnalysis: {
      type: Type.OBJECT,
      description: "การวิเคราะห์ประเมินระบบอย่างลึกซึ้ง",
      properties: {
        legacyStatusAssessment: {
          type: Type.STRING,
          description: "การประเมินสถานะ ปัญหาคอขวด หรือความปลอดภัยของระบบ Legacy เดิม ภาษาไทย",
        },
        improvementPath: {
          type: Type.STRING,
          description: "ขั้นตอนเชิงปฏิบัติเพื่อการอัปเกรดหรือปรับปรุงระบบ ภาษาไทย",
        },
        businessGoalAlignment: {
          type: Type.STRING,
          description: "อธิบายว่าการดีไซน์นี้ตอบสนองเป้าหมายทางธุรกิจได้อย่างไร ภาษาไทย",
        },
      },
      required: ["legacyStatusAssessment", "improvementPath", "businessGoalAlignment"],
    },
    itStrategyRoadmap: {
      type: Type.OBJECT,
      description: "แผนกลยุทธ์และการเติบโตทางไอที",
      properties: {
        phase1ShortTerm: {
          type: Type.STRING,
          description: "แผนระยะสั้น (0 - 6 เดือน): Phase 1 การเตรียมความพร้อมและปรับเปลี่ยนโครงสร้างหลัก ภาษาไทย",
        },
        phase2MidTerm: {
          type: Type.STRING,
          description: "แผนระยะกลาง (6 - 18 เดือน): Phase 2 การขยายตัวและการย้ายข้อมูล ภาษาไทย",
        },
        phase3LongTerm: {
          type: Type.STRING,
          description: "แผนระยะยาว (18+ เดือน): Phase 3 สู่ระบบคลาวด์และสถาปัตยกรรมแบบ Serverless เสถียรภาพสูงสุด ภาษาไทย",
        },
        futureGrowthAdaptability: {
          type: Type.STRING,
          description: "การเตรียมพร้อมระบบเพื่อรองรับการเปลี่ยนแปลงทางธุรกิจในอนาคต 3-5 ปีข้างหน้าอย่างยืดหยุ่น ภาษาไทย",
        },
      },
      required: ["phase1ShortTerm", "phase2MidTerm", "phase3LongTerm", "futureGrowthAdaptability"],
    },
    riskManagementPlan: {
      type: Type.OBJECT,
      description: "การบริหารความเสี่ยงและความปลอดภัยทางไอที",
      properties: {
        riskIdentification: {
          type: Type.STRING,
          description: "การระบุความเสี่ยงที่มีนัยสำคัญด้านไอทีและระบบคลาวด์ ภาษาไทย",
        },
        threatMitigationControls: {
          type: Type.STRING,
          description: "มาตรการควบคุมเพื่อบรรเทาภัยคุกคามทางไซเบอร์และความเป็นส่วนตัวของข้อมูล ภาษาไทย",
        },
        businessContinuityPlan: {
          type: Type.STRING,
          description: "แผนสำรองข้อมูลกู้คืนภัยพิบัติ DR Plan กำหนดเป้าหมาย RTO/RPO เพื่อความต่อเนื่องทางธุรกิจ ภาษาไทย",
        },
      },
      required: ["riskIdentification", "threatMitigationControls", "businessContinuityPlan"],
    },
    nodes: {
      type: Type.ARRAY,
      description: "รายการองค์ประกอบหรือระบบย่อยในผังโครงสร้าง (Topology Nodes) มีอย่างน้อย 6-9 โหนดเพื่อแสดงความครบถ้วนของระบบระดับ Enterprise",
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "รหัสเฉพาะของโหนด เช่น web_app, database, api_gateway" },
          name: { type: Type.STRING, description: "ชื่อโหนดภาษาไทย เช่น เว็บแอปพลิเคชัน, ระบบฐานข้อมูลหลัก" },
          category: { 
            type: Type.STRING, 
            description: "ประเภทโหนด: ingress, security, gateway, compute, cache, database, queue, integration, other" 
          },
          serviceName: { type: Type.STRING, description: "ชื่อบริการจริง เช่น Amazon ECS, Azure SQL, On-Premises Oracle" },
          details: { type: Type.STRING, description: "รายละเอียดสเปค เช่น Multi-AZ, Read Replicas, Auto-scaling" },
          status: { type: Type.STRING, description: "สถานะความมั่นคงปลอดภัย: secure, warning, critical" },
          provider: { type: Type.STRING, description: "ผู้ให้บริการ: aws, azure, gcp, hybrid, on-premise" },
          description: { type: Type.STRING, description: "อธิบายสั้นๆ เกี่ยวกับหน้าที่ของโหนดนี้ในระบบ" },
        },
        required: ["id", "name", "category", "serviceName", "details", "status", "provider", "description"],
      },
    },
    connections: {
      type: Type.ARRAY,
      description: "รายการเส้นทางการเชื่อมโยงและการส่งข้อมูลระหว่างโหนดต่างๆ จากผู้ใช้ปลายทางไปจนถึงระบบฐานข้อมูลและ On-premise",
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

/**
 * Execute a promise with a safety timeout wrapper (Resilience / Greenfield requirement)
 */
const withTimeout = <T>(promise: Promise<T>, timeoutMs = 35000): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout: Gemini API took too long to respond")), timeoutMs)
    ),
  ]);
};

/**
 * Robust retry mechanism with exponential backoff for maximum resilience
 */
const executeWithRetry = async <T>(operation: () => Promise<T>, retries = 3, delay = 1500): Promise<T> => {
  let lastError: any;
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (err: any) {
      lastError = err;
      logger.warn(`Gemini operation attempt ${i + 1} failed. Retrying in ${delay}ms...`, { error: err.message });
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2; // exponential backoff
    }
  }
  throw lastError;
};

/**
 * Analyze systems architecture with Gemini model
 */
export const analyzeArchitecture = async (payload: {
  businessType: string;
  userVolume: string;
  budget: string;
  cloudPreference: string;
  existingTech: string;
  extraDescription: string;
  itGoal: string;
  riskFocus: string;
  compliance: string[];
}): Promise<any> => {
  const goalMap: Record<string, string> = {
    modernize: "การปรับปรุงระบบเดิมและเชื่อมต่อ Legacy ให้มีประสิทธิภาพสูงสุด (Modernize Legacy & Interoperability)",
    greenfield: "การวางแผนออกแบบระบบใหม่ทั้งหมดตั้งแต่ต้นให้เหมาะกับเป้าหมายธุรกิจและการเติบโต (Greenfield System Design)",
    security: "เน้นยกระดับความปลอดภัยและความน่าเชื่อถือสูงสุดเพื่อปกป้องทรัพย์สินดิจิทัล (Maximum Security & High Availability)",
    cost: "เน้นความคุ้มค่า ควบคุมต้นทุนระยะยาว และใช้ทรัพยากรอย่างเสถียร (Cost Optimization & Lean Operations)",
  };

  const riskMap: Record<string, string> = {
    standard: "มาตรฐานความปลอดภัยระดับพื้นฐาน (Standard Security Best Practices)",
    strict: "มาตรการความปลอดภัยเข้มงวดสูงสำหรับองค์กรที่มีกฎหมายควบคุม (Highly Regulated Enterprise)",
    zero_trust: "การจัดการความเสี่ยงด้วยสถาปัตยกรรม Zero-Trust และแผนกู้คืนระบบระดับสูง (Full Zero-Trust & Disaster Recovery)",
  };

  const targetGoal = goalMap[payload.itGoal] || "การวางแผนระบบและเป้าหมายธุรกิจแบบสมดุล";
  const targetRisk = riskMap[payload.riskFocus] || "มาตรฐานความปลอดภัยระดับมาตรฐาน";

  const prompt = `
คุณเป็นที่ปรึกษาสถาปัตยกรรมไอทีระดับองค์กร (Lead Enterprise IT Architect) และผู้เชี่ยวชาญด้านกลยุทธ์คลาวด์และการจัดการความเสี่ยงความมั่นคงปลอดภัยชั้นนำ
จงออกแบบและวางแผนสถาปัตยกรรมระบบไอที (Enterprise IT Architecture) สำหรับธุรกิจดังต่อไปนี้:
- ประเภทธุรกิจ: ${payload.businessType}
- ปริมาณผู้ใช้งานที่คาดหวัง: ${payload.userVolume}
- ความต้องการด้าน Compliance และมาตรฐานที่จำเป็น: ${payload.compliance.length > 0 ? payload.compliance.join(", ") : "ไม่มีข้อกำหนดเฉพาะ"}
- ระดับงบประมาณในการลงทุน: ${payload.budget === 'low' ? 'ควบคุมต้นทุนอย่างเข้มงวด (Cost-focused)' : payload.budget === 'balanced' ? 'สมดุลระหว่างความคุ้มค่าและประสิทธิภาพ (Value-driven)' : 'มุ่งเน้นประสิทธิภาพและนวัตกรรมโดยไม่จำกัดงบประมาณ (Enterprise-grade)'}
- คลาวด์ที่ต้องการใช้งาน (Cloud Preference): ${payload.cloudPreference}
- ระบบไอทีเดิม (Legacy / On-Premise / Existing Systems): ${payload.existingTech || "ไม่มีระบบเดิม"}
- รายละเอียดข้อกำหนดเพิ่มเติม: ${payload.extraDescription || "ไม่มีข้อกำหนดเพิ่มเติม"}
- เป้าหมายไอทีสูงสุด (IT Goal): ${targetGoal}
- ระดับการจัดการความเสี่ยง (Risk Focus): ${targetRisk}

ผลลัพธ์ที่ได้จะต้องตอบกลับมาในรูปแบบ JSON ตาม Schema ที่ระบุ โดยต้องมีข้อมูลสอดคล้องกัน มีภาษาไทยที่สละสลวย มีความเป็นมืออาชีพเชิงลึก มีแนวทางปฏิบัติได้จริง
`;

  logger.info("Sending prompt to Gemini with architecture parameters", {
    businessType: payload.businessType,
    cloudPreference: payload.cloudPreference,
    itGoal: payload.itGoal,
  });

  return await executeWithRetry(async () => {
    const ai = getGeminiClient();
    const responsePromise = ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema,
        temperature: 0.2,
      },
    });

    const response = await withTimeout(responsePromise, 35000);
    return parseGeminiJson(response.text);
  });
};

/**
 * Conversation advice for follow-up system queries
 */
export const consultChatAdvisor = async (payload: {
  requirements: any;
  currentReport: any;
  messages: any[];
  newMessage: string;
}): Promise<string> => {
  const conversationHistory = payload.messages
    .map((msg: any) => `${msg.sender === "user" ? "ผู้ใช้" : "ที่ปรึกษาสถาปัตยกรรม"}: ${msg.text}`)
    .join("\n");

  const systemInstruction = `
คุณเป็นสถาปนิกไอทีระดับองค์กรอัจฉริยะ (Enterprise IT Architect AI Advisor)
ปัจจุบันคุณกำลังให้คำปรึกษาแก่ผู้ใช้งานเกี่ยวกับการออกแบบระบบสถาปัตยกรรมไอทีและกลยุทธ์คลาวด์สำหรับธุรกิจของเขา

รายละเอียดระบบที่ออกแบบในปัจจุบัน:
- สไตล์สถาปัตยกรรม: ${payload.currentReport?.architectureStyle || "ทั่วไป"}
- ข้อกำหนดธุรกิจ: ${payload.requirements ? JSON.stringify(payload.requirements) : "ทั่วไป"}

ข้อมูลโครงสร้างโหนดที่คุณเพิ่งแนะนำ:
${
  payload.currentReport?.nodes
    ? payload.currentReport.nodes.map((n: any) => `- โหนด: ${n.name} (บริการ: ${n.serviceName}, สเปค: ${n.details}, ผู้บริการ: ${n.provider})`).join("\n")
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
"${payload.newMessage}"

จงให้คำตอบเชิงลึก อธิบายเป็นข้อๆ หรือมีคำแนะนำเชิงเทคนิคที่เป็นรูปธรรม (Concrete Technical Recommendations) ให้ตอบเป็นภาษาไทย
`;

  logger.info("Consulting Chat Advisor for client follow-up");

  return await executeWithRetry(async () => {
    const ai = getGeminiClient();
    const responsePromise = ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: chatPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const response = await withTimeout(responsePromise, 30000);
    return response.text || "ขออภัยด้วยครับ ผมไม่สามารถวิเคราะห์ข้อมูลนี้ได้ในขณะนี้";
  });
};
