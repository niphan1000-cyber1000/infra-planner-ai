import React from "react";
import { 
  Flame, 
  Play, 
  TrendingUp, 
  CheckCircle, 
  Loader2 
} from "lucide-react";
import { useAppContext } from "../hooks/useAppContext";

export const StressSimulator: React.FC = () => {
  const { state, dispatch, runStressSimulation } = useAppContext();
  const { simScenario, simResult, isSimulating } = state;

  return (
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
                  dispatch({ type: "OPEN_CHAT" });
                  dispatch({ type: "SET_NEW_MESSAGE", value: `ช่วยอธิบายวิธีแก้ไขเรื่อง "${simResult.bottlenecksTriggered[0] || "การรับส่งข้อมูลและการขยายตัว"}" อย่างละเอียด และขอแนวทางการคอนฟิกสตรีมมิ่งด้วยครับ` });
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
  );
};
