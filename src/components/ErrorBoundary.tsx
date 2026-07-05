import * as React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error inside ErrorBoundary:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div id="error_boundary_fallback" className="min-h-screen bg-[#02040a] text-slate-100 flex flex-col items-center justify-center p-6 select-none font-sans">
          <div className="max-w-md w-full bg-[#05080f] border border-rose-500/20 rounded-2xl p-6 shadow-2xl text-center space-y-5">
            <div className="mx-auto w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
              <AlertTriangle className="w-6 h-6 text-rose-500 animate-bounce" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-lg font-bold text-white uppercase tracking-wide">เกิดข้อผิดพลาดในการประมวลผล UI</h1>
              <p className="text-xs text-slate-400 leading-relaxed">
                ระบบสวมบทบาทสถาปนิกไอทีตรวจพบความขัดข้องในโครงสร้างส่วนการแสดงผล (Renderer Engine) กรุณาลองรีเซ็ตสถานะหน้าจออีกครั้ง
              </p>
            </div>

            {this.state.error && (
              <div className="bg-black/40 p-3 rounded-lg border border-white/5 text-left font-mono text-[10px] text-rose-400 overflow-x-auto max-h-32">
                <span className="font-bold uppercase block mb-1 text-slate-500">System Log:</span>
                {this.state.error.message}
                {this.state.error.stack && (
                  <span className="block mt-1 text-slate-500 opacity-80 whitespace-pre-wrap">
                    {this.state.error.stack.split("\n").slice(0, 3).join("\n")}
                  </span>
                )}
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium text-xs py-2.5 px-4 rounded-xl shadow-md cursor-pointer transition-all duration-200"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              รีเซ็ตและโหลดแอปพลิเคชันใหม่
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
