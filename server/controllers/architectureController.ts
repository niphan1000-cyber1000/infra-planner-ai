import { Request, Response } from "express";
import * as geminiService from "../services/geminiService";
import { logger } from "../middlewares/security";
import { cacheService } from "../services/cacheService";
import { AppError } from "../errors/AppError";

/**
 * Maps system, database, security, and Gemini SDK errors to appropriate HTTP Status Codes and structures.
 */
const mapErrorToResponse = (error: any, defaultMessage: string) => {
  // If it's our custom AppError, directly use its code and message
  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      error: error.name === "AppError" ? "เกิดข้อผิดพลาดในการประมวลผลระบบ" : error.message,
      details: error.message
    };
  }

  const errorMessage = error?.message || String(error);
  const status = error?.status || error?.statusCode;

  // 1. Rate Limit / Quota Exceeded (429)
  if (
    status === 429 ||
    errorMessage.includes("429") ||
    errorMessage.includes("RESOURCE_EXHAUSTED") ||
    errorMessage.includes("Quota exceeded") ||
    errorMessage.includes("Too Many Requests")
  ) {
    return {
      statusCode: 429,
      error: "เกินโควตาการใช้งานชั่วคราว (Rate Limit / Quota Exceeded)",
      details: "ความต้องการใช้บริการสูงเกินกำหนดในขณะนี้ กรุณารอประมาณ 1 นาทีแล้วลองใหม่อีกครั้ง"
    };
  }

  // 2. Timeout / Service Unavailable (503)
  if (
    errorMessage.includes("Timeout after") ||
    errorMessage.includes("timeout") ||
    error?.name === "AbortError" ||
    errorMessage.includes("abort") ||
    status === 503 ||
    errorMessage.includes("503") ||
    errorMessage.includes("Service Unavailable") ||
    errorMessage.includes("Unavailable") ||
    errorMessage.includes("Overloaded")
  ) {
    return {
      statusCode: 503,
      error: "การเชื่อมต่อระบบบริการ AI หมดเวลาชั่วคราว (Service Timeout / Unavailable)",
      details: "ระบบประมวลผลใช้เวลานานเกินกำหนด หรือเซิร์ฟเวอร์ของ Gemini มีผู้ใช้งานหนาแน่นในขณะนี้ กรุณาลองใหม่อีกครั้ง"
    };
  }

  // 3. Unauthorized / Invalid API Key (401)
  if (
    status === 401 ||
    status === 403 ||
    errorMessage.includes("401") ||
    errorMessage.includes("403") ||
    errorMessage.includes("API_KEY_INVALID") ||
    errorMessage.includes("invalid API key") ||
    errorMessage.includes("unauthorized") ||
    errorMessage.includes("forbidden") ||
    errorMessage.includes("API key not found")
  ) {
    return {
      statusCode: 401,
      error: "การยืนยันตัวตนล้มเหลว (Unauthorized)",
      details: "สิทธิ์การเข้าใช้งานระบบหรือ API Key ไม่ถูกต้อง โปรดติดต่อผู้ดูแลระบบเพื่อตรวจสอบความถูกต้องหลังบ้าน"
    };
  }

  // 4. Bad Request / Prompt Injection / Validation (400)
  if (
    errorMessage.includes("Security Policy Violation") ||
    errorMessage.includes("ความปลอดภัยสูงสุด") ||
    errorMessage.includes("ความมั่นคงปลอดภัย") ||
    error?.name === "ZodError" ||
    errorMessage.includes("ZodError") ||
    errorMessage.includes("invalid JSON") ||
    errorMessage.includes("Failed to parse") ||
    status === 400 ||
    errorMessage.includes("400")
  ) {
    return {
      statusCode: 400,
      error: "ข้อมูลนำเข้าหรือผลลัพธ์ไม่ถูกต้อง (Bad Request / Validation Error)",
      details: errorMessage.includes("ความมั่นคงปลอดภัย") || errorMessage.includes("ความปลอดภัย")
        ? errorMessage
        : "ข้อมูลอินพุตหรือคำตอบที่ได้รับไม่สอดคล้องกับโครงสร้างที่กำหนด โปรดตรวจสอบข้อมูลนำเข้าแล้วลองใหม่อีกครั้ง"
    };
  }

  // 5. Default Internal Server Error (500)
  return {
    statusCode: 500,
    error: defaultMessage,
    details: "ระบบขัดข้องชั่วคราว โปรดตรวจสอบรายงานความผิดพลาดจากเซิร์ฟเวอร์ หรือลองใหม่อีกครั้งในภายหลัง"
  };
};

/**
 * Controller: Design and analyze enterprise IT architecture plan
 */
export const handleAnalyzeArchitecture = async (req: Request, res: Response) => {
  try {
    const {
      businessType,
      userVolume,
      budget,
      cloudPreference,
      existingTech,
      extraDescription,
      itGoal,
      riskFocus,
      compliance
    } = req.body;

    const reportJson = await geminiService.analyzeArchitecture({
      businessType,
      userVolume,
      budget,
      cloudPreference,
      existingTech,
      extraDescription,
      itGoal,
      riskFocus,
      compliance
    });

    res.json(reportJson);
  } catch (error: any) {
    logger.error("Error inside handleAnalyzeArchitecture controller:", error);
    const mapped = mapErrorToResponse(error, "เกิดข้อผิดพลาดในการวิเคราะห์สถาปัตยกรรมระบบไอที");
    res.status(mapped.statusCode).json({
      error: mapped.error,
      details: mapped.details
    });
  }
};

/**
 * Controller: Handles follow-up conversational consult queries
 */
export const handleChatAdvisor = async (req: Request, res: Response) => {
  try {
    const { requirements, currentReport, messages, newMessage } = req.body;

    const result = await geminiService.consultChatAdvisor({
      requirements,
      currentReport,
      messages,
      newMessage
    });

    res.json({
      reply: result.reply,
      cacheStatus: result.cacheStatus,
      cacheKey: result.cacheKey
    });
  } catch (error: any) {
    logger.error("Error inside handleChatAdvisor controller:", error);
    const mapped = mapErrorToResponse(error, "เกิดข้อผิดพลาดในการประมวลผลข้อความแชท");
    res.status(mapped.statusCode).json({
      error: mapped.error,
      details: mapped.details
    });
  }
};

/**
 * Controller: Clear all cache entries
 */
export const handleClearCache = async (req: Request, res: Response) => {
  try {
    await cacheService.clear();
    res.json({
      status: "ok",
      message: "ล้างข้อมูลแคชสำเร็จแล้ว (Cache flushed successfully)"
    });
  } catch (error: any) {
    logger.error("Error inside handleClearCache controller:", error);
    const mapped = mapErrorToResponse(error, "เกิดข้อผิดพลาดในการล้างข้อมูลแคช");
    res.status(mapped.statusCode).json({
      error: mapped.error,
      details: mapped.details || error.message || error
    });
  }
};
