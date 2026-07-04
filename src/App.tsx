import React, { useState, useEffect, useRef } from "react";
import { 
  Shield, 
  Server, 
  Database, 
  Cpu, 
  Globe, 
  Layers, 
  Network, 
  HardDrive, 
  HelpCircle, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  TrendingDown,
  RefreshCw,
  Sliders,
  Sparkles,
  ChevronRight,
  TrendingUp,
  DollarSign,
  Lock,
  MessageSquare,
  Send,
  Loader2,
  Info,
  Maximize2,
  Play,
  Flame,
  Zap,
  Activity,
  Award
} from "lucide-react";
import TopologyBoard from "./components/TopologyBoard";
import { 
  ArchitectureRequirements, 
  ArchitectureReport, 
  TopologyNode, 
  TopologyConnection, 
  SimulationResult, 
  SimulationMetric 
} from "./types";

// Standard preset options for the advisor
const PRESETS = [
  {
    name: "🚀 ระบบ E-Commerce พันล้าน (High Load)",
    description: "รองรับผู้ใช้ 100k+ คนพร้อมกัน, ตะกร้าสินค้า, Flash Sale, ป้องกันสแปมและ DDoS",
    data: {
      businessType: "E-Commerce (ระบบจำหน่ายสินค้าและชำระเงินออนไลน์)",
      userVolume: "high",
      compliance: ["PCI-DSS", "PDPA"],
      budget: "balanced",
      cloudPreference: "hybrid",
      existingTech: "On-Premises ERP (SAP) และระบบสต็อกเดิม",
      extraDescription: "ต้องการระบบที่ขยายตัวอัตโนมัติ (Auto-scaling) และรองรับการทำ Flash Sale เพื่อไม่ให้ระบบล่ม และ sync ข้อมูลกลับมายังระบบ ERP ขององค์กรแบบ Real-time",
      itGoal: "modernize",
      riskFocus: "strict"
    }
  },
  {
    name: "🏥 ระบบ Telemedicine โรงพยาบาล (PDPA & HIPAA)",
    description: "เน้นรักษาความปลอดภัยข้อมูลผู้ป่วย, ถ่ายทอดสดวิดีโอคอล, รองรับการขยายตัวในอนาคต",
    data: {
      businessType: "Healthcare & Video Consultation (บริการแพทย์ทางไกล)",
      userVolume: "medium",
      compliance: ["PDPA", "HIPAA"],
      budget: "balanced",
      cloudPreference: "aws",
      existingTech: "Legacy Patient Record System (SQL Server) ในโรงพยาบาล",
      extraDescription: "ต้องการการเข้ารหัสข้อมูลที่เข้มงวดทั้งตอนจัดเก็บ (At Rest) และตอนส่งข้อมูล (In Transit) พร้อมทั้งการบันทึก Log การเข้าถึงข้อมูลเพื่อความโปร่งใส",
      itGoal: "security",
      riskFocus: "strict"
    }
  },
  {
    name: "🏦 Core Banking & Microservices (ความมั่นคงสูง)",
    description: "เน้นระบบกระจายศูนย์ (Distributed), Zero-trust, ตรวจจับการทุจริต, ระบบ Hybrid Cloud",
    data: {
      businessType: "Fintech & Core Banking Platform",
      userVolume: "high",
      compliance: ["PCI-DSS", "PDPA"],
      budget: "unlimited",
      cloudPreference: "hybrid",
      existingTech: "Legacy Mainframe และฐานข้อมูล Oracle On-Premises",
      extraDescription: "สถาปัตยกรรมที่สามารถทำงานทดแทนกันได้ทันที (Active-Active Multi-Region) ข้อมูลต้องถูกต้อง 100% ห้ามมีข้อมูลสูญหายเด็ดขาด (Zero Data Loss)",
      itGoal: "security",
      riskFocus: "zero_trust"
    }
  },
  {
    name: "📡 IoT Smart City Sensor Network (Big Data)",
    description: "สตรีมข้อมูลความละเอียดสูงจากอุปกรณ์แสนตัว, คัดกรองข้อมูลล่าช้าต่ำ, คลาวด์วิเคราะห์ผล",
    data: {
      businessType: "IoT & Smart Energy Monitoring",
      userVolume: "extreme",
      compliance: ["GDPR"],
      budget: "low",
      cloudPreference: "gcp",
      existingTech: "ไม่มีระบบเดิม (Greenfield)",
      extraDescription: "เน้นการรับส่งข้อมูลแบบ Event-Driven ด้วย Kafka และการวิเคราะห์ผลทันทีด้วยเทคโนโลยี Serverless เพื่อประหยัดต้นทุนในเวลาที่ไม่มีข้อมูลส่งเข้ามา",
      itGoal: "greenfield",
      riskFocus: "standard"
    }
  }
];

