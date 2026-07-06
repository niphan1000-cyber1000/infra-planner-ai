import { Request, Response } from "express";
import * as geminiService from "../services/geminiService";
import { logger } from "../middlewares/security";
import { cacheService } from "../services/cacheService";

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
    res.status(500).json({
      error: "เกิดข้อผิดพลาดในการวิเคราะห์สถาปัตยกรรมระบบไอที",
      details: "การเชื่อมต่อระบบ AI ขัดข้องชั่วคราว โปรดตรวจสอบอินเทอร์เน็ตและลองใหม่อีกครั้ง"
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
    res.status(500).json({
      error: "เกิดข้อผิดพลาดในการประมวลผลข้อความแชท",
      details: "การเชื่อมต่อระบบแชทขัดข้องชั่วคราว โปรดลองใหม่อีกครั้ง"
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
    res.status(500).json({
      error: "เกิดข้อผิดพลาดในการล้างข้อมูลแคช",
      details: error.message || error
    });
  }
};
