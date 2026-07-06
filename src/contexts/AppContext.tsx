import React, { createContext, useContext, useReducer, useEffect, useRef, useState } from "react";
import { appReducer, initialState, AppState, AppAction, Message } from "../appReducer";
import { ArchitectureRequirements, ArchitectureReport, TopologyNode, SimulationResult } from "../types";

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  health: any;
  fetchHealth: () => Promise<void>;
  triggerFlushCache: () => Promise<void>;
  isFlushing: boolean;
  flushMessage: string;
  triggerAnalysis: (reqData?: ArchitectureRequirements) => Promise<void>;
  runStressSimulation: (scenario: string, currentReportArg?: ArchitectureReport | null) => void;
  handleApplyPreset: (presetData: any) => void;
  handleSendMessage: (e?: React.FormEvent) => Promise<void>;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const {
    requirements,
    report,
    newMessage,
    messages,
    chatLoading,
  } = state;

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Health and Cache Diagnostics states
  const [health, setHealth] = useState<any>(null);
  const [flushMessage, setFlushMessage] = useState<string>("");
  const [isFlushing, setIsFlushing] = useState<boolean>(false);

  const fetchHealth = async () => {
    try {
      const response = await fetch("/api/health");
      if (response.ok) {
        const data = await response.json();
        setHealth(data);
      }
    } catch (e) {
      console.error("Failed to fetch health check details", e);
    }
  };

  const triggerFlushCache = async () => {
    setIsFlushing(true);
    setFlushMessage("");
    try {
      const response = await fetch("/api/cache/clear", { method: "POST" });
      if (response.ok) {
        setFlushMessage("ล้างแคชสำเร็จ!");
        fetchHealth(); // Update metrics immediately
      } else {
        setFlushMessage("เกิดข้อผิดพลาด");
      }
    } catch (e) {
      setFlushMessage("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsFlushing(false);
      setTimeout(() => setFlushMessage(""), 4000);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 15000); // Poll health details every 15 seconds
    return () => clearInterval(interval);
  }, []);

  // Auto scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatLoading]);

  // Handle Preset selection
  const handleApplyPreset = (presetData: any) => {
    dispatch({ type: "APPLY_PRESET", presetData });
    // Auto trigger analysis
    triggerAnalysis(presetData);
  };

  // Run architectural analysis via API
  const triggerAnalysis = async (reqData: ArchitectureRequirements = requirements) => {
    dispatch({ type: "START_ANALYSIS" });
    try {
      const response = await fetch("/api/analyze-architecture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqData)
      });
      if (!response.ok) {
        throw new Error("Failed to analyze architecture");
      }
      const data = await response.json();

      let cacheNote = "";
      if (data.cacheStatus === "hit-redis") {
        cacheNote = "\n\n⚡ **[แคช - Redis Hit]** คำแนะนำนี้ถูกดึงมาจากระบบแคชระดับองค์กร (Redis) ทันที ประหยัดค่าใช้จ่ายและตอบสนองความเร็วสูงสุด!";
      } else if (data.cacheStatus === "hit-memory") {
        cacheNote = "\n\n⚡ **[แคช - Memory Hit]** คำแนะนำนี้ถูกดึงมาจากหน่วยความจำเซิร์ฟเวอร์หลัก (Local Memory) ทันที ประหยัดต้นทุนและตอบสนองทันใจ!";
      } else {
        cacheNote = "\n\n✨ **[วิเคราะห์สด - Gemini Live]** ระบบได้ทำการวิเคราะห์ผ่านโมเดล Gemini 3.5-flash ในรูปแบบ Real-time และบันทึกผลลัพธ์ลงแคชสำหรับครั้งต่อไป!";
      }

      const welcomeMessageText = `วิเคราะห์โครงสร้างระบบสำหรับ "${reqData.businessType}" สำเร็จแล้วครับ! \n\nผมได้วางระบบในรูปแบบ **${data.architectureStyle || "สถาปัตยกรรมสมัยใหม่"}** ซึ่งมีการเชื่อมต่อระบบระหว่าง Public Cloud และ On-Premise แบบเสถียรและปลอดภัยสูง \nคุณสามารถดูแผนผังโครงสร้าง และวิเคราะห์ปัญหาคอขวด (Bottlenecks) หรือจำลองภัยคุกคามทางไซเบอร์ได้จากหน้าจอระบบได้เลยครับ มีจุดใดที่ต้องการเจาะลึกสอบถามเพิ่มเติมได้ตลอดเวลาครับ!${cacheNote}`;

      dispatch({ type: "ANALYSIS_SUCCESS", report: data, welcomeMessageText });

      // Set default normal simulation
      runStressSimulation("normal", data);
      
      // Update health check to see hit counts incremented
      fetchHealth();
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาดในการดึงข้อมูลวิเคราะห์สถาปัตยกรรม กรุณาลองใหม่อีกครั้ง");
      dispatch({ type: "ANALYSIS_FAILURE" });
    }
  };

  // Stress simulator engine
  const runStressSimulation = (scenario: string, currentReportArg?: ArchitectureReport | null) => {
    const currentReport = currentReportArg !== undefined && currentReportArg !== null ? currentReportArg : report;
    if (!currentReport) return;
    dispatch({ type: "START_STRESS_SIMULATION", scenario });

    // Mock realistic physics changes based on user architecture variables & scenario
    setTimeout(() => {
      let latency = 28; // ms
      let throughput = 850; // rps
      let cpuLoad = 14; // %
      let dbConnections = 45; // conns
      let isSuccessful = true;
      let systemStatus: "healthy" | "degraded" | "failed" = "healthy";
      let log: string[] = [];
      let bottlenecksTriggered: string[] = [];
      let recommendations: string[] = [];

      const isHybrid = currentReport.nodes.some(n => n.provider === "on-premise");
      const hasCache = currentReport.nodes.some(n => n.category === "cache");

      // Custom business scale scaling modifiers
      const scaleMultiplier = requirements.userVolume === "low" ? 4 : requirements.userVolume === "extreme" ? 12 : 1;

      switch (scenario) {
        case "spike": // Black Friday Surge
          latency = Math.round(52 + (isHybrid ? 40 : 10) - (hasCache ? 25 : 0));
          throughput = 4800 * scaleMultiplier;
          cpuLoad = Math.min(Math.round(68 + (hasCache ? 0 : 22)), 100);
          dbConnections = Math.round(280 * scaleMultiplier);
          isSuccessful = cpuLoad < 95;
          systemStatus = cpuLoad > 90 ? "failed" : cpuLoad > 75 ? "degraded" : "healthy";
          
          log = [
            `[ALERT] Traffic spike detected: +${500 * scaleMultiplier}% request volume.`,
            `[METRIC] Edge API Gateway throughput reached ${throughput} req/s.`,
            hasCache 
              ? `[INFO] Redis Cache hits at 94.1% - absorbed ${Math.round(throughput * 0.8)} DB queries successfully.`
              : `[WARN] No cache layer active! Heavy read amplification query hit primary database.`,
            `[INFO] Kubernetes horizontal pod auto-scaler (HPA) triggered: Scaling pods from 3 to 12.`,
            cpuLoad > 85 ? `[CRITICAL] High database connection pooling limit exceeded.` : `[INFO] Connection limits healthy.`
          ];

          if (!hasCache) {
            bottlenecksTriggered.push("Database Write/Read Amplification");
            recommendations.push("ควรติดตั้ง Redis/Memcached cluster เป็นด่านหน้าเพื่อเก็บข้อมูลสินค้าหรือเซสชัน ป้องกัน Database ล่ม");
          }
          if (cpuLoad > 80) {
            bottlenecksTriggered.push("CPU Starvation in Compute Nodes");
            recommendations.push("ปรับแต่ง HPA CPU target threshold ลงมาเหลือ 65% เพื่อเริ่มขยาย Pod ได้เร็วยิ่งขึ้นก่อนเกิดคอขวด");
          }
          break;

        case "ddos": // DDoS Attack Simulation
          latency = 180;
          throughput = 15000;
          cpuLoad = 98;
          dbConnections = 450;
          isSuccessful = false;
          systemStatus = "failed";
          
          log = [
            `[CRITICAL] Volumetric DDoS attack detected: 15,000 requests per second from 1,200 rogue IPs.`,
            `[SECURITY] AWS WAF rate-limiting rules activated but edge CPU saturated.`,
            `[SYSTEM] Latency spiked to ${latency}ms, resulting in connection timeouts.`,
            `[DATABASE] Connection pool exhausted due to prolonged requests wait time.`
          ];

          bottlenecksTriggered.push("Edge Network Port Saturation", "WAF CPU Bottleneck");
          recommendations.push("เปิดใช้บริการ CloudFront Shield Advanced หรือ Cloudflare Magic Transit เพื่อช่วยดูดซับแรงกระแทกจากระดับ Layer 3/4");
          recommendations.push("เพิ่มกฎ Custom Rate Limit บน API Gateway ให้สกัดกั้นไอพีที่ส่งเกิน 100 req/min ทันที");
          break;

        case "hybrid_fail": // Hybrid Sync Delay
          latency = Math.round(110 + (isHybrid ? 120 : 10));
          throughput = Math.round(450 * scaleMultiplier);
          cpuLoad = 38;
          dbConnections = 90;
          isSuccessful = true;
          systemStatus = "degraded";

          log = [
            `[ALERT] Packet loss detected on VPN / Direct Connect Tunnel back to On-Premise Core Data Center.`,
            `[DATA-BRIDGE] Apache Kafka sync queue length increased from 10 to 45,280 messages.`,
            `[LATENCY] Read replication requests are stalling waiting for transaction confirmation.`,
            `[INFO] Resiliency fallback: Hybrid API router queuing outgoing messages into local dead-letter-queue (DLQ) to prevent user crash.`
          ];

          bottlenecksTriggered.push("Hybrid Sync Latency (Data Bridge lag)");
          recommendations.push("ติดตั้ง Redundant VPN Site-to-Site หรือเชื่อมต่อ SD-WAN เพิ่มเติมเพื่อสำรองข้อมูลคู่ขนานกับวงจรหลัก (Direct Connect)");
          recommendations.push("เปลี่ยนวิธีรับส่งข้อมูลสำคัญเป็น Event-Driven (Asynchronous Write-Behind) แทนการดึงผ่าน REST synchronous เพื่อลด dependency ต่อเครือข่าย On-premise");
          break;

        case "db_lock": // Lock Contention
          latency = 340;
          throughput = 280;
          cpuLoad = 85;
          dbConnections = 500;
          isSuccessful = false;
          systemStatus = "failed";

          log = [
            `[DATABASE] Primary Database thread state: 'waiting for table metadata lock' for 180 seconds.`,
            `[CRITICAL] Write transaction deadlock occurred during high concurrent order processing.`,
            `[GATEWAY] API Gateway returned 504 Gateway Timeout for ${latency}ms queries.`,
            `[SYSTEM] Connection Pool saturated. New user transactions rejected.`
          ];

          bottlenecksTriggered.push("RDBMS Write Lock Contention");
          recommendations.push("แยกฐานข้อมูลเป็น Read/Write Split (CQRS Pattern) - ส่งคำขออ่านไปที่ Replica Nodes และส่งเขียนเฉพาะที่ Primary");
          recommendations.push("ลดขนาด Database Transaction ในโค้ด และหลีกเลี่ยง 'SELECT FOR UPDATE' หรือย้ายการล็อกระบบสต็อกไปใช้ Distributed Lock บน Redis แทน");
          break;

        case "normal":
        default:
          latency = 18;
          throughput = 350;
          cpuLoad = 12;
          dbConnections = 24;
          isSuccessful = true;
          systemStatus = "healthy";

          log = [
            `[SYSTEM] All components reported healthy state. Ready to scale.`,
            `[MONITOR] Current response latency: 18ms (p99: 42ms).`,
            isHybrid ? `[HYBRID] Site-to-Site Tunnel ping response: 8ms. Synced.` : `[SYSTEM] Public Cloud routing: Local region.`,
            `[CACHE] Cache hit ratio steady at 95.8%.`
          ];
          break;
      }

      dispatch({
        type: "FINISH_STRESS_SIMULATION",
        simResult: {
          eventName: scenario === "normal" ? "การรับส่งข้อมูลปกติ" : 
                     scenario === "spike" ? "การจำลองทราฟฟิกกระชากตัวรุนแรง (Traffic Spike)" : 
                     scenario === "ddos" ? "การจำลองภัยคุกคามแบบ DDoS Attack" : 
                     scenario === "hybrid_fail" ? "การเกิดความหน่วง/ดีเลย์ในโครงข่ายระบบไฮบริด (Hybrid Network Delay)" : 
                     scenario === "db_lock" ? "เกิดการค้างและล็อกในส่วนฐานข้อมูล RDBMS (Database Deadlock)" : "สถานการณ์เสี่ยงภัยระบบ",
          isSuccessful,
          systemStatus,
          log,
          metrics: {
            latency,
            throughput,
            cpuLoad,
            dbConnections
          },
          bottlenecksTriggered,
          recommendations
        }
      });
    }, 2000);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || chatLoading) return;

    const userMsg = newMessage;
    const userTime = new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
    const userMsgObj: Message = {
      sender: "user",
      text: userMsg,
      time: userTime
    };

    const updatedMessages = [...messages, userMsgObj];
    dispatch({ type: "SEND_CHAT_MESSAGE", userMsgObj });

    try {
      const response = await fetch("/api/chat-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requirements,
          currentReport: report,
          messages: updatedMessages,
          newMessage: userMsg
        })
      });

      if (!response.ok) throw new Error("Chat failed");
      const data = await response.json();

      let chatCacheNote = "";
      if (data.cacheStatus && data.cacheStatus !== "miss") {
        chatCacheNote = ` (Cached via ${data.cacheStatus === "hit-redis" ? "Redis" : "Memory"})`;
      }

      dispatch({
        type: "CHAT_MESSAGE_SUCCESS",
        aiMsgObj: {
          sender: "ai",
          text: data.reply,
          time: new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }) + chatCacheNote
        }
      });
      fetchHealth();
    } catch (err) {
      console.error(err);
      dispatch({
        type: "CHAT_MESSAGE_FAILURE",
        aiErrorMsgObj: {
          sender: "ai",
          text: "ขออภัยด้วยครับ เกิดข้อขัดข้องทางเทคนิคในการประมวลผลคำปรึกษา กรุณาลองใหม่อีกครั้ง",
          time: new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })
        }
      });
    }
  };

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        health,
        fetchHealth,
        triggerFlushCache,
        isFlushing,
        flushMessage,
        triggerAnalysis,
        runStressSimulation,
        handleApplyPreset,
        handleSendMessage,
        messagesEndRef,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
