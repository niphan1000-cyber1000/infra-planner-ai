import React from "react";
import { Award, Send, Loader2 } from "lucide-react";
import { useAppContext } from "../hooks/useAppContext";

export const ChatAdvisorDrawer: React.FC = () => {
  const { 
    state, 
    dispatch, 
    handleSendMessage, 
    messagesEndRef 
  } = useAppContext();

  const { chatOpen, messages, newMessage, chatLoading, report } = state;

  return (
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
          onClick={() => dispatch({ type: "TOGGLE_CHAT" })}
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
              dispatch({ type: "SET_NEW_MESSAGE", value: "ขอตัวอย่างไฟล์สคริปต์ Terraform เบื้องต้นสำหรับสปอนเซอร์สถาปัตยกรรมนี้หน่อยครับ" });
            }}
            className="text-[9px] text-indigo-300 hover:text-white bg-indigo-500/10 border border-indigo-500/20 rounded px-2 py-1 font-medium whitespace-nowrap transition-colors"
          >
            📦 ขอสคริปต์ Terraform
          </button>
          <button 
            onClick={() => {
              dispatch({ type: "SET_NEW_MESSAGE", value: "ช่วยวางกลยุทธ์การสำรองข้อมูลและกู้คืนระบบภัยพิบัติ (Disaster Recovery RTO/RPO) ของระบบนี้อย่างสมบูรณ์แบบครับ" });
            }}
            className="text-[9px] text-emerald-300 hover:text-white bg-emerald-500/10 border border-emerald-500/20 rounded px-2 py-1 font-medium whitespace-nowrap transition-colors"
          >
            💾 แผนสำรองกู้ระบบ DR Plan
          </button>
          <button 
            onClick={() => {
              dispatch({ type: "SET_NEW_MESSAGE", value: "ถ้าต้องการลดต้นทุนเพิ่มอีก 20% โดยยอมรับให้ระบบบางส่วนหน่วงขึ้น ควรพิจารณาปรับโหนดใดเป็นหลักครับ" });
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
          onChange={(e) => dispatch({ type: "SET_NEW_MESSAGE", value: e.target.value })}
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
  );
};
