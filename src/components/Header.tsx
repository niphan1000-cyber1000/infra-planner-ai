import React from "react";
import { Shield, MessageSquare } from "lucide-react";
import { useAppContext } from "../hooks/useAppContext";

export const Header: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { chatOpen, messages } = state;

  return (
    <nav id="navbar" className="h-16 border-b border-white/5 bg-[#05070a]/80 backdrop-blur-md px-4 md:px-6 flex items-center justify-between z-30 shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 p-[1px] shadow-lg shadow-indigo-600/20">
          <div className="w-full h-full bg-[#05070a] rounded-[11px] flex items-center justify-center text-indigo-400">
            <Shield className="w-4 h-4 animate-pulse" />
          </div>
        </div>
        <div>
          <h1 className="text-sm font-bold text-white tracking-wide">สถาปนิกโครงข่ายระบบ AI อัจฉริยะ</h1>
          <p className="text-[10px] text-indigo-300/70 font-medium">Enterprise Cloud & Hybrid Architecture Sandbox</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button 
          id="chat_toggle_btn"
          onClick={() => dispatch({ type: "TOGGLE_CHAT" })}
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
  );
};
