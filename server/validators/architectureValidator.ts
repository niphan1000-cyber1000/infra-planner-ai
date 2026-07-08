import { Request, Response, NextFunction } from "express";
import { sanitizeInput, hasPromptInjectionAttempt } from "../middlewares/security";

export const validateArchitectureRequest = (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Sanitize and assign to request body
    req.body.businessType = sanitizeInput(req.body.businessType, 100);
    req.body.userVolume = sanitizeInput(req.body.userVolume, 20);
    req.body.budget = sanitizeInput(req.body.budget, 20);
    req.body.cloudPreference = sanitizeInput(req.body.cloudPreference, 20);
    req.body.existingTech = sanitizeInput(req.body.existingTech, 500);
    req.body.extraDescription = sanitizeInput(req.body.extraDescription, 1000);
    req.body.itGoal = sanitizeInput(req.body.itGoal, 20);
    req.body.riskFocus = sanitizeInput(req.body.riskFocus, 20);

    // 1.1 Check for Prompt Injection attempts on user-submitted text fields
    if (
      hasPromptInjectionAttempt(req.body.businessType) ||
      hasPromptInjectionAttempt(req.body.existingTech) ||
      hasPromptInjectionAttempt(req.body.extraDescription)
    ) {
      return res.status(400).json({
        error:
          "ตรวจพบข้อความที่มีความเสี่ยงความปลอดภัยสูงสุด (Prompt Injection Detected) กรุณาหลีกเลี่ยงการใช้คำสั่งที่ควบคุมสิทธิ์การทำงานของระบบ",
      });
    }

    const rawCompliance = Array.isArray(req.body.compliance) ? req.body.compliance : [];
    req.body.compliance = rawCompliance
      .map((c: any) => sanitizeInput(String(c), 15))
      .filter((c: string) => ["PDPA", "HIPAA", "PCI-DSS", "GDPR"].includes(c));

    // 2. Schema Validation
    if (!req.body.businessType) {
      return res.status(400).json({ error: "โปรดระบุประเภทธุรกิจที่ถูกต้อง" });
    }

    const validUserVolumes = ["low", "medium", "high", "extreme"];
    if (!validUserVolumes.includes(req.body.userVolume)) {
      return res.status(400).json({ error: "โปรดเลือกปริมาณผู้ใช้งานที่ถูกต้อง" });
    }

    const validBudgets = ["low", "balanced", "unlimited"];
    if (!validBudgets.includes(req.body.budget)) {
      return res.status(400).json({ error: "โปรดเลือกงบประมาณที่ถูกต้อง" });
    }

    const validCloudPrefs = ["aws", "azure", "gcp", "hybrid", "on-premise"];
    if (!validCloudPrefs.includes(req.body.cloudPreference)) {
      return res.status(400).json({ error: "โปรดเลือกรูปแบบคลาวด์ที่ถูกต้อง" });
    }

    const validGoals = ["modernize", "greenfield", "security", "cost"];
    if (!validGoals.includes(req.body.itGoal)) {
      return res.status(400).json({ error: "โปรดเลือกเป้าหมายไอทีที่ถูกต้อง" });
    }

    const validRisks = ["standard", "strict", "zero_trust"];
    if (!validRisks.includes(req.body.riskFocus)) {
      return res.status(400).json({ error: "โปรดเลือกการบริหารความเสี่ยงที่ถูกต้อง" });
    }

    next();
  } catch (err) {
    res.status(400).json({ error: "ข้อมูลนำส่งไม่ผ่านการตรวจสอบความมั่นคงของโครงสร้างข้อมูล" });
  }
};

export const validateChatRequest = (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Validate requirements and currentReport context for prompt injection
    if (req.body.requirements) {
      const reqStr =
        typeof req.body.requirements === "object"
          ? JSON.stringify(req.body.requirements)
          : String(req.body.requirements);
      if (hasPromptInjectionAttempt(reqStr)) {
        return res.status(400).json({
          error:
            "ตรวจพบข้อความที่มีความเสี่ยงความปลอดภัยสูง (Prompt Injection Detected) ในความต้องการระบบ",
        });
      }
    }

    if (req.body.currentReport) {
      const reportStr =
        typeof req.body.currentReport === "object"
          ? JSON.stringify(req.body.currentReport)
          : String(req.body.currentReport);
      if (hasPromptInjectionAttempt(reportStr)) {
        return res.status(400).json({
          error:
            "ตรวจพบข้อความที่มีความเสี่ยงความปลอดภัยสูง (Prompt Injection Detected) ในข้อมูลบริบรายงานสถาปัตยกรรม",
        });
      }
    }

    // 2. Validate newMessage length and presence
    req.body.newMessage = sanitizeInput(req.body.newMessage, 1000);
    if (!req.body.newMessage) {
      return res.status(400).json({ error: "โปรดกรอกข้อความที่ต้องการถามที่ปรึกษาไอที" });
    }

    // 2.1 Check for Prompt Injection on chat message input
    if (hasPromptInjectionAttempt(req.body.newMessage)) {
      return res.status(400).json({
        error:
          "ตรวจพบข้อความที่มีความเสี่ยงความปลอดภัยสูง (Prompt Injection Detected) กรุณาหลีกเลี่ยงการใช้คำสั่งที่พยายามควบคุมระบบหรือบทบาทของปัญญาประดิษฐ์",
      });
    }

    // 3. Validate messages array if provided
    if (req.body.messages !== undefined) {
      if (!Array.isArray(req.body.messages)) {
        return res
          .status(400)
          .json({ error: "ประวัติข้อความแชทต้องอยู่ในรูปแบบของรายการ (Array)" });
      }

      // Limit size of history to prevent abuse or memory load (max 50 messages)
      if (req.body.messages.length > 50) {
        return res
          .status(400)
          .json({ error: "ประวัติข้อความแชทเกินขีดจำกัดความยาวสูงสุด (สูงสุด 50 ข้อความ)" });
      }

      // Sanitize each history entry and check for prompt injection
      req.body.messages = req.body.messages.map((msg: any) => {
        if (!msg || typeof msg !== "object") {
          return { sender: "user", text: "", time: "" };
        }

        const text = sanitizeInput(String(msg.text || ""), 2000);

        if (hasPromptInjectionAttempt(text)) {
          throw new Error("PROMPT_INJECTION_HISTORY_DETECTED");
        }

        return {
          sender: String(msg.sender) === "ai" || String(msg.sender) === "model" ? "ai" : "user",
          text, // Max 2000 chars per history message
          time: sanitizeInput(String(msg.time || ""), 20),
        };
      });
    }

    next();
  } catch (err: any) {
    if (err && err.message === "PROMPT_INJECTION_HISTORY_DETECTED") {
      return res.status(400).json({
        error:
          "ตรวจพบข้อความที่มีความเสี่ยงความปลอดภัยสูง (Prompt Injection Detected) ในข้อมูลประวัติการแชท",
      });
    }
    res.status(400).json({ error: "ข้อมูลข้อความแชทไม่ถูกต้องตามมาตรฐานความปลอดภัย" });
  }
};
