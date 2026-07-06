import { Router } from "express";
import { handleAnalyzeArchitecture, handleChatAdvisor, handleClearCache } from "../controllers/architectureController";
import { validateArchitectureRequest, validateChatRequest } from "../validators/architectureValidator";
import { architectureLimiter, chatLimiter } from "../middlewares/security";

const router = Router();

// Routes definitions
router.post("/analyze-architecture", architectureLimiter, validateArchitectureRequest, handleAnalyzeArchitecture);
router.post("/chat-advisor", chatLimiter, validateChatRequest, handleChatAdvisor);
router.post("/cache/clear", handleClearCache);

export default router;
