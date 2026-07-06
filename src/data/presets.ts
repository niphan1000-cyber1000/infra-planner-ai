import { ArchitectureRequirements } from "../types";

export interface Preset {
  name: string;
  description: string;
  data: ArchitectureRequirements;
}

export const PRESETS: Preset[] = [
  {
    name: "🚀 ระบบ E-Commerce พันล้าน (High Load)",
    description: "รองรับผู้ใช้ 100k+ คนพร้อมกัน, ตะกร้าสินค้า, Flash Sale, ป้องกันสแปมและ DDoS",
    data: {
      businessType: "E-Commerce (ระบบจำหน่ายสินค้าและชำระเงินออนไลน์)",
      userVolume: "high",
      compliance: ["PCI-DSS", "PDPA"],
      budget: "balanced",
      cloudPreference: "hybrid",
      existingTech: "On-Premises ERP (SAP) และระบบสต็อกเดิม",
      extraDescription: "ต้องการระบบที่ขยายตัวอัตโนมัติ (Auto-scaling) และรองรับการทำ Flash Sale เพื่อไม่ให้ระบบล่ม และ sync ข้อมูลกลับมายังระบบ ERP ขององค์กรแบบ Real-time",
      itGoal: "modernize",
      riskFocus: "strict"
    }
  },
  {
    name: "🏥 ระบบ Telemedicine โรงพยาบาล (PDPA & HIPAA)",
    description: "เน้นรักษาความปลอดภัยข้อมูลผู้ป่วย, ถ่ายทอดสดวิดีโอคอล, รองรับการขยายตัวในอนาคต",
    data: {
      businessType: "Healthcare & Video Consultation (บริการแพทย์ทางไกล)",
      userVolume: "medium",
      compliance: ["PDPA", "HIPAA"],
      budget: "balanced",
      cloudPreference: "aws",
      existingTech: "Legacy Patient Record System (SQL Server) ในโรงพยาบาล",
      extraDescription: "ต้องการการเข้ารหัสข้อมูลที่เข้มงวดทั้งตอนจัดเก็บ (At Rest) และตอนส่งข้อมูล (In Transit) พร้อมทั้งการบันทึก Log การเข้าถึงข้อมูลเพื่อความโปร่งใส",
      itGoal: "security",
      riskFocus: "strict"
    }
  },
  {
    name: "🏦 Core Banking & Microservices (ความมั่นคงสูง)",
    description: "เน้นระบบกระจายศูนย์ (Distributed), Zero-trust, ตรวจจับการทุจริต, ระบบ Hybrid Cloud",
    data: {
      businessType: "Fintech & Core Banking Platform",
      userVolume: "high",
      compliance: ["PCI-DSS", "PDPA"],
      budget: "unlimited",
      cloudPreference: "hybrid",
      existingTech: "Legacy Mainframe และฐานข้อมูล Oracle On-Premises",
      extraDescription: "สถาปัตยกรรมที่สามารถทำงานทดแทนกันได้ทันที (Active-Active Multi-Region) ข้อมูลต้องถูกต้อง 100% ห้ามมีข้อมูลสูญหายเด็ดขาด (Zero Data Loss)",
      itGoal: "security",
      riskFocus: "zero_trust"
    }
  },
  {
    name: "📡 IoT Smart City Sensor Network (Big Data)",
    description: "สตรีมข้อมูลความละเอียดสูงจากอุปกรณ์แสนตัว, คัดกรองข้อมูลล่าช้าต่ำ, คลาวด์วิเคราะห์ผล",
    data: {
      businessType: "IoT & Smart Energy Monitoring",
      userVolume: "extreme",
      compliance: ["GDPR"],
      budget: "low",
      cloudPreference: "gcp",
      existingTech: "ไม่มีระบบเดิม (Greenfield)",
      extraDescription: "เน้นการรับส่งข้อมูลแบบ Event-Driven ด้วย Kafka และการวิเคราะห์ผลทันทีด้วยเทคโนโลยี Serverless เพื่อประหยัดต้นทุนในเวลาที่ไม่มีข้อมูลส่งเข้ามา",
      itGoal: "greenfield",
      riskFocus: "standard"
    }
  }
];
