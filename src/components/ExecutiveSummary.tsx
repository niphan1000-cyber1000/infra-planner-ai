import React from "react";
import { useAppContext } from "../hooks/useAppContext";

export const ExecutiveSummary: React.FC = () => {
  const { state } = useAppContext();
  const { report, requirements } = state;

  if (!report) return null;

  return (
    <div className="bg-gradient-to-br from-indigo-950/20 via-[#05070a] to-emerald-950/10 border border-white/10 rounded-2xl p-6 relative overflow-hidden shadow-xl">
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: "radial-gradient(#ffffff 0.5px, transparent 0.5px)",
          backgroundSize: "20px 20px",
        }}
      ></div>

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
          <h2 className="text-2xl font-bold text-white mb-3">
            สรุปแผนยุทธศาสตร์สถาปัตยกรรมไอทีระดับองค์กร
          </h2>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
            {report.executiveSummary}
          </p>
        </div>

        <div className="md:w-64 bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col justify-between gap-3 flex-shrink-0">
          <div>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              มาตรฐานที่รองรับ
            </span>
            <div className="flex flex-wrap gap-1">
              {requirements.compliance.length > 0 ? (
                requirements.compliance.map((c) => (
                  <span
                    key={c}
                    className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20"
                  >
                    {c}
                  </span>
                ))
              ) : (
                <span className="text-[10px] text-slate-400 italic">ไม่ได้กำหนดเจาะจง</span>
              )}
            </div>
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              สถิติปริมาณผู้ใช้เป้าหมาย
            </span>
            <p className="text-xs font-bold text-white capitalize">
              {requirements.userVolume === "low"
                ? "≤ 5k สตาร์ทอัพ"
                : requirements.userVolume === "medium"
                  ? "10k-50k ระดับองค์กร"
                  : requirements.userVolume === "high"
                    ? "100k+ ผู้ใช้สูง"
                    : "1M+ ข้อมูลความจุวิกฤต"}
            </p>
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              คลาวด์ยุทธศาสตร์
            </span>
            <p className="text-xs font-bold text-indigo-300 capitalize">
              {requirements.cloudPreference}
            </p>
          </div>
        </div>
      </div>

      {report.hybridCloudStrategy && (
        <div className="mt-5 pt-5 border-t border-white/5 relative z-10">
          <h4 className="text-xs font-bold text-indigo-300 mb-1.5 uppercase tracking-wider">
            🔗 กลยุทธ์การเชื่อมโยงข้อมูลแบบ Hybrid & Multi-Cloud
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">{report.hybridCloudStrategy}</p>
        </div>
      )}
    </div>
  );
};
