import { useState, useEffect, useRef } from "react";
import { TopologyNode, TopologyConnection } from "../types";
import { 
  Shield, 
  Server, 
  Database, 
  Cpu, 
  Globe, 
  Layers, 
  Network, 
  HardDrive, 
  HelpCircle, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  TrendingDown,
  RefreshCw,
  Sliders,
  Settings
} from "lucide-react";

interface TopologyBoardProps {
  nodes: TopologyNode[];
  connections: TopologyConnection[];
  onNodeSelect?: (node: TopologyNode) => void;
  selectedNodeId?: string;
}

export default function TopologyBoard({ 
  nodes, 
  connections, 
  onNodeSelect, 
  selectedNodeId 
}: TopologyBoardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 480 });
  const [activeConnection, setActiveConnection] = useState<string | null>(null);

  // Responsive Resize Observer
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ 
          width: Math.max(width, 640), 
          height: Math.max(height, 420) 
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Categorize nodes into 5 architectural columns (left to right)
  const columns: { [key: number]: TopologyNode[] } = {
    0: [], // Ingress & Public Security (CDN, DNS, WAF)
    1: [], // Gateway & Load Balancers
    2: [], // Compute & App Servers (APIs, Microservices)
    3: [], // Middleware, Cache & Queues (Redis, Kafka)
    4: [], // Storage & Databases (Primary, Replicas, On-Premise Core)
  };

  nodes.forEach((node) => {
    switch (node.category) {
      case "ingress":
      case "security":
        columns[0].push(node);
        break;
      case "gateway":
        columns[1].push(node);
        break;
      case "compute":
        columns[2].push(node);
        break;
      case "cache":
      case "queue":
      case "integration":
        columns[3].push(node);
        break;
      case "database":
      default:
        columns[4].push(node);
        break;
    }
  });

  // Calculate Node Coordinates based on Column Layout
  const nodePositions: { [id: string]: { x: number; y: number } } = {};
  const numColumns = 5;
  const colWidth = dimensions.width / numColumns;

  Object.keys(columns).forEach((colStr) => {
    const colIndex = parseInt(colStr);
    const colNodes = columns[colIndex];
    const numNodes = colNodes.length;

    colNodes.forEach((node, rowIndex) => {
      // Horizontal position: Center of column
      const x = colWidth * colIndex + colWidth / 2;
      
      // Vertical position: Spaced out evenly
      const ySpacing = dimensions.height / (numNodes + 1);
      const y = ySpacing * (rowIndex + 1);

      nodePositions[node.id] = { x, y };
    });
  });

  // Get matching icon for category
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "ingress":
        return <Globe className="w-5 h-5 text-blue-600" />;
      case "security":
        return <Shield className="w-5 h-5 text-emerald-600" />;
      case "gateway":
        return <Network className="w-5 h-5 text-indigo-600" />;
      case "compute":
        return <Cpu className="w-5 h-5 text-purple-600" />;
      case "cache":
        return <HardDrive className="w-5 h-5 text-amber-600" />;
      case "queue":
        return <Layers className="w-5 h-5 text-teal-600" />;
      case "integration":
        return <RefreshCw className="w-5 h-5 text-orange-600" />;
      case "database":
        return <Database className="w-5 h-5 text-cyan-600" />;
      default:
        return <Server className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "secure":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            ปลอดภัย
          </span>
        );
      case "warning":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            เสี่ยงคอขวด
          </span>
        );
      case "critical":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-red-700 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
            <XCircle className="w-3 h-3 text-red-600" />
            ล่อแหลม
          </span>
        );
      default:
        return null;
    }
  };

  const getProviderStyle = (provider: string) => {
    switch (provider) {
      case "aws":
        return "border-orange-200 bg-orange-50/50 hover:border-orange-400";
      case "azure":
        return "border-blue-200 bg-blue-50/50 hover:border-blue-400";
      case "gcp":
        return "border-red-200 bg-red-50/50 hover:border-red-400";
      case "on-premise":
        return "border-slate-300 bg-slate-50 hover:border-slate-500";
      case "hybrid":
      default:
        return "border-emerald-200 bg-emerald-50/50 hover:border-emerald-400";
    }
  };

  return (
    <div className="w-full flex flex-col bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
      {/* Topology Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-100 bg-slate-50/60 px-4 py-3 gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-indigo-50 rounded">
            <Sliders className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">ผังจำลองโครงสร้างสถาปัตยกรรมระบบไอที (System Topology Map)</h3>
            <p className="text-xs text-slate-500">แสดงการเชื่อมโยง ทิศทางข้อมูล และสถานะความปลอดภัยของแต่ละ Component</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-600">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-400 border border-orange-500" /> AWS
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400 border border-blue-500" /> Azure
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400 border border-slate-500" /> On-Premise
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-emerald-500" /> Hybrid
          </span>
        </div>
      </div>

      {/* Layer column labels */}
      <div className="grid grid-cols-5 border-b border-slate-100 bg-slate-50/20 text-center py-2 text-xs font-medium text-slate-500">
        <div className="border-r border-slate-100/60">1. Entry & WAF</div>
        <div className="border-r border-slate-100/60">2. Gateway / Proxy</div>
        <div className="border-r border-slate-100/60">3. Compute / Services</div>
        <div className="border-r border-slate-100/60">4. Cache & Queue</div>
        <div>5. Database & Core</div>
      </div>

      {/* Topology Area */}
      <div 
        ref={containerRef}
        className="relative w-full overflow-hidden bg-slate-50/30 min-h-[460px] cursor-crosshair select-none"
        style={{ height: dimensions.height }}
      >
        {/* SVG Connections Overlay */}
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ width: dimensions.width, height: dimensions.height }}
        >
          <defs>
            {/* Direct and secure line gradients */}
            <linearGradient id="secure-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="warning-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.8" />
            </linearGradient>
            
            {/* Arrow marker for direction flow */}
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#cbd5e1" />
            </marker>
            <marker
              id="arrow-active"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#6366f1" />
            </marker>
          </defs>

          {/* Render Connections */}
          {connections.map((connection, idx) => {
            const start = nodePositions[connection.from];
            const end = nodePositions[connection.to];

            if (!start || !end) return null;

            const connId = `${connection.from}-${connection.to}`;
            const isSelected = activeConnection === connId;

            // Draw curved path (S-curve or cubic bezier) for smooth diagrams
            const dx = end.x - start.x;
            const controlOffset = Math.min(Math.abs(dx) * 0.5, 100);
            const pathData = `M ${start.x} ${start.y} 
                              C ${start.x + controlOffset} ${start.y}, 
                                ${end.x - controlOffset} ${end.y}, 
                                ${end.x} ${end.y}`;

            return (
              <g key={connId}>
                {/* Background thicker invisible line for hover triggers */}
                <path
                  d={pathData}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="12"
                  className="cursor-pointer pointer-events-auto"
                  onMouseEnter={() => setActiveConnection(connId)}
                  onMouseLeave={() => setActiveConnection(null)}
                />

                {/* Primary connection line */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={isSelected ? "url(#secure-grad)" : "#e2e8f0"}
                  strokeWidth={isSelected ? "3.5" : "2"}
                  markerEnd={isSelected ? "url(#arrow-active)" : "url(#arrow)"}
                  className="transition-all duration-300"
                />

                {/* Flow particles effect for active connection */}
                {isSelected && (
                  <path
                    d={pathData}
                    fill="none"
                    stroke="#818cf8"
                    strokeWidth="2"
                    strokeDasharray="8, 12"
                    className="animate-[dash_1.5s_linear_infinite]"
                    style={{
                      strokeDashoffset: 100
                    }}
                  />
                )}

                {/* Connection Label in center */}
                {isSelected && connection.label && (
                  <foreignObject
                    x={(start.x + end.x) / 2 - 60}
                    y={(start.y + end.y) / 2 - 10}
                    width="120"
                    height="20"
                    className="overflow-visible pointer-events-none"
                  >
                    <div className="bg-slate-900/90 text-[10px] text-white px-1.5 py-0.5 rounded shadow text-center font-mono select-none">
                      {connection.label}
                    </div>
                  </foreignObject>
                )}
              </g>
            );
          })}
        </svg>

        {/* Render Interactive Node Elements */}
        {nodes.map((node) => {
          const pos = nodePositions[node.id];
          if (!pos) return null;

          const isSelected = selectedNodeId === node.id;
          const providerStyle = getProviderStyle(node.provider);

          return (
            <div
              key={node.id}
              className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-2.5 px-3 py-2 border rounded-lg shadow-sm transition-all duration-300 cursor-pointer pointer-events-auto select-none
                ${providerStyle} 
                ${isSelected ? "ring-2 ring-indigo-500 scale-105 border-indigo-400 bg-indigo-50/10 shadow-md" : "hover:scale-[1.02]"}
              `}
              style={{
                left: pos.x,
                top: pos.y,
                width: "165px",
              }}
              onClick={() => onNodeSelect && onNodeSelect(node)}
            >
              <div className="p-1.5 bg-white rounded-md shadow-inner border border-slate-100 flex-shrink-0">
                {getCategoryIcon(node.category)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-slate-800 leading-tight truncate">
                  {node.name}
                </p>
                <p className="text-[9px] font-mono text-slate-400 mt-0.5 truncate uppercase">
                  {node.serviceName}
                </p>
              </div>
              {node.status !== "secure" && (
                <div className="absolute -top-1.5 -right-1.5 flex h-3 w-3">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${node.status === "critical" ? "bg-red-400" : "bg-amber-400"}`}></span>
                  <span className={`relative inline-flex rounded-full h-3 w-3 ${node.status === "critical" ? "bg-red-500" : "bg-amber-500"}`}></span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Styled Grid Legend Footer */}
      <div className="bg-slate-50 border-t border-slate-100 px-4 py-2.5 text-[11px] text-slate-500 flex flex-wrap gap-4 items-center justify-between">
        <div>💡 วางเมาส์เหนือเส้นเพื่อตรวจสอบรูปแบบความสัมพันธ์การรับส่งข้อมูล (เช่น HTTPS, API REST, Sync CDC)</div>
        <div className="flex gap-2">
          <span className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-emerald-500" /> ปลอดภัยสูงสุด
          </span>
          <span className="flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> คอขวดสถิติสูง
          </span>
          <span className="flex items-center gap-1">
            <XCircle className="w-3 h-3 text-red-500" /> จุดรับภาระวิกฤต
          </span>
        </div>
      </div>
    </div>
  );
}
