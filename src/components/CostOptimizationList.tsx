import React from "react";
import { TrendingDown } from "lucide-react";
import { CostOptimizationItem } from "../types";

interface CostOptimizationListProps {
  costOptimization: CostOptimizationItem[];
}

export default function CostOptimizationList({ costOptimization }: CostOptimizationListProps) {
  return (
    <div
      id="cost_optimization"
      className="bg-[#05080f] border border-white/5 rounded-2xl p-6 shadow-xl space-y-4"
    >
      <div className="flex items-center gap-2 border-b border-white/5 pb-4">
        <div className="p-1.5 bg-emerald-500/10 rounded border border-emerald-500/20">
          <TrendingDown className="w-4 h-4 text-emerald-400" />
        </div>
        <div>
          <h4 className="font-bold text-white text-sm">
            การบริหารต้นทุนและจุดที่สามารถประหยัดงบได้ (Cost & Budget Optimization)
          </h4>
          <p className="text-xs text-slate-500">
            วิธีการปรับแต่งการประเมินค่าใช้จ่าย แนะนำกลยุทธ์ไฮบริดหรือเครื่องมือประหยัดเฉพาะด้าน
            เพื่อความคุ้มค่าสูงสุด
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {costOptimization.map((item, idx) => (
          <div
            key={idx}
            className="bg-gradient-to-br from-[#0b1220] to-[#070b14] border border-white/5 rounded-xl p-4 space-y-3 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-bl from-emerald-500/5 to-transparent rounded-bl-full pointer-events-none" />

            <div className="flex justify-between items-start gap-2">
              <span className="text-xs font-bold text-slate-100 uppercase tracking-wider block">
                {item.item}
              </span>
              <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 whitespace-nowrap">
                ประหยัด {item.potentialSavings}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] border-t border-b border-white/5 py-2 font-mono">
              <div>
                <span className="text-slate-500 block text-[9px] uppercase">
                  ประมาณการค่าใช้จ่าย
                </span>
                <span className="text-slate-200 font-bold">{item.currentEstimate}</span>
              </div>
              <div>
                <span className="text-emerald-500 block text-[9px] uppercase">
                  สัดส่วนส่วนลดคาดหวัง
                </span>
                <span className="text-emerald-400 font-bold">~ {item.potentialSavings}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block mb-1">
                💡 แผนงานเชิงเทคนิค / Hybrid Strategy:
              </span>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line bg-black/40 p-2.5 rounded border border-white/5">
                {item.hybridStrategy}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