export default function App() {
  // Input requirements state
  const [requirements, setRequirements] = useState<ArchitectureRequirements>({
    businessType: "E-Commerce",
    userVolume: "medium",
    compliance: ["PDPA"],
    budget: "balanced",
    cloudPreference: "hybrid",
    existingTech: "On-Premises Legacy DB",
    extraDescription: "ต้องการระบบที่ป้องกันการโจมตีทางไซเบอร์ และรองรับการขยายตัวได้ดี",
    itGoal: "modernize",
    riskFocus: "strict"
  });

  // UI state
  const [loading, setLoading] = useState<boolean>(false);
  const [report, setReport] = useState<ArchitectureReport | null>(null);
  const [selectedNode, setSelectedNode] = useState<TopologyNode | null>(null);
  
  // Custom stress simulator state
  const [simScenario, setSimScenario] = useState<string>("normal");
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Chat advisor integration
  const [chatOpen, setChatOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Array<{ sender: "user" | "ai"; text: string; time: string }>>([
    { 
      sender: "ai", 
      text: "สวัสดีครับ! ผมคือ Enterprise IT Architect AI ยินดีให้คำแนะนำเกี่ยวกับสถาปัตยกรรมระบบไอทีและกลยุทธ์คลาวด์ของคุณ คุณสามารถเลือก Template สำเร็จรูปด้านซ้าย หรือกรอกรายละเอียดเพื่อวิเคราะห์โครงสร้างระบบแบบเจาะลึกได้ทันทีครับ", 
      time: "21:44" 
    }
  ]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatLoading]);

  // Handle Preset selection
  const handleApplyPreset = (presetData: any) => {
    setRequirements(presetData);
    // Auto trigger analysis
    triggerAnalysis(presetData);
  };

  // Run architectural analysis via API
  const triggerAnalysis = async (reqData: ArchitectureRequirements = requirements) => {
    setLoading(true);
    setSelectedNode(null);
    setSimResult(null);
    setSimScenario("normal");
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
      setReport(data);

      // Auto-initialize first node for details view if exists
      if (data.nodes && data.nodes.length > 0) {
        setSelectedNode(data.nodes[0]);
      }

      // Pre-add a welcome chat message based on report
      setMessages(prev => [
        ...prev,
        {
          sender: "ai",
          text: `วิเคราะห์โครงสร้างระบบสำหรับ "${reqData.businessType}" สำเร็จแล้วครับ! 

ผมได้วางระบบในรูปแบบ **${data.architectureStyle || "สถาปัตยกรรมสมัยใหม่"}** ซึ่งมีการเชื่อมต่อระบบระหว่าง Public Cloud และ On-Premise แบบเสถียรและปลอดภัยสูง 
คุณสามารถดูแผนผังโครงสร้าง และวิเคราะห์ปัญหาคอขวด (Bottlenecks) หรือจำลองภัยคุกคามทางไซเบอร์ได้จากหน้าจอระบบได้เลยครับ มีจุดใดที่ต้องการเจาะลึกสอบถามเพิ่มเติมได้ตลอดเวลาครับ!`,
          time: new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })
        }
      ]);

      // Set default normal simulation
      runStressSimulation("normal", data);
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาดในการดึงข้อมูลวิเคราะห์สถาปัตยกรรม กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  // Stress simulator engine
  const runStressSimulation = (scenario: string, currentReport: ArchitectureReport | null = report) => {
    if (!currentReport) return;
    setIsSimulating(true);
    setSimScenario(scenario);

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

      const nodeCount = currentReport.nodes.length;
      const isHybrid = currentReport.nodes.some(n => n.provider === "on-premise");
      const hasCache = currentReport.nodes.some(n => n.category === "cache");

      // Custom business scale scaling modifiers
      const scaleMultiplier = requirements.userVolume === "high" ? 4 : requirements.userVolume === "extreme" ? 12 : 1;

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

      setSimResult({
        eventName: scenario === "normal" ? "การรับส่งข้อมูลปกติ" : 
                   scenario === "spike" ? "การจำลองทราฟฟิกกระชากตัวรุนแรง (Traffic Spike)" :
                   scenario === "ddos" ? "การจำลองภัยคุกคามแบบ DDoS Attack" :
                   scenario === "hybrid_fail" ? "การจำลองระบบเครือข่ายความล่าช้า (Hybrid Sync Latency)" :
                   "การจำลองฐานข้อมูลติดล็อกเดดล็อก (Database Lock)",
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
      });
      setIsSimulating(false);
    }, 850);
  };

  // Run initial analysis automatically on mount with first preset
  useEffect(() => {
    triggerAnalysis(PRESETS[0].data);
  }, []);

  // Send message to AI Chat Advisor
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || chatLoading) return;

    const userMsg = newMessage;
    setNewMessage("");
    setMessages(prev => [...prev, {
      sender: "user",
      text: userMsg,
      time: new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })
    }]);

    setChatLoading(true);

    try {
      const response = await fetch("/api/chat-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requirements,
          currentReport: report,
          messages: messages.concat([{ sender: "user", text: userMsg, time: "" }]),
          newMessage: userMsg
        })
      });

      if (!response.ok) throw new Error("Chat failed");
      const data = await response.json();

      setMessages(prev => [...prev, {
        sender: "ai",
        text: data.reply,
        time: new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })
      }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        sender: "ai",
        text: "ขออภัยด้วยครับ เกิดข้อขัดข้องทางเทคนิคในการประมวลผลคำปรึกษา กรุณาลองใหม่อีกครั้งนะครับ",
        time: new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Fast trigger requirements modification helper
  const handleToggleCompliance = (comp: string) => {
    const updated = requirements.compliance.includes(comp)
      ? requirements.compliance.filter(c => c !== comp)
      : [...requirements.compliance, comp];
    setRequirements({ ...requirements, compliance: updated });
  };

  return (
    <div id="immersive_it_advisor" className="min-h-screen bg-[#020408] text-slate-300 font-sans flex flex-col antialiased">
      
      {/* Immersive Top Navigation Bar */}
      <nav id="app_nav" className="h-16 flex items-center justify-between px-6 md:px-8 border-b border-white/10 bg-[#05070a]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.5)] border border-indigo-400">
            <Cpu className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
              NEXUS<span className="text-indigo-400 font-light underline underline-offset-4 decoration-1 decoration-indigo-400/50">ARCH</span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded-full border border-indigo-500/30 font-mono font-normal">v3.5 Enterprise AI</span>
            </span>
            <p className="text-[10px] text-slate-400 hidden md:block">ระบบวิเคราะห์ ออกแบบสถาปัตยกรรมคลาวด์และแก้ปัญหาความตึงเครียดระบบ</p>
          </div>
        </div>

        {/* Global state monitor pill */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs items-center gap-2">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span> 
            ระบบพร้อมรับการจำลอง (Advisor Operational)
          </div>
          
          <button 
            id="chat_toggle_btn"
            onClick={() => setChatOpen(!chatOpen)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 border ${
              chatOpen 
                ? "bg-indigo-600 text-white border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.4)]" 
                : "bg-slate-900 text-slate-300 border-white/10 hover:border-indigo-500 hover:text-white"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span className="hidden md:inline">ที่ปรึกษา AI ประจำตัว</span>
            {messages.length > 1 && (
              <span className="bg-rose-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {messages.length}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Main Workspace Frame */}
      <div id="main_workspace" className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        
        {/* Left Control Panel / Architectural Input Form */}
        <aside id="sidebar_inputs" className="w-full lg:w-80 bg-[#05070a]/60 border-r border-white/5 p-5 flex flex-col gap-6 overflow-y-auto">
          <div>
            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> 1. เทมเพลตสถาปัตยกรรมแนะนำ
            </h3>
            <p className="text-[11px] text-slate-400 mb-3">กดเลือกประเภทระบบธุรกิจจำลองเพื่อเริ่มวางระบบแบบรวดเร็ว</p>
            <div className="space-y-2">
              {PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleApplyPreset(preset.data)}
                  className="w-full text-left p-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-indigo-900/20 hover:border-indigo-500/40 transition-all duration-300 group"
                >
                  <div className="text-[11px] text-indigo-300 font-bold group-hover:text-indigo-200 transition-colors">
                    {preset.name}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                    {preset.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <hr className="border-white/5" />

          {/* Configuration Form */}
          <div className="flex-1 flex flex-col gap-4">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5" /> 2. ปรับแต่งโครงสร้างความต้องการ
            </h3>

            {/* Business Type */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">ประเภทธุรกิจ / บริการ</label>
              <input
                type="text"
                value={requirements.businessType}
                onChange={(e) => setRequirements({ ...requirements, businessType: e.target.value })}
                placeholder="เช่น FinTech, E-Commerce, Logistics"
                className="w-full bg-[#0a0f18] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Scale Limit Selection */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">ปริมาณผู้ใช้งานเฉลี่ย / สถิติ</label>
              <select
                value={requirements.userVolume}
                onChange={(e) => setRequirements({ ...requirements, userVolume: e.target.value })}
                className="w-full bg-[#0a0f18] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="low">ระดับเริ่มต้น - สตาร์ทอัพ (≤ 5,000 คน/วัน)</option>
                <option value="medium">ระดับกลาง - องค์กรเอสเอ็มอี (~10,000 - 50,000 คน/วัน)</option>
                <option value="high">ระดับสูง - องค์กรขนาดใหญ่ (~100,000+ คน/วัน)</option>
                <option value="extreme">ระดับวิกฤต - มหาชน (1,000,000+ คนพร้อมกัน)</option>
              </select>
            </div>

            {/* Budget */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">งบประมาณโครงสร้างพื้นฐาน</label>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { value: "low", label: "ประหยัดสูงสุด" },
                  { value: "balanced", label: "สมดุลคุ้มค่า" },
                  { value: "unlimited", label: "ประสิทธิภาพสูง" }
                ].map((b) => (
                  <button
                    key={b.value}
                    type="button"
                    onClick={() => setRequirements({ ...requirements, budget: b.value })}
                    className={`px-1 py-1.5 rounded text-[10px] font-medium border transition-all duration-200 ${
                      requirements.budget === b.value
                        ? "bg-indigo-600 border-indigo-400 text-white shadow-md shadow-indigo-600/10"
                        : "bg-[#0a0f18] border-white/5 text-slate-400 hover:border-slate-500"
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Infrastructure Location Preference */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">สถานที่ตั้ง / คลาวด์เป้าหมาย</label>
              <select
                value={requirements.cloudPreference}
                onChange={(e) => setRequirements({ ...requirements, cloudPreference: e.target.value })}
                className="w-full bg-[#0a0f18] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="aws">Amazon Web Services (AWS Global)</option>
                <option value="azure">Microsoft Azure (Enterprise Active)</option>
                <option value="gcp">Google Cloud Platform (AI & Data Driven)</option>
                <option value="hybrid">Hybrid Cloud (On-Premises + Public Cloud คู่กัน)</option>
                <option value="on-premise">On-Premise Private Cloud เท่านั้น</option>
              </select>
            </div>

            {/* Compliance Matrix */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">มาตรฐานข้อกำหนดด้านกฎหมาย</label>
              <div className="flex flex-wrap gap-1.5">
                {["PDPA", "HIPAA", "PCI-DSS", "GDPR"].map((comp) => {
                  const active = requirements.compliance.includes(comp);
                  return (
                    <button
                      key={comp}
                      type="button"
                      onClick={() => handleToggleCompliance(comp)}
                      className={`px-2 py-1 rounded text-[10px] font-mono border transition-all duration-200 ${
                        active
                          ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                          : "bg-[#0a0f18] border-white/5 text-slate-500 hover:border-white/20"
                      }`}
                    >
                      {comp}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Legacy Tech Stack */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">ระบบหรือฐานข้อมูลเดิม (Legacy)</label>
              <input
                type="text"
                value={requirements.existingTech}
                onChange={(e) => setRequirements({ ...requirements, existingTech: e.target.value })}
                placeholder="เช่น Oracle DB On-Premise, Legacy Monolith"
                className="w-full bg-[#0a0f18] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* IT Goal */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">เป้าหมายด้านไอทีและธุรกิจ</label>
              <select
                value={requirements.itGoal}
                onChange={(e) => setRequirements({ ...requirements, itGoal: e.target.value })}
                className="w-full bg-[#0a0f18] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="modernize">ปรับปรุงระบบเดิมและเชื่อมต่อ Legacy (Modernize Legacy)</option>
                <option value="greenfield">ออกแบบวางแผนระบบใหม่ทั้งหมดจากศูนย์ (Greenfield Design)</option>
                <option value="security">ความปลอดภัยเข้มงวดและความพร้อมใช้งานสูง (High Security & HA)</option>
                <option value="cost">เน้นความคุ้มค่าและประหยัดงบประหยัดต้นทุน (Cost Lean Ops)</option>
              </select>
            </div>

            {/* Risk Focus */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">การบริหารความเสี่ยงทางไอที</label>
              <select
                value={requirements.riskFocus}
                onChange={(e) => setRequirements({ ...requirements, riskFocus: e.target.value })}
                className="w-full bg-[#0a0f18] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="standard">มาตรฐานพื้นฐานและแนวปฏิบัติสากล (Standard Practices)</option>
                <option value="strict">เข้มงวดสูงสำหรับอุตสาหกรรมที่มีกฎหมายกำกับ (Highly Regulated)</option>
                <option value="zero_trust">สถาปัตยกรรม Zero-Trust & แผนฟื้นฟูภัยพิบัติ DR (Zero-Trust + DR)</option>
              </select>
            </div>

            {/* Extra requirements text */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">รายละเอียดเพิ่มเติม / ความปลอดภัยเฉพาะ</label>
              <textarea
                value={requirements.extraDescription}
                onChange={(e) => setRequirements({ ...requirements, extraDescription: e.target.value })}
                rows={3}
                placeholder="ระบุความท้าทาย เช่น ปัญหาคอขวดที่เจอ, อุปสรรคเรื่องการเชื่อมต่อระบบเดิม หรือการเข้ารหัสข้อมูลที่ต้องใช้..."
                className="w-full bg-[#0a0f18] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            {/* Submit Analyze Button */}
            <button
              onClick={() => triggerAnalysis()}
              disabled={loading}
              className="w-full mt-2 py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white text-xs font-extrabold rounded-lg hover:shadow-lg hover:shadow-indigo-600/30 transition-all duration-300 flex items-center justify-center gap-2 border border-indigo-400/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  กำลังประมวลแผนสถาปัตยกรรมด้วย AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  วิเคราะห์ด้วย AI สถาปนิกอัจฉริยะ
                </>
              )}
            </button>
          </div>
        </aside>

        {/* Central Dashboard & Output Area */}
        <main id="dashboard_content" className="flex-1 p-4 md:p-6 flex flex-col gap-6 overflow-y-auto">
          
          {loading ? (
            <div id="loading_screen" className="flex-1 flex flex-col items-center justify-center min-h-[500px] border border-white/10 rounded-2xl bg-[#03060a]/90 relative overflow-hidden">
              <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(#ffffff 0.5px, transparent 0.5px)", backgroundSize: "20px 20px" }}></div>
              <div className="relative z-10 flex flex-col items-center text-center max-w-md px-6">
                <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 flex items-center justify-center mb-6 animate-spin">
                  <Cpu className="w-8 h-8 text-indigo-400 animate-pulse" />
                </div>
                <h4 className="text-white font-bold text-lg mb-2">กำลังจำลองและจัดโครงสร้างสถาปัตยกรรมระบบ</h4>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Gemini AI กำลังออกแบบแผนผังเครือข่าย Topology แนะนำระบบคลาวด์วิกฤต, วิเคราะห์การสกัดกั้น DDoS, 
                  และคำนวณโครงสร้างค่าใช้จ่ายเพื่อความยืดหยุ่นในระยะยาว...
                </p>
                <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 animate-[pulse_1.5s_infinite]" style={{ width: "85%" }}></div>
                </div>
              </div>
            </div>
          ) : report ? (
            <div id="report_display" className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
              
              {/* Executive Summary Block */}
              <div className="bg-gradient-to-br from-indigo-950/20 via-[#05070a] to-emerald-950/10 border border-white/10 rounded-2xl p-6 relative overflow-hidden shadow-xl">
                <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(#ffffff 0.5px, transparent 0.5px)", backgroundSize: "20px 20px" }}></div>
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-extrabold text-indigo-400 tracking-wider bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/30 uppercase">
                        EXECUTIVE ARCHITECT BLUEPRINT
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-400 tracking-wider bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                        {report.architectureStyle}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3">สรุปแผนยุทธศาสตร์สถาปัตยกรรมไอทีระดับองค์กร</h2>
                    <p className="text-xs md:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                      {report.executiveSummary}
                    </p>
                  </div>

                  <div className="md:w-64 bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col justify-between gap-3 flex-shrink-0">
                    <div>
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">มาตรฐานที่รองรับ</span>
                      <div className="flex flex-wrap gap-1">
                        {requirements.compliance.length > 0 ? (
                          requirements.compliance.map(c => (
                            <span key={c} className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                              {c}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">ไม่ได้กำหนดเจาะจง</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">สถิติปริมาณผู้ใช้เป้าหมาย</span>
                      <p className="text-xs font-bold text-white capitalize">
                        {requirements.userVolume === "low" ? "≤ 5k สตาร์ทอัพ" :
                         requirements.userVolume === "medium" ? "10k-50k ระดับองค์กร" :
                         requirements.userVolume === "high" ? "100k+ ผู้ใช้สูง" :
                         "1M+ ข้อมูลความจุวิกฤต"}
                      </p>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">คลาวด์ยุทธศาสตร์</span>
                      <p className="text-xs font-bold text-indigo-300 capitalize">{requirements.cloudPreference}</p>
                    </div>
                  </div>
                </div>

                {report.hybridCloudStrategy && (
                  <div className="mt-5 pt-5 border-t border-white/5 relative z-10">
                    <h4 className="text-xs font-bold text-indigo-300 mb-1.5 uppercase tracking-wider">
                      🔗 กลยุทธ์การเชื่อมโยงข้อมูลแบบ Hybrid & Multi-Cloud
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {report.hybridCloudStrategy}
                    </p>
                  </div>
                )}
              </div>

              {/* Strategic IT Roadmap & Assessment block */}
              {(report.systemAnalysis || report.itStrategyRoadmap || report.riskManagementPlan) && (
                <div id="strategic_it_block" className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  
                  {/* 1. System Analysis & Assessment */}
                  {report.systemAnalysis && (
                    <div className="bg-gradient-to-br from-[#05080f] via-[#090d16] to-indigo-950/10 border border-indigo-500/15 rounded-2xl p-5 shadow-xl space-y-4">
                      <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                        <div className="w-8 h-8 rounded bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                          <Activity className="w-4 h-4 text-indigo-400" />
                        </div>
                        <div>
                          <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">ประเมินและวิเคราะห์ระบบ</h3>
                          <p className="text-[9px] text-slate-500 font-mono">SYSTEM ASSESSMENT & ALIGNMENT</p>
                        </div>
                      </div>

                      <div className="space-y-4 text-xs">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">🔍 วิเคราะห์ระบบเดิม & จุดที่ควรระวัง</span>
                          <p className="text-slate-300 leading-relaxed bg-black/30 p-3 rounded-lg border border-white/5 whitespace-pre-line">
                            {report.systemAnalysis.legacyStatusAssessment}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">🚀 แนวทางการปรับปรุงระบบ (Improvement Path)</span>
                          <p className="text-slate-300 leading-relaxed bg-black/30 p-3 rounded-lg border border-white/5 whitespace-pre-line">
                            {report.systemAnalysis.improvementPath}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-emerald-400 block uppercase tracking-wider">🎯 การตอบโจทย์เป้าหมายทางธุรกิจ</span>
                          <p className="text-slate-300 leading-relaxed bg-emerald-950/5 p-3 rounded-lg border border-emerald-500/10 whitespace-pre-line">
                            {report.systemAnalysis.businessGoalAlignment}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. IT Strategy Roadmap */}
                  {report.itStrategyRoadmap && (
                    <div className="bg-gradient-to-br from-[#05080f] via-[#090d16] to-indigo-950/10 border border-indigo-500/15 rounded-2xl p-5 shadow-xl space-y-4">
                      <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                        <div className="w-8 h-8 rounded bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                          <TrendingUp className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div>
                          <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">ยุทธศาสตร์และแผนกลยุทธ์ IT</h3>
                          <p className="text-[9px] text-slate-500 font-mono">IT STRATEGIC ROADMAP (PHASED PLAN)</p>
                        </div>
                      </div>

                      <div className="space-y-4 text-xs">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">🗓️ แผนระยะสั้น (0 - 6 เดือน): Phase 1</span>
                          <p className="text-slate-300 leading-relaxed bg-black/30 p-3 rounded-lg border border-white/5 whitespace-pre-line">
                            {report.itStrategyRoadmap.phase1ShortTerm}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">🗓️ แผนระยะกลาง (6 - 18 เดือน): Phase 2</span>
                          <p className="text-slate-300 leading-relaxed bg-black/30 p-3 rounded-lg border border-white/5 whitespace-pre-line">
                            {report.itStrategyRoadmap.phase2MidTerm}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">🗓️ แผนระยะยาว (18+ เดือน): Phase 3</span>
                          <p className="text-slate-300 leading-relaxed bg-black/30 p-3 rounded-lg border border-white/5 whitespace-pre-line">
                            {report.itStrategyRoadmap.phase3LongTerm}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-indigo-300 block uppercase tracking-wider">🔄 การเตรียมพร้อมขยายตัวในอนาคต (3-5 ปี)</span>
                          <p className="text-slate-300 leading-relaxed bg-indigo-950/10 p-3 rounded-lg border border-indigo-500/10 whitespace-pre-line">
                            {report.itStrategyRoadmap.futureGrowthAdaptability}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3. Risk Management & Continuity DR */}
                  {report.riskManagementPlan && (
                    <div className="bg-gradient-to-br from-[#05080f] via-[#090d16] to-indigo-950/10 border border-indigo-500/15 rounded-2xl p-5 shadow-xl space-y-4">
                      <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                        <div className="w-8 h-8 rounded bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                          <Shield className="w-4 h-4 text-rose-400" />
                        </div>
                        <div>
                          <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">การจัดการความเสี่ยงและแผน DR</h3>
                          <p className="text-[9px] text-slate-500 font-mono">COMPREHENSIVE RISK & DR PLAN</p>
                        </div>
                      </div>

                      <div className="space-y-4 text-xs">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-rose-400 block uppercase tracking-wider">🚨 การระบุความเสี่ยงที่มีนัยสำคัญด้าน IT</span>
                          <p className="text-slate-300 leading-relaxed bg-black/30 p-3 rounded-lg border border-white/5 whitespace-pre-line">
                            {report.riskManagementPlan.riskIdentification}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">🛡️ มาตรการควบคุมเพื่อบรรเทาภัยคุกคาม</span>
                          <p className="text-slate-300 leading-relaxed bg-black/30 p-3 rounded-lg border border-white/5 whitespace-pre-line">
                            {report.riskManagementPlan.threatMitigationControls}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-amber-400 block uppercase tracking-wider">💾 แผนเผชิญเหตุเพื่อความต่อเนื่องทางธุรกิจ (DR)</span>
                          <p className="text-slate-300 leading-relaxed bg-amber-950/5 p-3 rounded-lg border border-amber-500/10 whitespace-pre-line">
                            {report.riskManagementPlan.businessContinuityPlan}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* Topology Map visualization */}
              <div id="topology_map_block" className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-indigo-400 animate-pulse" />
                    แผนภาพเครือข่ายจำลอง Topology Map
                  </h3>
                  <span className="text-[10px] text-slate-400">คลิกที่โหนดเพื่อตรวจสอบรายละเอียดสเปคและคำแนะนำเชิงลึก</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Interactive Graph */}
                  <div className="lg:col-span-2">
                    <TopologyBoard 
                      nodes={report.nodes}
                      connections={report.connections}
                      selectedNodeId={selectedNode?.id}
                      onNodeSelect={(node) => setSelectedNode(node)}
                    />
                  </div>

                  {/* Right Selected Node Details Card */}
                  <div className="lg:col-span-1 bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col justify-between shadow-lg">
                    {selectedNode ? (
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-3">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className={`w-2.5 h-2.5 rounded-full ${
                                selectedNode.provider === "aws" ? "bg-orange-500" :
                                selectedNode.provider === "azure" ? "bg-blue-500" :
                                selectedNode.provider === "gcp" ? "bg-red-500" :
                                selectedNode.provider === "on-premise" ? "bg-slate-400" :
                                "bg-emerald-500"
                              }`} />
                              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">
                                {selectedNode.provider} Resource
                              </span>
                            </div>
                            <h4 className="text-white font-bold text-base mt-1">{selectedNode.name}</h4>
                            <p className="text-xs font-mono text-indigo-300 mt-0.5">{selectedNode.serviceName}</p>
                          </div>
                          
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                            selectedNode.status === "secure" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" :
                            selectedNode.status === "warning" ? "bg-amber-500/10 border-amber-500/30 text-amber-300" :
                            "bg-red-500/10 border-red-500/30 text-red-300"
                          }`}>
                            {selectedNode.status === "secure" ? "ปลอดภัย" : 
                             selectedNode.status === "warning" ? "ความเสี่ยงปานกลาง" : "จุดล่อแหลมวิกฤต"}
                          </span>
                        </div>

                        <div>
                          <span className="text-[9px] font-bold text-slate-500 uppercase block mb-1">หน้าที่ของระบบในโครงสร้าง</span>
                          <p className="text-xs text-slate-300 leading-relaxed">{selectedNode.description}</p>
                        </div>

                        <div>
                          <span className="text-[9px] font-bold text-slate-500 uppercase block mb-1">รายละเอียดทางเทคนิค & ความทนทาน</span>
                          <div className="bg-black/40 rounded-lg p-3 border border-white/5 font-mono text-[11px] text-indigo-200">
                            {selectedNode.details}
                          </div>
                        </div>

                        {selectedNode.status !== "secure" && (
                          <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
                            <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5" /> แนะนำการติดตั้งเพิ่มความมั่นคง:
                            </span>
                            <p className="text-[10px] text-slate-300 mt-1 leading-relaxed">
                              โหนดนี้มีโอกาสเกิดคอขวดเมื่อมีทราฟฟิกกระชาก แนะนำให้เปิดใช้งาน Auto-scaling ร่วมกับระบบ Health Probe และตั้งค่า VPC Peering ให้รัดกุมที่สุด
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 py-12">
                        <Info className="w-8 h-8 text-slate-600 mb-2" />
                        <p className="text-xs">กรุณาเลือกโหนดบน Topology เพื่อแสดงรายละเอียดสเปคเชิงสถาปัตยกรรม</p>
                      </div>
                    )}

                    <div className="border-t border-white/5 mt-5 pt-4 text-[10px] text-slate-500">
                      <span>💡 องค์ประกอบนี้สามารถแปลงเป็นสคริปต์ Infrastructure as Code (Terraform) ได้ด้วยการคุยในแชทปรึกษาด้านล่าง</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stress and Resilience Simulator Block */}
              <div id="stress_simulator_block" className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-md">
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-4 mb-5 gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-orange-500 animate-bounce" />
                      3. ระบบจำลองแรงกดดันและภัยคุกคามสถิติ (Stress & Resilience Simulator)
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      ทดสอบสถานการณ์วิกฤต เช่น Flash Sale ทะลัก หรือ DDoS โจมตี เพื่อประเมินว่าสถาปัตยกรรมที่ออกแบบจะต้านทานไหวหรือไม่
                    </p>
                  </div>
                  
                  {/* Controls */}
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: "normal", label: "🟢 ปกติ", color: "hover:bg-emerald-500/10 hover:border-emerald-500" },
                      { id: "spike", label: "⚡ Flash Sale (+500%)", color: "hover:bg-amber-500/10 hover:border-amber-500" },
                      { id: "ddos", label: "💀 DDoS Attack", color: "hover:bg-red-500/10 hover:border-red-500" },
                      { id: "hybrid_fail", label: "📡 เน็ตหน่วงข้ามคลาวด์", color: "hover:bg-indigo-500/10 hover:border-indigo-500" },
                      { id: "db_lock", label: "🔒 DB เกิดเดดล็อก", color: "hover:bg-orange-500/10 hover:border-orange-500" }
                    ].map((scen) => (
                      <button
                        key={scen.id}
                        disabled={isSimulating}
                        onClick={() => runStressSimulation(scen.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-300 flex items-center gap-1.5 ${scen.color} ${
                          simScenario === scen.id
                            ? "bg-indigo-600 border-indigo-400 text-white shadow-md shadow-indigo-600/30"
                            : "bg-[#0a0f18] border-white/5 text-slate-300"
                        }`}
                      >
                        {scen.id === "normal" ? null : <Play className="w-3 h-3 fill-current" />}
                        {scen.label}
                      </button>
                    ))}
                  </div>
                </div>

                {isSimulating ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400 text-xs">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                    กำลังประมวลผลทางสถิติและซิมมูเลชั่นตามกฎแรงกดดัน...
                  </div>
                ) : simResult ? (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Live Gauges & Telemetry */}
                    <div className="lg:col-span-4 flex flex-col gap-3">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">สถานะโทรมาตรเสมือน (Telemetry metrics)</span>
                      
                      <div className="grid grid-cols-2 gap-3">
                        {/* Latency Gauge */}
                        <div className="bg-[#05070a] border border-white/10 rounded-xl p-3.5 flex flex-col justify-between">
                          <span className="text-[10px] text-slate-400">Response Latency</span>
                          <div className="mt-2 flex items-baseline justify-between">
                            <span className={`text-xl font-bold ${
                              simResult.metrics.latency > 150 ? "text-red-400" :
                              simResult.metrics.latency > 50 ? "text-amber-400" :
                              "text-emerald-400"
                            }`}>
                              {simResult.metrics.latency} <span className="text-xs font-normal">ms</span>
                            </span>
                            <span className="text-[9px] font-mono text-slate-500">p99 stats</span>
                          </div>
                        </div>

                        {/* Throughput */}
                        <div className="bg-[#05070a] border border-white/10 rounded-xl p-3.5 flex flex-col justify-between">
                          <span className="text-[10px] text-slate-400">Throughput</span>
                          <div className="mt-2 flex items-baseline justify-between">
                            <span className="text-xl font-bold text-white">
                              {simResult.metrics.throughput.toLocaleString()} <span className="text-xs font-normal">req/s</span>
                            </span>
                            <span className="text-[9px] font-mono text-indigo-400 flex items-center gap-0.5">
                              <TrendingUp className="w-2.5 h-2.5" /> Peak
                            </span>
                          </div>
                        </div>

                        {/* CPU Compute Cluster */}
                        <div className="bg-[#05070a] border border-white/10 rounded-xl p-3.5 flex flex-col justify-between">
                          <span className="text-[10px] text-slate-400">CPU Load (EKS/ECS)</span>
                          <div className="mt-2 flex items-baseline justify-between">
                            <span className={`text-xl font-bold ${
                              simResult.metrics.cpuLoad > 85 ? "text-red-400" :
                              simResult.metrics.cpuLoad > 60 ? "text-amber-400" :
                              "text-emerald-400"
                            }`}>
                              {simResult.metrics.cpuLoad}%
                            </span>
                            <span className="text-[9px] font-mono text-slate-500">Autoscale Limit</span>
                          </div>
                          {/* Progress bar */}
                          <div className="w-full bg-white/5 h-1.5 rounded-full mt-2 overflow-hidden">
                            <div className={`h-full rounded-full ${
                              simResult.metrics.cpuLoad > 85 ? "bg-red-500" :
                              simResult.metrics.cpuLoad > 60 ? "bg-amber-500" :
                              "bg-emerald-500"
                            }`} style={{ width: `${simResult.metrics.cpuLoad}%` }}></div>
                          </div>
                        </div>

                        {/* DB Connection Limits */}
                        <div className="bg-[#05070a] border border-white/10 rounded-xl p-3.5 flex flex-col justify-between">
                          <span className="text-[10px] text-slate-400">DB Active Pools</span>
                          <div className="mt-2 flex items-baseline justify-between">
                            <span className={`text-xl font-bold ${
                              simResult.metrics.dbConnections > 300 ? "text-red-400" :
                              simResult.metrics.dbConnections > 150 ? "text-amber-400" :
                              "text-white"
                            }`}>
                              {simResult.metrics.dbConnections} <span className="text-xs font-normal">/ 500</span>
                            </span>
                            <span className="text-[9px] font-mono text-slate-500">Active Pool</span>
                          </div>
                        </div>
                      </div>

                      {/* Overall Status Gauge */}
                      <div className={`p-4 rounded-xl border flex items-center justify-between ${
                        simResult.systemStatus === "healthy" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" :
                        simResult.systemStatus === "degraded" ? "bg-amber-500/10 border-amber-500/30 text-amber-300" :
                        "bg-red-500/10 border-red-500/30 text-red-300"
                      }`}>
                        <div>
                          <p className="text-[10px] uppercase font-bold tracking-wider">ภาพรวมความต้านทานระบบ</p>
                          <h4 className="text-sm font-extrabold mt-0.5">
                            {simResult.systemStatus === "healthy" ? "✅ ปลอดภัยดีเยี่ยม (Optimal Status)" :
                             simResult.systemStatus === "degraded" ? "⚠️ ระบบล่าช้าเล็กน้อย (Performance Degraded)" :
                             "🛑 ระบบล่ม / มีคอขวดวิกฤต (Critical Failure)"}
                          </h4>
                        </div>
                        <span className="text-xl font-bold">
                          {simResult.isSuccessful ? "100% SLA" : "SLA BREACH"}
                        </span>
                      </div>
                    </div>

                    {/* Simulation logs console */}
                    <div className="lg:col-span-4 flex flex-col gap-2.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">เหตุการณ์จำลองเสมือน (Real-time Simulation Logs)</span>
                      <div className="flex-1 bg-black/60 border border-white/10 rounded-xl p-3.5 font-mono text-[10px] text-indigo-200 space-y-2 max-h-[190px] overflow-y-auto">
                        {simResult.log.map((line, idx) => (
                          <div key={idx} className={`leading-relaxed border-l-2 pl-2 ${
                            line.includes("[CRITICAL]") ? "border-red-500 text-red-300" :
                            line.includes("[WARN]") || line.includes("[ALERT]") ? "border-amber-500 text-amber-300" :
                            line.includes("[SECURITY]") ? "border-emerald-500 text-emerald-300" :
                            "border-indigo-500 text-indigo-100"
                          }`}>
                            {line}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Proactive Mitigations based on stress simulation */}
                    <div className="lg:col-span-4 flex flex-col gap-2.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">มาตรการแก้ไขและบรรเทาทันที (Proactive AI Recommendation)</span>
                      
                      <div className="flex-1 bg-indigo-950/15 border border-indigo-500/20 rounded-xl p-4 flex flex-col justify-between">
                        <div>
                          {simResult.bottlenecksTriggered.length > 0 ? (
                            <div className="mb-3">
                              <span className="text-[9px] font-extrabold text-red-400 uppercase tracking-wider block mb-1">คอขวดที่ตรวจจับเจอ:</span>
                              <div className="flex flex-wrap gap-1">
                                {simResult.bottlenecksTriggered.map((b) => (
                                  <span key={b} className="text-[9px] font-mono bg-red-500/10 border border-red-500/30 text-red-300 px-1.5 py-0.5 rounded">
                                    {b}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold mb-3">
                              <CheckCircle className="w-4 h-4" /> ตรวจไม่พบปัญหาคอขวดที่รุนแรงในโครงสร้างปัจจุบัน!
                            </div>
                          )}

                          <span className="text-[10px] font-bold text-slate-400 block mb-1.5">ขั้นตอนสลายคอขวดที่แนะนำ:</span>
                          <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4 leading-relaxed">
                            {simResult.recommendations.length > 0 ? (
                              simResult.recommendations.map((rec, idx) => (
                                <li key={idx}>{rec}</li>
                              ))
                            ) : (
                              <li>โครงสร้างสถาปัตยกรรมที่ออกแบบทนทานแรงกดดันได้ดีมากในสเกลปัจจุบัน แนะนำให้หมั่นตรวจสอบ Log และตั้งงบประมาณอย่างรัดกุม</li>
                            )}
                          </ul>
                        </div>

                        <button 
                          onClick={() => {
                            setChatOpen(true);
                            setNewMessage(`ช่วยอธิบายวิธีแก้ไขเรื่อง "${simResult.bottlenecksTriggered[0] || "การรับส่งข้อมูลและการขยายตัว"}" อย่างละเอียด และขอแนวทางการคอนฟิกสตรีมมิ่งด้วยครับ`);
                          }}
                          className="mt-4 text-[10px] font-bold text-indigo-400 hover:text-white transition-colors flex items-center gap-1 self-start"
                        >
                          คุยกับ AI ต่อเพื่อขอโค้ดแก้ไขปัญหานี้ &rarr;
                        </button>
                      </div>
                    </div>

                  </div>
                ) : null}
              </div>

              {/* Advanced Bottlenecks & Security Matrix Tabs */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* 1. Technical Bottlenecks deep-dive list */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    วิเคราะห์คอขวดไอทีที่ซับซ้อน (IT System Bottleneck Analysis)
                  </h3>
                  <div className="space-y-4">
                    {report.bottlenecks && report.bottlenecks.length > 0 ? (
                      report.bottlenecks.map((b) => (
                        <div key={b.id} className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-indigo-300">{b.title}</span>
                            <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded ${
                              b.severity === "high" ? "bg-red-500/20 text-red-400 border border-red-500/30" :
                              b.severity === "medium" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                              "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                            }`}>
                              {b.severity.toUpperCase()} SEVERITY
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed">{b.description}</p>
                          <div className="pt-2 border-t border-white/5">
                            <span className="text-[10px] font-bold text-emerald-400 block mb-0.5">💡 แผนสลายคอขวด (Solution):</span>
                            <p className="text-xs text-slate-300 leading-relaxed">{b.solution}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 italic">ไม่พบปัญหาคอขวดที่ลงทะเบียนไว้</p>
                    )}
                  </div>
                </div>

                {/* 2. System Security Threats modeling */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    แผนบริหารความปลอดภัยไซเบอร์ (Threat Modeling & Security Matrix)
                  </h3>
                  <div className="space-y-4">
                    {report.securityRisks && report.securityRisks.length > 0 ? (
                      report.securityRisks.map((s) => (
                        <div key={s.id} className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-emerald-300">{s.title}</span>
                            <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded ${
                              s.severity === "high" ? "bg-red-500/20 text-red-400 border border-red-500/30" :
                              s.severity === "medium" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                              "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                            }`}>
                              {s.severity.toUpperCase()} RISK
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed">{s.description}</p>
                          <div className="pt-2 border-t border-white/5">
                            <span className="text-[10px] font-bold text-indigo-400 block mb-0.5">🛡️ มาตรการคุ้มกันระบบ (Mitigation):</span>
                            <p className="text-xs text-slate-300 leading-relaxed">{s.mitigation}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 italic">ไม่พบบันทึกความเสี่ยงความปลอดภัยทางไซเบอร์</p>
                    )}
                  </div>
                </div>

              </div>

              {/* Cloud Provider Comparative Matrix */}
              <div id="cloud_comparison" className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  ตารางเปรียบเทียบเทคโนโลยีข้ามแพลตฟอร์ม (Cross-Cloud & Hybrid Options)
                </h3>
                <p className="text-xs text-slate-400 mb-5">
                  ตารางสรุปผลเปรียบเทียบบริการที่ทำงานทดแทนกันได้ในค่ายยักษ์ใหญ่ เพื่อลดการผูกขาดเทคโนโลยี (Vendor Lock-in) และวางแผน Hybrid Integration
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-[10px] uppercase font-bold text-slate-400 bg-black/30">
                        <th className="p-3">ระบบย่อย (Layer)</th>
                        <th className="p-3">AWS Resource</th>
                        <th className="p-3">Azure Resource</th>
                        <th className="p-3">GCP Resource</th>
                        <th className="p-3">กลยุทธ์ Hybrid / Open-Source Alternative</th>
                        <th className="p-3 text-emerald-400">จุดดี (Pros)</th>
                        <th className="p-3 text-red-400">จุดจำกัด (Cons)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {report.techComparison && report.techComparison.length > 0 ? (
                        report.techComparison.map((tech, idx) => (
                          <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                            <td className="p-3 font-semibold text-white">{tech.category}</td>
                            <td className="p-3 font-mono text-orange-400">{tech.awsProduct}</td>
                            <td className="p-3 font-mono text-blue-400">{tech.azureProduct}</td>
                            <td className="p-3 font-mono text-red-400">{tech.gcpProduct}</td>
                            <td className="p-3 text-indigo-200">{tech.hybridApproach}</td>
                            <td className="p-3 text-slate-300 leading-relaxed">{tech.pros}</td>
                            <td className="p-3 text-slate-400 leading-relaxed">{tech.cons}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="p-3 text-center text-slate-500 italic">ไม่พบบันทึกการเปรียบเทียบเทคโนโลยี</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Long term Infrastructure Cost Optimization Table */}
              <div id="cost_optimization_block" className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  แผนการบริหารและลดต้นทุนโครงสร้างระบบไอทีระยะยาว (Cost Optimization & Savings)
                </h3>
                <p className="text-xs text-slate-400 mb-5">
                  ประมาณการค่าใช้จ่ายและวิธีการประหยัดงบด้วยการแบ่งภาระระบบบางส่วนไปทำงานที่ On-Premises หรือใช้เครื่องมือจัดซื้อแบบคุ้มค่า
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {report.costOptimization && report.costOptimization.length > 0 ? (
                    report.costOptimization.map((cost, idx) => (
                      <div key={idx} className="bg-[#05080c] border border-white/10 rounded-xl p-5 flex flex-col justify-between hover:border-indigo-500/40 transition-all duration-300">
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">แนวทางการประหยัด</span>
                          <h4 className="text-white font-bold text-sm leading-tight mb-2">{cost.item}</h4>
                          
                          <p className="text-xs text-slate-400 leading-relaxed mt-2">
                            <strong className="text-indigo-300 block mb-1">วิธีการทางวิศวกรรม:</strong>
                            {cost.hybridStrategy}
                          </p>
                        </div>

                        <div className="mt-4 pt-4 border-t border-white/5 flex items-baseline justify-between">
                          <div>
                            <span className="text-[9px] text-slate-500 uppercase block">ค่าใช้จ่ายกรณีปกติ</span>
                            <span className="text-sm font-semibold text-slate-300">{cost.currentEstimate}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] text-emerald-500 uppercase block font-bold">อัตราที่ประหยัดได้</span>
                            <span className="text-base font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 block mt-0.5">
                              {cost.potentialSavings}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic">ไม่มีข้อมูลประมาณการค่าใช้จ่าย</p>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] border border-dashed border-white/10 rounded-2xl p-12 text-center text-slate-500 bg-white/[0.01]">
              <Cpu className="w-12 h-12 text-indigo-500/40 mb-4 animate-pulse" />
              <h4 className="text-white font-bold text-base mb-1">ยังไม่มีโมเดลสถาปัตยกรรมที่วิเคราะห์</h4>
              <p className="text-xs max-w-sm mb-4">
                เลือกแบบสำเร็จรูปด้านซ้าย หรือกรอกรายละเอียดระบบไอทีที่ต้องการออกแบบเพื่อรับแผนภาพผังเครือข่าย ปัญหาคอขวด และมาตรการความปลอดภัย
              </p>
              <button 
                onClick={() => triggerAnalysis()}
                className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-500 transition-colors"
              >
                เริ่มคำนวณทันที
              </button>
            </div>
          )}

        </main>

        {/* Floating/Collapsible Sidebar: AI Strategy Consultant Chat */}
        <aside 
          id="chat_advisor_drawer"
          className={`fixed inset-y-16 right-0 w-full sm:w-[450px] bg-[#05070a]/95 border-l border-white/10 z-40 flex flex-col shadow-2xl transition-all duration-300 transform ${
            chatOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#080d15]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <Award className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-white uppercase tracking-wider">ห้องปรึกษาที่ปรึกษาไอทีระดับองค์กร (Lead IT Architect)</h4>
                <p className="text-[9px] text-slate-500">ตอบกลับเชิงวิศวกรรมซอฟต์แวร์และการจัดการคลาวด์</p>
              </div>
            </div>
            
            <button 
              onClick={() => setChatOpen(false)}
              className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 rounded hover:bg-white/5"
            >
              ย่อหน้าต่าง &times;
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/25">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div 
                  className={`max-w-[85%] rounded-xl p-3.5 text-xs leading-relaxed whitespace-pre-wrap ${
                    msg.sender === "user" 
                      ? "bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-600/15" 
                      : "bg-[#0c121e] border border-white/10 text-slate-200 rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-slate-500 mt-1 font-mono">{msg.time}</span>
              </div>
            ))}
            
            {chatLoading && (
              <div className="flex items-center gap-2 text-xs text-slate-400 bg-white/5 border border-white/5 rounded-xl p-3.5 self-start w-[80%]">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                กำลังร่างแนวทางปฏิบัติและการกำหนดค่าตามเงื่อนไขไอที...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Quick Queries Suggestion */}
          {report && (
            <div className="px-4 py-2 bg-slate-900/60 border-t border-white/5 flex flex-wrap gap-1.5 overflow-x-auto shrink-0">
              <button 
                onClick={() => {
                  setNewMessage("ขอตัวอย่างไฟล์สคริปต์ Terraform เบื้องต้นสำหรับสปอนเซอร์สถาปัตยกรรมนี้หน่อยครับ");
                }}
                className="text-[9px] text-indigo-300 hover:text-white bg-indigo-500/10 border border-indigo-500/20 rounded px-2 py-1 font-medium whitespace-nowrap transition-colors"
              >
                📦 ขอสคริปต์ Terraform
              </button>
              <button 
                onClick={() => {
                  setNewMessage(`ช่วยวางกลยุทธ์การสำรองข้อมูลและกู้คืนระบบภัยพิบัติ (Disaster Recovery RTO/RPO) ของระบบนี้อย่างสมบูรณ์แบบครับ`);
                }}
                className="text-[9px] text-emerald-300 hover:text-white bg-emerald-500/10 border border-emerald-500/20 rounded px-2 py-1 font-medium whitespace-nowrap transition-colors"
              >
                💾 แผนสำรองกู้ระบบ DR Plan
              </button>
              <button 
                onClick={() => {
                  setNewMessage("ถ้าต้องการลดต้นทุนเพิ่มอีก 20% โดยยอมรับให้ระบบบางส่วนหน่วงขึ้น ควรพิจารณาปรับโหนดใดเป็นหลักครับ");
                }}
                className="text-[9px] text-amber-300 hover:text-white bg-amber-500/10 border border-amber-500/20 rounded px-2 py-1 font-medium whitespace-nowrap transition-colors"
              >
                💸 คำแนะนำลดต้นทุนประหยัด
              </button>
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 bg-[#080d15] flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="สอบถามเกี่ยวกับ Terraform, การตั้งค่า WAF, วิธีแก้ Latency..."
              className="flex-1 bg-[#020408] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || chatLoading}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg px-4 py-2 text-xs font-bold transition-all flex items-center justify-center shrink-0 border border-indigo-400/20 shadow-md shadow-indigo-600/15"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </aside>

      </div>

      {/* Persistent Immersive System Status Bar Footer */}
      <footer id="system_footer" className="h-9 bg-black border-t border-white/5 px-6 md:px-8 flex items-center justify-between text-[10px] font-mono text-slate-500 relative z-10 shrink-0">
        <div className="flex gap-6">
          <span>HOST_PLATFORM: Google Cloud Run</span>
          <span className="hidden sm:inline">REGION: ap-southeast-1</span>
          <span className="text-indigo-400">LAST LIVE SCAN: {new Date().toLocaleTimeString()}</span>
        </div>
        <div className="flex gap-4">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> DB Core: OK
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> API Gateway: OK
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Cloud HSM Security: ACTIVE
          </span>
        </div>
      </footer>

    </div>
  );
}
