import { ArchitectureRequirements, ArchitectureReport, TopologyNode, SimulationResult } from "./types";

export interface Message {
  sender: "user" | "ai";
  text: string;
  time: string;
}

export interface AppState {
  requirements: ArchitectureRequirements;
  loading: boolean;
  report: ArchitectureReport | null;
  selectedNode: TopologyNode | null;
  simScenario: string;
  simResult: SimulationResult | null;
  isSimulating: boolean;
  chatOpen: boolean;
  messages: Message[];
  newMessage: string;
  chatLoading: boolean;
}

export type AppAction =
  | { type: "SET_REQUIREMENT_FIELD"; field: keyof ArchitectureRequirements; value: any }
  | { type: "TOGGLE_COMPLIANCE"; compliance: string }
  | { type: "APPLY_PRESET"; presetData: ArchitectureRequirements }
  | { type: "START_ANALYSIS" }
  | { type: "ANALYSIS_SUCCESS"; report: ArchitectureReport; welcomeMessageText: string }
  | { type: "ANALYSIS_FAILURE" }
  | { type: "SET_SELECTED_NODE"; node: TopologyNode | null }
  | { type: "START_STRESS_SIMULATION"; scenario: string }
  | { type: "FINISH_STRESS_SIMULATION"; simResult: SimulationResult }
  | { type: "TOGGLE_CHAT" }
  | { type: "OPEN_CHAT" }
  | { type: "SET_NEW_MESSAGE"; value: string }
  | { type: "SEND_CHAT_MESSAGE"; userMsgObj: Message }
  | { type: "CHAT_MESSAGE_SUCCESS"; aiMsgObj: Message }
  | { type: "CHAT_MESSAGE_FAILURE"; aiErrorMsgObj: Message }
  | { type: "SET_CHAT_LOADING"; loading: boolean };

export const initialRequirements: ArchitectureRequirements = {
  businessType: "E-Commerce",
  userVolume: "medium",
  compliance: ["PDPA"],
  budget: "balanced",
  cloudPreference: "hybrid",
  existingTech: "On-Premises Legacy DB",
  extraDescription: "ต้องการระบบที่ป้องกันการโจมตีทางไซเบอร์ และรองรับการขยายตัวได้ดี",
  itGoal: "modernize",
  riskFocus: "strict"
};

export const initialState: AppState = {
  requirements: initialRequirements,
  loading: false,
  report: null,
  selectedNode: null,
  simScenario: "normal",
  simResult: null,
  isSimulating: false,
  chatOpen: false,
  messages: [
    { 
      sender: "ai", 
      text: "สวัสดีครับ! ผมคือ Enterprise IT Architect AI ยินดีให้คำแนะนำเกี่ยวกับสถาปัตยกรรมระบบไอทีและกลยุทธ์คลาวด์ของคุณ คุณสามารถเลือก Template สำเร็จรูปด้านซ้าย หรือกรอกรายละเอียดเพื่อวิเคราะห์โครงสร้างระบบแบบเจาะลึกได้ทันทีครับ", 
      time: "21:44" 
    }
  ],
  newMessage: "",
  chatLoading: false
};

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_REQUIREMENT_FIELD":
      return {
        ...state,
        requirements: {
          ...state.requirements,
          [action.field]: action.value
        }
      };
    case "TOGGLE_COMPLIANCE": {
      const updated = state.requirements.compliance.includes(action.compliance)
        ? state.requirements.compliance.filter(c => c !== action.compliance)
        : [...state.requirements.compliance, action.compliance];
      return {
        ...state,
        requirements: {
          ...state.requirements,
          compliance: updated
        }
      };
    }
    case "APPLY_PRESET":
      return {
        ...state,
        requirements: action.presetData,
        loading: true,
        selectedNode: null,
        simResult: null,
        simScenario: "normal",
        isSimulating: false
      };
    case "START_ANALYSIS":
      return {
        ...state,
        loading: true,
        selectedNode: null,
        simResult: null,
        simScenario: "normal",
        isSimulating: false
      };
    case "ANALYSIS_SUCCESS":
      return {
        ...state,
        loading: false,
        report: action.report,
        selectedNode: action.report.nodes && action.report.nodes.length > 0 ? action.report.nodes[0] : null,
        messages: [
          ...state.messages,
          {
            sender: "ai",
            text: action.welcomeMessageText,
            time: new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })
          }
        ]
      };
    case "ANALYSIS_FAILURE":
      return {
        ...state,
        loading: false
      };
    case "SET_SELECTED_NODE":
      return {
        ...state,
        selectedNode: action.node
      };
    case "START_STRESS_SIMULATION":
      return {
        ...state,
        isSimulating: true,
        simScenario: action.scenario
      };
    case "FINISH_STRESS_SIMULATION":
      return {
        ...state,
        isSimulating: false,
        simResult: action.simResult
      };
    case "TOGGLE_CHAT":
      return {
        ...state,
        chatOpen: !state.chatOpen
      };
    case "OPEN_CHAT":
      return {
        ...state,
        chatOpen: true
      };
    case "SET_NEW_MESSAGE":
      return {
        ...state,
        newMessage: action.value
      };
    case "SEND_CHAT_MESSAGE":
      return {
        ...state,
        newMessage: "",
        messages: [...state.messages, action.userMsgObj],
        chatLoading: true
      };
    case "CHAT_MESSAGE_SUCCESS":
      return {
        ...state,
        messages: [...state.messages, action.aiMsgObj],
        chatLoading: false
      };
    case "CHAT_MESSAGE_FAILURE":
      return {
        ...state,
        messages: [...state.messages, action.aiErrorMsgObj],
        chatLoading: false
      };
    case "SET_CHAT_LOADING":
      return {
        ...state,
        chatLoading: action.loading
      };
    default:
      return state;
  }
}
