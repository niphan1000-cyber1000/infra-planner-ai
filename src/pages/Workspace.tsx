import React, { lazy, Suspense } from "react";
import { Activity, AlertTriangle, Shield, Info, Cpu, Loader2 } from "lucide-react";
import { useAppContext } from "../hooks/useAppContext";

// Shared subcomponents (Lazy loaded for optimized code-splitting and bundle performance)
const TopologyBoard = lazy(() => import("../components/TopologyBoard"));
const StrategicRoadmap = lazy(() => import("../components/StrategicRoadmap"));
const TechComparisonMatrix = lazy(() => import("../components/TechComparisonMatrix"));
const CostOptimizationList = lazy(() => import("../components/CostOptimizationList"));

import SkeletonLoader from "../components/SkeletonLoader";

// Extracted modular components
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { SidebarInputs } from "../components/SidebarInputs";
import { ExecutiveSummary } from "../components/ExecutiveSummary";
import { StressSimulator } from "../components/StressSimulator";
import { ChatAdvisorDrawer } from "../components/ChatAdvisorDrawer";

export const Workspace: React.FC = () => {
  const { state, dispatch, triggerAnalysis } = useAppContext();
  const { loading, report, selectedNode, requirements } = state;

  return (
    <div
      id="app_root"
      className="min-h-screen bg-[#020408] text-slate-100 flex flex-col font-sans antialiased selection:bg-indigo-500/30 selection:text-indigo-200"
    >
      {/* Top Navbar Header */}
      <Header />

      {/* Main Workspace Frame */}
      <div
        id="main_workspace"
        className="flex-1 flex flex-col lg:flex-row overflow-hidden relative"
      >
        {/* Left Control Panel / Architectural Input Form */}
        <SidebarInputs />

        {/* Central Dashboard & Output Area */}
        <main
          id="dashboard_content"
          className="flex-1 p-4 md:p-6 flex flex-col gap-6 overflow-y-auto"
        >
          {loading ? (
            <div className="space-y-6">
              {/* Compact Sleek Generating Indicator */}
              <div
                id="loading_status_indicator"
                className="bg-indigo-950/15 border border-indigo-500/10 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden animate-[pulse_2s_infinite]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-xs">
                      กำลังออกแบบแผนผังโครงสร้างสถาปัตยกรรมระดับองค์กร...
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      Gemini AI กำลังเชื่อมต่อ On-Premise & Cloud, วิเคราะห์ความเสี่ยง
                      และเขียนแผนยุทธศาสตร์
                    </p>
                  </div>
                </div>
                <div className="w-full md:w-64 bg-white/5 h-1.5 rounded-full overflow-hidden relative">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 animate-[pulse_1s_infinite] rounded-full"
                    style={{ width: "90%" }}
                  ></div>
                </div>
              </div>

              {/* Pulsing Skeleton Sections */}
              <SkeletonLoader />
            </div>
          ) : report ? (
            <div id="report_display" className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
              {/* Executive Summary Block */}
              <ExecutiveSummary />

              {/* Strategic IT Roadmap & Assessment block */}
              {(report.systemAnalysis || report.itStrategyRoadmap || report.riskManagementPlan) && (
                <Suspense
                  fallback={
                    <div className="h-32 bg-white/5 animate-pulse rounded-2xl flex items-center justify-center text-xs text-slate-400">
                      กำลังโหลดแผนพัฒนา...
                    </div>
                  }
                >
                  <StrategicRoadmap report={report} requirements={requirements} />
                </Suspense>
              )}

              {/* Topology Map visualization */}
              <div id="topology_map_block" className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-indigo-400 animate-pulse" />
                    แผนภาพเครือข่ายจำลอง Topology Map
                  </h3>
                  <span className="text-[10px] text-slate-400">
                    คลิกที่โหนดเพื่อตรวจสอบรายละเอียดสเปคและคำแนะนำเชิงลึก
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Interactive Graph */}
                  <div className="lg:col-span-2">
                    <Suspense
                      fallback={
                        <div className="h-80 bg-white/5 animate-pulse rounded-2xl flex items-center justify-center text-xs text-slate-400">
                          กำลังโหลดแผนผังเครือข่าย...
                        </div>
                      }
                    >
                      <TopologyBoard
                        nodes={report.nodes}
                        connections={report.connections}
                        selectedNodeId={selectedNode?.id}
                        onNodeSelect={(node) => dispatch({ type: "SET_SELECTED_NODE", node })}
                      />
                    </Suspense>
                  </div>

                  {/* Right Selected Node Details Card */}
                  <div className="lg:col-span-1 bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col justify-between shadow-lg">
                    {selectedNode ? (
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-3">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`w-2.5 h-2.5 rounded-full ${
                                  selectedNode.provider === "aws"
                                    ? "bg-orange-500"
                                    : selectedNode.provider === "azure"
                                      ? "bg-blue-500"
                                      : selectedNode.provider === "gcp"
                                        ? "bg-red-500"
                                        : selectedNode.provider === "on-premise"
                                          ? "bg-slate-400"
                                          : "bg-emerald-500"
                                }`}
                              />
                              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">
                                {selectedNode.provider} Resource
                              </span>
                            </div>
                            <h4 className="text-white font-bold text-base mt-1">
                              {selectedNode.name}
                            </h4>
                            <p className="text-xs font-mono text-indigo-300 mt-0.5">
                              {selectedNode.serviceName}
                            </p>
                          </div>

                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                              selectedNode.status === "secure"
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                                : selectedNode.status === "warning"
                                  ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                                  : "bg-red-500/10 border-red-500/30 text-red-300"
                            }`}
                          >
                            {selectedNode.status === "secure"
                              ? "ปลอดภัย"
                              : selectedNode.status === "warning"
                                ? "ความเสี่ยงปานกลาง"
                                : "จุดล่อแหลมวิกฤต"}
                          </span>
                        </div>

                        <div>
                          <span className="text-[9px] font-bold text-slate-500 uppercase block mb-1">
                            หน้าที่ของระบบในโครงสร้าง
                          </span>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {selectedNode.description}
                          </p>
                        </div>

                        <div>
                          <span className="text-[9px] font-bold text-slate-500 uppercase block mb-1">
                            รายละเอียดทางเทคนิค & ความทนทาน
                          </span>
                          <div className="bg-black/40 rounded-lg p-3 border border-white/5 font-mono text-[11px] text-indigo-200">
                            {selectedNode.details}
                          </div>
                        </div>

                        {selectedNode.status !== "secure" && (
                          <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
                            <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5" />{" "}
                              แนะนำการติดตั้งเพิ่มความมั่นคง:
                            </span>
                            <p className="text-[10px] text-slate-300 mt-1 leading-relaxed">
                              โหนดนี้มีโอกาสเกิดคอขวดเมื่อมีทราฟฟิกกระชาก แนะนำให้เปิดใช้งาน
                              Auto-scaling ร่วมกับระบบ Health Probe และตั้งค่า VPC Peering
                              ให้รัดกุมที่สุด
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 py-12">
                        <Info className="w-8 h-8 text-slate-600 mb-2" />
                        <p className="text-xs">
                          กรุณาเลือกโหนดบน Topology เพื่อแสดงรายละเอียดสเปคเชิงสถาปัตยกรรม
                        </p>
                      </div>
                    )}

                    <div className="border-t border-white/5 mt-5 pt-4 text-[10px] text-slate-500">
                      <span>
                        💡 องค์ประกอบนี้สามารถแปลงเป็นสคริปต์ Infrastructure as Code (Terraform)
                        ได้ด้วยการคุยในแชทปรึกษาด้านล่าง
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stress and Resilience Simulator Block */}
              <StressSimulator />

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
                        <div
                          key={b.id}
                          className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-indigo-300">{b.title}</span>
                            <span
                              className={`text-[9px] font-extrabold px-2 py-0.5 rounded ${
                                b.severity === "high"
                                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                  : b.severity === "medium"
                                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                    : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                              }`}
                            >
                              {b.severity.toUpperCase()} SEVERITY
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed">{b.description}</p>
                          <div className="pt-2 border-t border-white/5">
                            <span className="text-[10px] font-bold text-emerald-400 block mb-0.5">
                              💡 แผนสลายคอขวด (Solution):
                            </span>
                            <p className="text-xs text-slate-300 leading-relaxed">{b.solution}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 italic">
                        ไม่พบปัญหาคอขวดที่ลงทะเบียนไว้
                      </p>
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
                        <div
                          key={s.id}
                          className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-emerald-300">{s.title}</span>
                            <span
                              className={`text-[9px] font-extrabold px-2 py-0.5 rounded ${
                                s.severity === "high"
                                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                  : s.severity === "medium"
                                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                    : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                              }`}
                            >
                              {s.severity.toUpperCase()} RISK
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed">{s.description}</p>
                          <div className="pt-2 border-t border-white/5">
                            <span className="text-[10px] font-bold text-indigo-400 block mb-0.5">
                              🛡️ มาตรการคุ้มกันระบบ (Mitigation):
                            </span>
                            <p className="text-xs text-slate-300 leading-relaxed">{s.mitigation}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 italic">
                        ไม่พบบันทึกความเสี่ยงความปลอดภัยทางไซเบอร์
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Cloud Provider Comparative Matrix */}
              {report.techComparison && report.techComparison.length > 0 && (
                <Suspense
                  fallback={
                    <div className="h-48 bg-white/5 animate-pulse rounded-2xl flex items-center justify-center text-xs text-slate-400">
                      กำลังโหลดตารางเปรียบเทียบ...
                    </div>
                  }
                >
                  <TechComparisonMatrix techComparison={report.techComparison} />
                </Suspense>
              )}

              {/* Long term Infrastructure Cost Optimization Table */}
              {report.costOptimization && report.costOptimization.length > 0 && (
                <Suspense
                  fallback={
                    <div className="h-32 bg-white/5 animate-pulse rounded-2xl flex items-center justify-center text-xs text-slate-400">
                      กำลังโหลดตารางวิเคราะห์งบประมาณ...
                    </div>
                  }
                >
                  <CostOptimizationList costOptimization={report.costOptimization} />
                </Suspense>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] border border-dashed border-white/10 rounded-2xl p-12 text-center text-slate-500 bg-white/[0.01]">
              <Cpu className="w-12 h-12 text-indigo-500/40 mb-4 animate-pulse" />
              <h4 className="text-white font-bold text-base mb-1">
                ยังไม่มีโมเดลสถาปัตยกรรมที่วิเคราะห์
              </h4>
              <p className="text-xs max-w-sm mb-4">
                เลือกแบบสำเร็จรูปด้านซ้าย
                หรือกรอกรายละเอียดระบบไอทีที่ต้องการออกแบบเพื่อรับแผนภาพผังเครือข่าย ปัญหาคอขวด
                และมาตรการความปลอดภัย
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
        <ChatAdvisorDrawer />
      </div>

      {/* Persistent Immersive System Status Bar Footer */}
      <Footer />
    </div>
  );
};
