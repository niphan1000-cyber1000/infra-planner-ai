import React from "react";
import { Activity, TrendingUp, Shield } from "lucide-react";
import { ArchitectureReport, ArchitectureRequirements } from "../types";

interface StrategicRoadmapProps {
  report: ArchitectureReport;
  requirements: ArchitectureRequirements;
}

export default function StrategicRoadmap({ report, requirements }: StrategicRoadmapProps) {
  return (
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
  );
}
