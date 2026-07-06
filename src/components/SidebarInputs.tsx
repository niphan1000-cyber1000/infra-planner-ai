import React from "react";
import { 
  Sparkles, 
  Sliders, 
  Activity, 
  CheckCircle, 
  XCircle, 
  Zap, 
  Loader2, 
  RefreshCw 
} from "lucide-react";
import { useAppContext } from "../hooks/useAppContext";
import { PRESETS } from "../data/presets";

export const SidebarInputs: React.FC = () => {
  const {
    state,
    dispatch,
    health,
    triggerFlushCache,
    isFlushing,
    flushMessage,
    triggerAnalysis,
    handleApplyPreset
  } = useAppContext();

  const { requirements, loading } = state;

  return (
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
              type="button"
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
            onChange={(e) => dispatch({ type: "SET_REQUIREMENT_FIELD", field: "businessType", value: e.target.value })}
            placeholder="เช่น FinTech, E-Commerce, Logistics"
            className="w-full bg-[#0a0f18] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Scale Limit Selection */}
        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">ปริมาณผู้ใช้งานเฉลี่ย / สถิติ</label>
          <select
            value={requirements.userVolume}
            onChange={(e) => dispatch({ type: "SET_REQUIREMENT_FIELD", field: "userVolume", value: e.target.value })}
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
                onClick={() => dispatch({ type: "SET_REQUIREMENT_FIELD", field: "budget", value: b.value })}
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
          <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">คลาวด์/โครงสร้างที่เลือกใช้ (Preference)</label>
          <select
            value={requirements.cloudPreference}
            onChange={(e) => dispatch({ type: "SET_REQUIREMENT_FIELD", field: "cloudPreference", value: e.target.value })}
            className="w-full bg-[#0a0f18] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="aws">Amazon Web Services (AWS)</option>
            <option value="gcp">Google Cloud Platform (GCP)</option>
            <option value="azure">Microsoft Azure (Azure)</option>
            <option value="hybrid">ระบบผสมคู่ขนาน (Hybrid Cloud & On-Premises)</option>
            <option value="on-premise">โครงสร้างหลักองค์กรเอง (Private Data Center / On-Premise)</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">เป้าหมายด้านไอทีและธุรกิจ</label>
          <select
            value={requirements.itGoal}
            onChange={(e) => dispatch({ type: "SET_REQUIREMENT_FIELD", field: "itGoal", value: e.target.value })}
            className="w-full bg-[#0a0f18] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="modernize">ปรับปรุงระบบเดิมและเชื่อมต่อ Legacy (Modernize Legacy)</option>
            <option value="cloud_native">ย้ายข้อมูลสู่คลาวด์และทำ Cloud-Native (Migration to Cloud)</option>
            <option value="high_availability">ต้องการความพร้อมใช้งานสูงและกระจายโหลด (HA & Multi-Region)</option>
            <option value="cost_optimization">ลดค่าใช้จ่ายคลาวด์/ทรัพยากร (Cost Optimization)</option>
            <option value="strict_security">ความปลอดภัยเข้มงวดและระบบที่มีกฎหมายกำกับ (Highly Regulated)</option>
            <option value="zero_trust">สถาปัตยกรรม Zero-Trust & แผนฟื้นฟูภัยพิบัติ DR (Zero-Trust + DR)</option>
          </select>
        </div>

        {/* Extra requirements text */}
        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">รายละเอียดเพิ่มเติม / ความปลอดภัยเฉพาะ</label>
          <textarea
            value={requirements.extraDescription}
            onChange={(e) => dispatch({ type: "SET_REQUIREMENT_FIELD", field: "extraDescription", value: e.target.value })}
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

        <hr className="border-white/5 my-2" />

        {/* System Health & Caching Dashboard */}
        <div className="bg-slate-900/40 border border-white/5 rounded-xl p-3.5 space-y-3.5">
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-indigo-400 animate-pulse" /> 3. ความพร้อมและระบบแคช
            </h4>
            <span className="flex items-center gap-1 text-[9px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
              ONLINE
            </span>
          </div>

          {health ? (
            <div className="space-y-2.5 text-[11px]">
              {/* Status Badges */}
              <div className="grid grid-cols-2 gap-1.5">
                <div className="bg-[#0a0f18] p-1.5 rounded border border-white/5 flex flex-col justify-between">
                  <span className="text-[9px] text-slate-500 uppercase font-medium">Gemini Status</span>
                  <span className={`font-bold mt-0.5 flex items-center gap-1 text-[10px] ${health.gemini_status === 'connected' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {health.gemini_status === 'connected' ? (
                      <>
                        <CheckCircle className="w-3 h-3 shrink-0 text-emerald-400" />
                        Connected
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3 shrink-0 text-rose-400" />
                        Offline
                      </>
                    )}
                  </span>
                </div>
                <div className="bg-[#0a0f18] p-1.5 rounded border border-white/5 flex flex-col justify-between">
                  <span className="text-[9px] text-slate-500 uppercase font-medium">Cache Mode</span>
                  <span className="text-indigo-300 font-bold mt-0.5 flex items-center gap-1 text-[10px]">
                    <Zap className="w-3 h-3 text-amber-400 shrink-0" />
                    {health.cache?.redis?.connected ? "Redis Cluster" : "Memory Cache"}
                  </span>
                </div>
              </div>

              {/* Cache Metrics Details */}
              <div className="bg-[#06090e] p-2 rounded border border-white/5 space-y-1.5">
                <div className="flex justify-between items-center text-slate-400 text-[10px]">
                  <span>อัตรา Cache Hit:</span>
                  <span className="font-mono text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded text-[11px]">
                    {(parseFloat(health.cache?.stats?.hitRatio || "0") * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between text-slate-400 text-[10px]">
                  <span>Cache Hits (Redis / Mem):</span>
                  <span className="text-slate-200 font-mono">
                    {health.cache?.stats?.totalHits} ({health.cache?.stats?.redisHits} / {health.cache?.stats?.memoryHits})
                  </span>
                </div>
                <div className="flex justify-between text-slate-400 text-[10px]">
                  <span>Cache Misses:</span>
                  <span className="text-slate-200 font-mono">{health.cache?.stats?.totalMisses}</span>
                </div>
                <div className="flex justify-between text-slate-400 text-[10px]">
                  <span>คีย์แคชในระบบ:</span>
                  <span className="text-slate-200 font-mono">{health.cache?.memory?.entriesCount} entries</span>
                </div>
              </div>

              {/* Live Production Metrics */}
              {health.metrics && (
                <div className="bg-[#05080d] p-2 rounded border border-white/5 space-y-1.5">
                  <div className="flex justify-between items-center text-slate-400 text-[10px]">
                    <span>จำนวนคำขอรวม (Total Requests):</span>
                    <span className="font-mono text-indigo-400 font-bold bg-indigo-500/10 px-1.5 py-0.5 rounded">
                      {health.metrics.totalRequests} Requests
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400 text-[10px]">
                    <span>เวลารองรับคำขอเฉลี่ย (Avg Response Time):</span>
                    <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      {health.metrics.avgResponseTimeMs} ms
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400 text-[10px]">
                    <span>อัตรา Error ของ Gemini:</span>
                    <span className={`font-mono font-bold px-1.5 py-0.5 rounded ${
                      health.metrics.geminiErrors > 0 
                        ? "text-rose-400 bg-rose-500/10" 
                        : "text-slate-300 bg-slate-500/10"
                    }`}>
                      {health.metrics.geminiErrorRate}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[10px]">
                    <span>ประวัติเรียกใช้ Gemini (Calls/Errors):</span>
                    <span className="text-slate-200 font-mono">
                      {health.metrics.geminiCalls} / {health.metrics.geminiErrors}
                    </span>
                  </div>
                </div>
              )}

              {/* Node system details */}
              <div className="bg-[#0a0f18] p-2 rounded border border-white/5 space-y-1 text-slate-400 text-[10px] font-mono leading-tight">
                <div className="flex justify-between">
                  <span>Uptime:</span>
                  <span className="text-slate-300">{health.uptime_formatted}</span>
                </div>
                <div className="flex justify-between">
                  <span>Node Version:</span>
                  <span className="text-slate-300">{health.node_version}</span>
                </div>
                <div className="flex justify-between">
                  <span>App Version:</span>
                  <span className="text-slate-300">v{health.version}</span>
                </div>
                <div className="flex justify-between">
                  <span>Memory RSS:</span>
                  <span className="text-slate-300">{health.memory?.rss}</span>
                </div>
              </div>

              {/* Clear Cache Button */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={triggerFlushCache}
                  disabled={isFlushing}
                  className="w-full py-1.5 rounded bg-white/5 border border-white/10 text-slate-300 hover:bg-rose-950/20 hover:border-rose-500/30 hover:text-rose-300 text-[10px] font-bold transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isFlushing ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin text-rose-400" />
                      กำลังล้างข้อมูลแคช...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3 h-3 text-slate-400" />
                      ล้างแคชระบบ (Flush Cache)
                    </>
                  )}
                </button>
                {flushMessage && (
                  <p className={`text-[10px] text-center font-bold mt-1.5 animate-pulse ${flushMessage.includes("สำเร็จ") ? "text-emerald-400" : "text-rose-400"}`}>
                    {flushMessage}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-4 text-slate-500 text-[10px] gap-1.5">
              <Loader2 className="w-3 h-3 animate-spin" />
              กำลังดึงข้อมูลสถานะระบบ...
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
