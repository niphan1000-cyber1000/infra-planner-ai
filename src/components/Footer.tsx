import React from "react";

export const Footer: React.FC = () => {
  return (
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
  );
};
