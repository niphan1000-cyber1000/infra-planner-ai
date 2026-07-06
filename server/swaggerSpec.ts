export const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "Enterprise IT Architect AI API",
    version: "1.0.0",
    description: "API Documentation for Enterprise IT Architect AI system. This API provides advanced IT/Cloud architecture recommendation engine powered by Google Gemini, live chatbot advisor, and system stress simulation endpoints.",
    contact: {
      name: "IT Architect AI Support",
      email: "support@example.com"
    }
  },
  servers: [
    {
      url: "/api",
      description: "API Base Path"
    },
    {
      url: "",
      description: "Root Server"
    }
  ],
  paths: {
    "/health": {
      get: {
        summary: "API Health Check",
        description: "Returns the operational status of the server and the current server timestamp.",
        responses: {
          "200": {
            description: "Server is healthy and running",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      example: "ok"
                    },
                    time: {
                      type: "string",
                      format: "date-time",
                      example: "2026-07-05T18:16:19.000Z"
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/analyze-architecture": {
      post: {
        summary: "Analyze Cloud/Enterprise Architecture",
        description: "Utilizes Gemini AI to design a customized enterprise architecture based on user constraints (Business Type, Compliance, Budget, Cloud Preference, Legacy Tech, and Risk Focus). Returns detailed nodes, connectors, constraints, bottlenecks, recommendations, and strategic plans.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["businessType", "userVolume", "compliance", "budget", "cloudPreference", "existingTech", "itGoal", "riskFocus"],
                properties: {
                  businessType: {
                    type: "string",
                    description: "Industry type (e.g., E-Commerce, Fintech, Healthcare)",
                    example: "E-Commerce"
                  },
                  userVolume: {
                    type: "string",
                    enum: ["low", "medium", "high", "extreme"],
                    description: "Target user volume tier",
                    example: "high"
                  },
                  compliance: {
                    type: "array",
                    items: {
                      type: "string"
                    },
                    description: "List of regulatory requirements",
                    example: ["PCI-DSS", "PDPA"]
                  },
                  budget: {
                    type: "string",
                    enum: ["low", "balanced", "unlimited"],
                    description: "Cost tolerance level",
                    example: "balanced"
                  },
                  cloudPreference: {
                    type: "string",
                    enum: ["aws", "gcp", "azure", "hybrid", "on-premises"],
                    description: "Preferred hosting / cloud platform",
                    example: "hybrid"
                  },
                  existingTech: {
                    type: "string",
                    description: "Current on-premises or legacy systems to support",
                    example: "On-Premises ERP (SAP) และระบบสต็อกเดิม"
                  },
                  extraDescription: {
                    type: "string",
                    description: "Any special demands or specific security needs",
                    example: "ต้องการระบบที่ขยายตัวอัตโนมัติ (Auto-scaling) เพื่อไม่ให้ระบบล่ม"
                  },
                  itGoal: {
                    type: "string",
                    enum: ["modernize", "security", "greenfield"],
                    description: "Primary IT and Business goal",
                    example: "modernize"
                  },
                  riskFocus: {
                    type: "string",
                    enum: ["standard", "strict", "zero_trust"],
                    description: "Security and compliance risk management tier",
                    example: "strict"
                  }
                }
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Successful architectural analysis",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    architectureStyle: {
                      type: "string",
                      example: "Modern Hybrid Cloud Microservices"
                    },
                    summary: {
                      type: "string",
                      example: "ระบบอีคอมเมิร์ซความปลอดภัยสูงที่ผสานการทำงานแบบไฮบริด..."
                    },
                    nodes: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string" },
                          label: { type: "string" },
                          type: { type: "string", enum: ["client", "network", "compute", "storage", "security", "legacy"] },
                          tier: { type: "string", enum: ["client", "ingress", "app", "data", "integration"] },
                          location: { type: "string", enum: ["cloud", "on-premises", "edge"] },
                          details: { type: "string" },
                          techStack: { type: "string" },
                          status: { type: "string" }
                        }
                      }
                    },
                    connections: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          from: { type: "string" },
                          to: { type: "string" },
                          label: { type: "string" },
                          protocol: { type: "string" },
                          secure: { type: "boolean" }
                        }
                      }
                    },
                    complianceRating: {
                      type: "object",
                      properties: {
                        score: { type: "number", example: 95 },
                        unresolved: { type: "array", items: { type: "string" } },
                        resolved: { type: "array", items: { type: "string" } }
                      }
                    },
                    recommendations: {
                      type: "array",
                      items: { type: "string" }
                    },
                    terraformSnippet: {
                      type: "string",
                      example: "resource \"aws_vpc\" \"main\" {\n..."
                    }
                  }
                }
              }
            }
          },
          "400": {
            description: "Validation error / Missing parameters"
          },
          "500": {
            description: "Gemini API error / Core Service down"
          }
        }
      }
    },
    "/chat-advisor": {
      post: {
        summary: "Interact with System Architect AI Advisor",
        description: "Engages in interactive technical dialogue with the system architect AI. Receives context from previous requirements and chat history to provide answers to DevOps, Terraform, Cloud security, cost tuning, and migration challenges.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["message", "history"],
                properties: {
                  message: {
                    type: "string",
                    description: "Prompt or question from the user",
                    example: "ช่วยอธิบายวิธีลดต้นทุนการรันฐานข้อมูลในสถาปัตยกรรมนี้หน่อยครับ"
                  },
                  history: {
                    type: "array",
                    items: {
                      type: "object",
                      required: ["sender", "text"],
                      properties: {
                        sender: { type: "string", enum: ["user", "ai"] },
                        text: { type: "string" }
                      }
                    },
                    description: "Previous chat history messages to preserve conversational memory"
                  },
                  requirements: {
                    type: "object",
                    description: "Active system architecture requirements for contextual awareness"
                  }
                }
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Successful response from the AI advisor",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    reply: {
                      type: "string",
                      example: "สำหรับการลดต้นทุนฐานข้อมูลในสถาปัตยกรรมนี้ คุณสามารถเปิดใช้งาน Auto-scaling storage และเลือกประมวลผลเป็นแบบ Serverless DB..."
                    }
                  }
                }
              }
            }
          },
          "400": {
            description: "Validation error"
          },
          "500": {
            description: "Chat advisory generation failed"
          }
        }
      }
    }
  }
};
