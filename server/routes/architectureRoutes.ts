import { Router } from "express";
import { handleAnalyzeArchitecture, handleChatAdvisor } from "../controllers/architectureController";
import { validateArchitectureRequest, validateChatRequest } from "../validators/architectureValidator";

const router = Router();

// Routes definitions
router.post("/analyze-architecture", validateArchitectureRequest, handleAnalyzeArchitecture);
router.post("/chat-advisor", validateChatRequest, handleChatAdvisor);

export default router;
