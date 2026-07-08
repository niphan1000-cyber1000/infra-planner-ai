import React, { memo } from "react";
import { Layers } from "lucide-react";
import { TechComparisonItem } from "../types";

interface TechComparisonMatrixProps {
  techComparison: TechComparisonItem[];
}

const TechComparisonMatrix = memo(function TechComparisonMatrix({
  techComparison,
}: TechComparisonMatrixProps) {
  return (
    <div
      id="tech_comparison"
      className="bg-[#05080f] border border-white/5 rounded-2xl p-6 shadow-xl space-y-4"
    >
      <div className="flex items-center gap-2 border-b border-white/5 pb-4">
        <div className="p-1.5 bg-indigo-500/10 rounded border border-indigo-500/20">
          <Layers className="w-4 h-4 text-indigo-400" />
        </div>
        <div>
          <h4 className="font-bold text-white text-sm">
            เปรียบเทียบคุณสมบัติเครื่องมือคลาวด์และแนวทางแบบไฮบริด (Cloud Comparison Matrix)
          </h4>
          <p className="text-xs text-slate-500">
            ตารางวิเคราะห์เปรียบเทียบแบบเจาะลึกระหว่าง AWS, Azure, GCP และการปรับใช้ควบคู่กับ Legacy
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/5">
        <table className="w-full text-xs text-left text-slate-300">
          <thead className="bg-[#0b1220]/80 text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-white/5">
            <tr>
              <th scope="col" className="px-4 py-3">
                หมวดหมู่ระบบ
              </th>
              <th scope="col" className="px-4 py-3 text-orange-400">
                AWS
              </th>
              <th scope="col" className="px-4 py-3 text-sky-400">
                Azure
              </th>
              <th scope="col" className="px-4 py-3 text-red-400">
                GCP
              </th>
              <th scope="col" className="px-4 py-3 text-emerald-400">
                กลยุทธ์ไฮบริด & Legacy
              </th>
              <th scope="col" className="px-4 py-3 text-slate-200">
                จุดดีเด่น / Pros
              </th>
              <th scope="col" className="px-4 py-3 text-rose-300">
                จุดควรระวัง / Cons
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {techComparison.map((item, idx) => (
              <tr key={idx} className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-3.5 font-bold text-slate-100">{item.category}</td>
                <td className="px-4 py-3.5 font-mono text-orange-300">{item.awsProduct}</td>
                <td className="px-4 py-3.5 font-mono text-sky-300">{item.azureProduct}</td>
                <td className="px-4 py-3.5 font-mono text-red-300">{item.gcpProduct}</td>
                <td className="px-4 py-3.5 bg-emerald-950/5 leading-relaxed text-emerald-300 font-mono">
                  {item.hybridApproach}
                </td>
                <td className="px-4 py-3.5 text-emerald-200 whitespace-pre-line leading-relaxed">
                  {item.pros}
                </td>
                <td className="px-4 py-3.5 text-rose-200 whitespace-pre-line leading-relaxed">
                  {item.cons}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

export default TechComparisonMatrix;
