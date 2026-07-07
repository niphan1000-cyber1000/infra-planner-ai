# 🏛️ IT System Architecture & Cloud Strategy Advisor

**ระบบผู้วางแผนและให้คำปรึกษาสถาปัตยกรรมไอทีระดับองค์กร และแบบจำลองสถานการณ์จำลองความเครียดของระบบ (Enterprise IT Architect, Cloud Strategy Advisor & Threat Simulator)**

---

## 🧭 ภาพรวมระบบ (System Overview)
แอปพลิเคชันระบบออกแบบสถาปัตยกรรมไอทีระดับองค์กร (Full-stack Application) ที่ขับเคลื่อนด้วยปัญญาประดิษฐ์จาก **Gemini 3.5-flash** เชื่อมต่อแบบมีเสถียรภาพและปลอดภัยสูง รองรับระบบการจัดการระบบแคชซ้อนแบบสองชั้น (**Dual-layer Caching: Redis + Memory Fallback**) มีระบบแบบจำลองวิเคราะห์คอขวดและจำลองภัยคุกคามทางไซเบอร์แบบเรียลไทม์ (Interactive Threat & Stress Simulator) และแผงควบคุมตรวจสอบสถานะความพร้อมของเซิร์ฟเวอร์ (Server Observability Dashboard)

---

## 📐 ผังความเชื่อมโยงระบบ (Architecture Diagram)

ระบบถูกออกแบบในโครงสร้างแบบ **Full-stack (Express.js + React.js + Vite)** โดยมีรูปแบบทราฟฟิกและการเชื่อมต่อดังนี้:

```
+---------------------------------------------------------------------------------+
|                                 CLIENT LAYER                                    |
|  +---------------------------+       +---------------------------------------+  |
|  |  React Web App (UI)       | <---> |  Stress Simulator (Stress Canvas)     |  |
|  |  - Dashboard Panel        |       |  - Normal, High Load, Cyber Attack    |  |
|  |  - Observability Metrics  |       |  - Latency / Throttling Simulator     |  |
|  +---------------------------+       +---------------------------------------+  |
+---------------------------------------+-----------------------------------------+
                                        |  HTTPS (JSON APIs)
                                        v
+---------------------------------------------------------------------------------+
|                               SERVER & SECURITY LAYER                           |
|  +---------------------------------------------------------------------------+  |
|  |  Express.js Server (Port 3000)                                            |  |
|  |  - Helmet (Security Headers)        - Compression (Gzip Payload)          |  |
|  |  - CORS (Strict Allowed Origins)    - Express Rate Limit (DDoS Protection)|  |
|  |  - Request-ID Correlation           - Global Error Handler Middleware     |  |
|  +-------------------------------------+-------------------------------------+  |
+---------------------------------------+-----------------------------------------+
                                        | 
                                        v
+---------------------------------------------------------------------------------+
|                             BUSINESS & DATA CACHING LAYER                       |
|  +----------------------------------+     +----------------------------------+  |
|  |  Dual-layer Cache Engine         |     |  Google Gemini 3.5-flash LLM     |  |
|  |  - Redis Cache (Primary Node)    |     |  - System Prompts & Guardrails   |  |
|  |  - Local Memory (Failover Node)  | <-> |  - Strict JSON Output Schema     |  |
|  |  - Automatic TTL & Hash Matching |     |  - Prompt Injection Prevention   |  |
|  +----------------------------------+     +----------------------------------+  |
+---------------------------------------------------------------------------------+
```

### 🔄 ลำดับขั้นตอนการประมวลผลคำขอ (Sequence Diagram)

ผังแสดงวงจรการทำงานตั้งแต่ผู้ใช้ส่งความต้องการสถาปัตยกรรม เข้าสู่ด่านความปลอดภัย การตรวจจับ Prompt Injection การดึงข้อมูลจากระบบแคชแบบสองชั้น จนถึงการเชื่อมต่อกับ Google Gemini แบบมีระบบควบคุมเวลาหมดเวลาและการสั่งทำลาย HTTP connection (AbortController API) เมื่อหมดเวลา:

```mermaid
sequenceDiagram
    autonumber
    actor User as Client / Browser UI
    participant App as Express Server (Validation & Security)
    participant Cache as Dual-layer Cache (Redis / Memory)
    participant Gemini as Google Gemini 3.5-flash LLM

    User->>App: POST /api/analyze-architecture (ความต้องการระบบ)
    Note over App: 1. Input Sanitization (Clean HTML/Scripts)<br/>2. Prompt Injection Scanner (Deny-list Match)<br/>3. Zod Payload Validation
    
    rect rgb(20, 24, 33)
        Note over App, Cache: ดำเนินการคำนวณ Cache Key ด้วย SHA-256 จาก Inputs
        App->>Cache: ตรวจค้นข้อมูลสถาปัตยกรรมในแคช (Check cacheKey)
        alt Cache Hit
            Cache-->>App: คืนค่าข้อมูลสถาปัตยกรรมในแคช (Cached JSON)
            App-->>User: 200 OK (cacheStatus: "hit") พร้อมแสดงผลหน้าจอทันที
        else Cache Miss
            Cache-->>App: คืนค่าว่าง (Null)
            Note over App: สร้าง AbortController & ผูกสัญญาณ abortSignal (Timeout 35s)
            App->>Gemini: generateContent({ model, config: { abortSignal } })
            
            alt ประมวลผลเสร็จสิ้นภายในเวลา 35 วินาที
                Gemini-->>App: ส่งกลับข้อมูล JSON ตามรูปแบบ Schema กำหนด
                Note over App: ตรวจเช็คการรั่วไหลคำสั่งหรือคีย์ลับ (Output Validation Leak Check)
                App->>Cache: บันทึกรายงานสถาปัตยกรรมเข้าแคช (TTL = 1 ชั่วโมง)
                App-->>User: 200 OK (cacheStatus: "miss") และวาดระบบไดนามิก
            else ประมวลผลเกินเวลาสูงสุด (Timeout >35s)
                Note over App: สั่งประหาร HTTP request ทันทีด้วย controller.abort() เพื่อประหยัดโควตาเซิร์ฟเวอร์
                App-->>User: 503 Service Unavailable (Timeout หลังวิเคราะห์นานเกินไป)
            end
        end
    end
```

---

## ✨ คุณสมบัติหลัก (Core Features)

1. **AI Enterprise Architecture Architect**: วิเคราะห์และออกแบบพิมพ์เขียวระบบโครงสร้าง (System Blueprint) สอดรับกับความต้องการทางธุรกิจ โดยแสดงผลโครงสร้างเครือข่ายและการจัดเตรียมทรัพยากร (Cloud & On-premise Nodes)
2. **Advanced Threat & Stress Simulation**: จำลองสถานการณ์เมื่อเซิร์ฟเวอร์และเครือข่ายอยู่ภายใต้สภาวะปกติ (Normal), โหลดข้อมูลสูง (High Load), และถูกเจาะระบบเชิงรุก (Cyber Attack) เพื่อทดสอบกลไกป้องกัน
3. **Dual-layer Caching System**: ระบบแคชสองชั้นประสิทธิภาพสูง หากมีคำขอสถาปัตยกรรมซ้ำ ระบบจะดึงข้อมูลผ่าน Redis ทันทีเพื่อความเร็วสูงสุด และสลับไปหน่วยความจำหลัก (Local Memory Cache) อัตโนมัติเมื่อ Redis ไม่ว่าง
4. **Robust Input Security & Guardrails**: ขจัดพฤทีพฤติกรรมแฝงตัวควบคุมระบบ (Prompt Injection Protection) ด้วยกลไก **Instruction Isolation (หุ้มบล็อกคำสั่งผู้ใช้)** และระบบ **Deny List Regex Scanner** ในด่านมิดเดิลแวร์
5. **Observability Console**: แดชบอร์ดมอนิเตอร์สถานะการทำงานของ Node, ค่าความพร้อมใช้งาน (Uptime), ข้อมูลหน่วยความจำเซิร์ฟเวอร์ (RSS Memory) และปุ่มสั่งการล้างแคชระบบแบบเรียลไทม์ (Flush Cache Tool)

---

## 🛠️ ตัวอย่างการใช้งาน API (API Examples)

ระบบจัดพิมพ์สเปก API เป็นมาตรฐานด้วย **Swagger UI** เข้าถึงได้ผ่านหน้าเว็บ `/docs` โดยสรุปรายละเอียดและตัวอย่าง APIs สำคัญได้ดังนี้:

### 📋 ตารางสรุปข้อมูล API Endpoints

| เส้นทางเชื่อมต่อ (Endpoint) | เมธอด (Method) | การรับรองสิทธิ์ (Auth) | รหัสสถานะสำเร็จ | รหัสสถานะข้อผิดพลาดที่ระบุ (HTTP Error Codes) | คำอธิบายการทำงาน (Description) |
| :--- | :---: | :---: | :---: | :---: | :--- |
| `/api/analyze-architecture` | `POST` | ไม่มี | `200` | `400`, `429`, `503`, `500` | รับข้อมูลธุรกิจไปวิเคราะห์ สรุปสถาปัตยกรรม และสร้างแผนผังระบบไอที |
| `/api/chat-advisor` | `POST` | ไม่มี | `200` | `400`, `429`, `503`, `500` | แชทตอบคำถามทางวิศวกรรมสลับต่อเนื่อง (Contextual Chat) ร่วมกับ AI Architect |
| `/api/health` | `GET` | ไม่มี | `200` | `500` | คืนสถานะการทำงานระบบ ตรวจค่าหน่วยความจำสถิติ และรายงานสถานะเซิร์ฟเวอร์แคช |
| `/api/clear-cache` | `POST` | Bearer Token (Dynamic) | `200` | `401`, `403`, `500` | สั่งล้างระบบจัดเก็บแคชของหน่วยความจำเซิร์ฟเวอร์แบบแมนนวลทันที |

### 1. วิเคราะห์และวางสถาปัตยกรรมระบบ (`POST /api/analyze-architecture`)

* **Request Body:**
  ```json
  {
    "businessType": "สถาบันการเงินการธนาคารและการชำระเงินดิจิทัล",
    "userLoad": "1000000",
    "budget": "high",
    "infrastructureType": "hybrid",
    "compliance": ["PCI-DSS", "PDPA"],
    "itGoal": "มุ่งเน้นการตอบสนองทันใจเสถียรภาพสูงและป้องกันภัยคุกคาม"
  }
  ```
* **Response Body (JSON):**
  ```json
  {
    "architectureStyle": "Microservices Hybrid Architecture",
    "summary": "สถาปัตยกรรมระดับองค์กรรองรับธุรกรรมปริมาณมาก มีการจัดการความปลอดภัยและสำรองข้อมูลเข้มข้น...",
    "nodes": [
      { "id": "ingress", "label": "Cloud Armor & WAF", "type": "public-cloud" },
      { "id": "core-banking", "label": "Private Core Banking App", "type": "on-premise" }
    ],
    "links": [
      { "source": "ingress", "target": "core-banking", "label": "Secure IPSec VPN Tunnel" }
    ],
    "complianceCheckList": [
      { "name": "PCI-DSS", "status": "Compliant", "recommendation": "เข้ารหัสฐานข้อมูลการชำระเงินระดับแผ่นบันทึก" }
    ],
    "cacheStatus": "miss",
    "cacheKey": "arch:6c6f7ca1108b6..."
  }
  ```

---

### 2. แชทปรึกษาต่อยอดสถาปัตยกรรม (`POST /api/chat-advisor`)

* **Request Body:**
  ```json
  {
    "newMessage": "รบกวนแนะนำการจัดการคอขวดที่ฐานข้อมูลหลักเมื่อโดน DDoS",
    "messages": [
      { "sender": "user", "text": "วิเคราะห์ระบบธนาคารดิจิทัล..." },
      { "sender": "ai", "text": "แนะนำการใช้ Hybrid Cloud ร่วมกับ..." }
    ]
  }
  ```
* **Response Body:**
  ```json
  {
    "reply": "ในการป้องกันและบรรเทาปัญหาคอขวดที่ฐานข้อมูลเมื่อโดน DDoS ขอแนะนำดังนี้:\n1. ตั้งค่าระบบ Read-Replicas แยกสำหรับการสืบค้นข้อมูล...\n2. ติดตั้ง Rate Limiting ที่ฝั่ง Ingress ประตูเข้าออกบริการ...",
    "cacheStatus": "miss"
  }
  ```

---

### 3. ตรวจเช็คสถานะระบบและแคชแดชบอร์ด (`GET /api/health`)

* **Response Body:**
  ```json
  {
    "status": "ok",
    "time": "2026-07-06T02:04:57.693Z",
    "uptime_formatted": "0h 15m 32s",
    "version": "1.0.0",
    "gemini_status": "connected",
    "cache": {
      "redis": { "connected": false, "host": "none" },
      "memory": { "entriesCount": 4 },
      "stats": {
        "totalHits": 12,
        "redisHits": 0,
        "memoryHits": 12,
        "totalMisses": 3,
        "hitRatio": "0.8000"
      }
    }
  }
  ```

---

## ⚡ การเปรียบเทียบประสิทธิภาพ (Performance Benchmark)

แอปพลิเคชันได้รับการวัดค่าความหน่วงและประสิทธิภาพในการให้บริการเพื่อนำมาใช้อ้างอิงสำหรับการปรับปรุงสเกลระดับอุตสาหกรรม:

* **การดึงข้อมูลจากแคชระบบด่วน (Cache Hit - Redis / InMemory)**: `~1 - 3 ms`
  * ความคุ้มค่า: ประหยัดแบนด์วิดท์เซิร์ฟเวอร์ ป้องกันปัญหารันโควตา API ทะลุขีดจำกัดสูงสุด และรองรับปริมาณคำขอแบบพร้อมกัน (Concurrency) ได้นับหมื่นรายการต่อวินาที
* **การคำนวณและวิเคราะห์รายงานใหม่ผ่าน AI (Cache Miss - Google Gemini Call)**: `~3,500 - 7,500 ms`
  * ความคุ้มค่า: ประมวลผลผ่านโมเดล Gemini 3.5-flash เพื่อประเมินเชิงสถาปัตยกรรมและการสร้างโครงสร้างสัญกรณ์เครือข่ายตามหัวข้อจริง
* **เวลาหมดเวลาป้องกันระบบค้าง (Max Service Timeout Gate)**: ตั้งค่าตัดจังหวะการทำงานในระดับ API อยู่ที่ `30 วินาที` สำหรับระบบแชท และ `35 วินาที` สำหรับหน้าวิเคราะห์ เพื่อไม่ให้มีประวัติ Thread สะสมในคลาวด์คอนเทนเนอร์

---

## ⚙️ การตั้งค่าตัวแปรสภาพแวดล้อม (Environment Variables)

คัดลอกไฟล์ต้นแบบ `.env.example` ไปตั้งค่าในชื่อ `.env` หรือปรับผ่านแผงการตั้งค่า Secrets บนแพลตฟอร์มคลาวด์:

```env
# พอร์ตบริการที่แอปพลิเคชันหลักทำงาน (บังคับใช้ 3000 สำหรับระบบ Cloud Run Nginx Proxy)
PORT=3000

# โหมดการทำงานระบบเซิร์ฟเวอร์ ("development" หรือ "production")
NODE_ENV="production"

# คีย์รับรองตัวตนสำหรับเรียกใช้โมเดล Google Gemini API (ห้ามแชร์เป็นแบบสาธารณะ)
GEMINI_API_KEY="AIzaSy..."

# ที่อยู่การเชื่อมต่อเซิร์ฟเวอร์แคชระบบฐานข้อมูล Redis (หากว่างระบบจะสลับใช้หน่วยความจำหลักแทนอัตโนมัติ)
REDIS_URL="redis://default:password@my-redis-instance:6379"

# รายการอนุญาตสิทธิ์เข้าถึงต่างโดเมนสําหรับความปลอดภัย CORS ในระดับโปรดักชัน (คั่นด้วยสัญลักษณ์จุลภาค)
ALLOWED_ORIGINS="https://ais-dev-x2lwrp2gebk7j4b2s2umf5-886681242964.asia-east1.run.app,https://ais-pre-x2lwrp2gebk7j4b2s2umf5-886681242964.asia-east1.run.app"
```

---

## 📸 รายละเอียดอินเตอร์เฟสและ UI (UI Design & Aesthetics)

แอปพลิเคชันขับเคลื่อนภายใต้คอนเซปต์ **Slate Obsidian Dark & Cyberpunk-tint Theme** เพื่อการรักษาสายตาและเพิ่มความรู้สึกน่าเชื่อถือในงานวิศวกรรมระบบ:
* **Interactive Architecture Node Map**: หน้าแผงควบคุมหลักที่วาดแผนผังระบบอย่างไดนามิก เชื่อมโยงอุปกรณ์ด้วยเส้นอนิเมชัน สลับสีตามประเภททรัพยากร (Public Cloud vs On-Premise)
* **Real-time Live Simulator Stage**: สังเกตการจำลองสภาวะแวดล้อมระบบพร้อมกราฟคลื่นแสดงค่า Latency และ System Load ที่วูบวาบแบบเสมือนจริงตามสถานการณ์ภัยพิบัติไซเบอร์
* **Observability HUD Side-Panel**: แถบด้านข้างระบุข้อมูล Uptime เซิร์ฟเวอร์และอัตราการ Cache Hit เป็นเปอร์เซ็นต์ พร้อมเครื่องมือล้างข้อมูลหน่วยความจำที่ทำงานทันใจ

---

## 🚀 คู่มือการทดสอบและการติดตั้งระบบ (Test & Deployment Guide)

### 🛡️ ระบบการตรวจจับข้อมูลลับและการสแกนช่องโหว่ความปลอดภัย (Security & Compliance CI)
เพื่อความมั่นคงปลอดภัยระดับองค์กรและความสอดคล้องตามมาตรฐาน (Compliance) เราได้บูรณาการระบบตรวจจับและป้องกันช่องโหว่ในระบบ CI/CD Pipeline:
* **GitHub Actions (Gitleaks Integration)**: ในทุกๆ การส่งข้อมูลขึ้นคลาวด์ (Push/Pull Request) ระบบจะเรียกใช้ **Gitleaks Action** เพื่อทำการสแกนประวัติการคอมมิตทั้งหมดโดยอัตโนมัติ หากตรวจพบ Secret หลุด ระบบ CI จะขัดขวางและแจ้งเตือนทันที
* **การสแกนช่องโหว่ของ Dependencies (npm audit)**: เราได้เพิ่มกระบวนการตรวจจับช่องโหว่ความปลอดภัยของแพ็กเกจภายนอก (Third-party Packages) ในสเตจวิเคราะห์งาน เพื่อความมั่นใจว่าระบบจะไม่ใช้ไลบรารีที่มีช่องโหว่ระดับสูงขึ้นไปบน Production:
  ```bash
  npm audit --production --audit-level=high
  ```
* **คำแนะนำในการพัฒนา**: แนะนำให้ทีมพัฒนาติดตั้ง [Gitleaks CLI](https://github.com/gitleaks/gitleaks) เพื่อทำ Local Scanning หรือตั้งค่า git pre-commit hook เพื่อสแกนความปลอดภัยก่อนทำการคอมมิตจริง:
  ```bash
  gitleaks detect --verbose
  ```

### 🧪 การรันชุดทดสอบ (Unit Tests Execution)
เราใช้เฟรมเวิร์ก **Vitest** สำหรับรันระบบทดสอบเพื่อความรวดเร็วและความปลอดภัยสูงสุด:
```bash
# ตรวจสอบการลินเตอร์ซินแทกซ์ (Linting Rules)
npm run lint

# รันชุดทดสอบความถูกต้องของมิดเดิลแวร์ความมั่นคงปลอดภัยและแคช
npm run test
```

### 📦 วิธีการคอมไพล์และเปิดเซิร์ฟเวอร์แบบ Full-stack
แอปพลิเคชันจะทำการรวมไฟล์และเปลี่ยนชนิด TypeScript บน Node.js ออกมาเป็นคอมไพล์เลอร์ไฟล์แบบเบ็ดเสร็จ (`dist/server.cjs`) ผ่าน esbuild:
```bash
# ทำการบิลด์ UI และ Server เป็น Production Ready 
npm run build

# สตาร์ทเพื่อให้บริการเซิร์ฟเวอร์หลัก 
npm run start
```

### ☁️ การติดตั้งผ่าน Docker & Containerization (Docker Deployment)
แอปพลิเคชันได้รับการจัดเตรียมคอนฟิกการทำงานร่วมกับ Docker แบบเต็มรูปแบบเพื่อรองรับสถาปัตยกรรมคลาวด์และการรันในสภาพแวดล้อมที่จำกัด (Containerized Environments):

#### 1. การคอมไพล์เดี่ยวผ่าน Dockerfile (Standalone Image Build)
เราออกแบบ **Dockerfile** ในรูปแบบ Multi-stage เพื่อแยกขั้นตอนการบิลด์ (Build stage) ออกจากการรันระบบจริง (Runner stage) ช่วยประหยัดพื้นที่และจำกัดข้อมูลลับไม่ให้หลุดออกไปในไฟล์ Image:
```bash
# สั่งสร้าง Docker Image
docker build -t it-architect-advisor:latest .

# เริ่มรันคอนเทนเนอร์ (ต้องระบุตัวแปรคีย์ประจุไฟฟ้าความก้าวหน้า)
docker run -d \
  -p 3000:3000 \
  -e GEMINI_API_KEY="คีย์_GEMINI_ของคุณ" \
  -e NODE_ENV="production" \
  --name architect-advisor \
  it-architect-advisor:latest
```

#### 2. การรันระบบคู่เต็มรูปแบบผ่าน Docker Compose (Full Stack Orchestration)
ระบบรองรับการรันคู่กับ Redis Cache ทันทีโดยใช้ Docker Compose:
```bash
# คัดลอกค่า Environment ตัวอย่างมาไว้ที่เครื่องจริง
cp .env.example .env

# ใส่คีย์วิเคราะห์ลงใน .env
# GEMINI_API_KEY=AIzaSy...

# สั่งให้ Docker Compose ทำงานประสานกันในแบบ Background (Daemon)
docker compose up -d

# ปิดบริการและเคลียร์ทรัพยากรทั้งหมด
docker compose down
```

---

## 🔍 คำแนะนำการแก้ไขปัญหา (Troubleshooting & FAQs)

แอปพลิเคชันประกอบด้วยตารางแผงการดักจับข้อผิดพลาด (Robust Error Codes Mapping) เพื่อช่วยจำแนกอาการต่างๆ ได้รวดเร็ว:

* **อาการ: ระบบแสดงหน้าต่างข้อผิดพลาด "ตรวจพบความเสี่ยงความปลอดภัยสูงสุด (Prompt Injection Detected)"**
  * **สาเหตุ:** ข้อมูลนำเข้าจากช่องกรอกข้อความ (เช่น ประเภทธุรกิจ, ข้อความสอบถาม, แชท) ตรงกับรูปแบบ Deny List ป้องกันคำสั่ง Bypass เช่นคำว่า "Ignore previous instructions", "Reveal system instructions" หรือพยายามสั่งให้ AI เปลี่ยนสวมบทบาทแฮกเกอร์
  * **วิธีแก้ไข:** หลีกเลี่ยงการพิมพ์ประโยคเชิงควบคุม หรือคำคั่นระบบ ให้กรอกเฉพาะข้อมูลดิบด้านเทคนิคหรือความต้องการทั่วไป

* **อาการ: ตอบรหัสสถานะ `HTTP 503 (Service Timeout / Unavailable)`**
  * **สาเหตุ:** ตัววิเคราะห์โมเดลของกูเกิลตอบกลับล่าช้ากว่าที่ควบคุมไว้ (30 หรือ 35 วินาที) ทำให้โครงข่าย AbortController สั่งยกเลิก Request นั้นทันที เพื่อประหยัด CPU/Quota
  * **วิธีแก้ไข:** ระบบจะคืนค่าอย่างปลอดภัย ให้ทำการกดยื่นความจำนง (Submit) เพื่อขอวิเคราะห์ใหม่อีกครั้งเพื่อความต่อเนื่อง

* **อาการ: หน้าเว็บค้าง แจ้งเตือน "Please wait while your application starts..." หรือขึ้น `HTTP 401 Unauthorized` เสมอ**
  * **สาเหตุ:** ตัวแปรสภาพแวดล้อม `GEMINI_API_KEY` ไม่ถูกกำหนด หรือค่าไม่ถูกต้อง (ไม่ผ่าน Zod และด่านสิทธิ์ API)
  * **วิธีแก้ไข:** ตรวจสอบไฟล์ `.env` คีย์ต้องได้รับความเห็นชอบตามมาตรฐานของ Google Cloud และเปิดสิทธิ์โมเดลใช้งานอย่างถูกต้อง

* **อาการ: คอนโซลเบราว์เซอร์แจ้งข้อผิดพลาด `Not allowed by CORS`**
  * **สาเหตุ:** การตั้งค่า `NODE_ENV=production` แต่ออริจินัลโดเมนที่ร้องขอไม่ตรงกับค่าที่ระบบจดจำใน `ALLOWED_ORIGINS`
  * **วิธีแก้ไข:** เพิ่มโดเมนของคุณเข้าไปในค่าคอนฟิกตัวแปรสภาพแวดล้อม `ALLOWED_ORIGINS` เช่น `ALLOWED_ORIGINS="https://my-app-domain.com"` แล้วทำการรีสตาร์ทแอปพลิเคชัน

* **อาการ: ระบบแสดงสถานะ "Memory Cache" ตลอดเวลาแทนที่จะเป็น "Redis Cluster"**
  * **สาเหตุ:** ระบบไม่พบการเชื่อมต่อของเซิร์ฟเวอร์ Redis จากลิงก์คีย์ `REDIS_URL` หรือสิทธิ์การเข้าถึงภายนอกถูกบล็อก
  * **วิธีแก้ไข:** ตัวระบบออกแบบระบบตัดสิทธิ์มาใช้ Memory แทนโดยอัตโนมัติ (Fallback) คุณสามารถใช้งานตัวเซิร์ฟเวอร์เพื่อรองรับการรับบริการงานได้อย่างราบรื่นโดยไม่ล่ม

---

## 📋 บันทึกการปล่อยรุ่น (Release Notes)

### รุ่น v1.2.0 (รุ่นปัจจุบัน)
* ✨ **Real Connection Cancellation (AbortController Integration)**: ยกเครื่องระเบียบการจัดสรรเวลาการประมวลผลด่วน โดยยกเลิกการใช้ `Promise.race()` แบบเดิมที่หลงเหลือ Connection ในท่อเบื้องหลัง ปรับมาใช้ `AbortController API` ส่งผ่าน `abortSignal` ไปยัง Gemini API SDK จริง เพื่อประหาร Request ทันทีที่ Timeout ป้องกันการสะสมแบนด์วิดท์เซิร์ฟเวอร์และรักษาความปลอดภัยสูงสุดของ Quota เกินความจำเป็น
* 🛡️ **Robust Prompt Injection Protection**:
  * **Instruction Isolation**: การห่อหุ้มอินพุตดิบจากผู้ใช้ด้วย Tag ตัวคั่นขอบเขตชัดเจน `[USER_PROVIDED_DATA_START]` และ `[USER_PROVIDED_DATA_END]` บนฝั่ง System Prompts เพื่อป้องกันโมเดลสับสนคำสั่งผู้ใช้กับคำสั่งสั่งการหลักของระบบ
  * **Deny List Pre-scan**: บูรณาการเครื่องสแกนประโยคแฝงเพื่อตรวจจับการลวงล่อตั้งแต่ด่านขาเข้า (Input Sanitize Layer) เพื่อตีกลับการทำร้ายระบบทันที
  * **Output Validation Check**: ดักจับกรณีโมเดลพยายามพ่นรหัส API Key, โครงสร้างโค้ด หรือเงื่อนไขข้อบังคับภายในของระบบออกมาโดยไม่ได้ตั้งใจ เพื่อบล็อกการรั่วไหลอย่างเด็ดขาด
* ⚙️ **Dynamic Error Response Schema**: ปรับรุง Controller ให้วิเคราะห์ข้อผิดพลาดออกมาเป็น API รหัสสถานะ HTTP ที่ถูกต้อง (เช่น 400 สำหรับข้อมูลเข้าไม่ดี, 401 สิทธิ์ล้มเหลว, 429 สำหรับโควตาเต็มชั่วคราว, 503 สัญญาณบริการหมดเวลา) ช่วยเพิ่มความยืดหยุ่นในการเขียนคำเตือนตอบกลับของฝั่ง Front-end อย่างเหมาะสม

### รุ่น v1.1.0
* 🔄 **Dual-layer Dynamic Caching**: เปิดตัวกลไกแคชสองชั้นประสานกำลังระหว่าง Redis และ In-Memory คลายปัญหาคอขวดและเพิ่มความเร็วขีดสุดในการตอบคำขอซ้ำ
* 📊 **Server Observability**: เพิ่มหน้าแผงวงจร Uptime, Memory RSS และปุ่ม Flush Memory แบบสัมผัส

### รุ่น v1.0.0
* 🚀 **Enterprise IT Planner Foundation**: เริ่มต้นสถาปัตยกรรมวางโครงข่ายคลาวด์ แผนภาพกราฟความสัมพันธ์จำลองเครือข่าย แผงควบคุม Stress Simulator จำลองภัยคุกคาม Cyber Attack

---

## 📜 ใบอนุญาตสิทธิ์การใช้งาน (Open Source License)

โครงการนี้อยู่ภายใต้สัญญาอนุญาตสิทธิ์ระดับสากลแบบเปิดเผยซอร์สโค้ด **MIT License** ท่านสามารถนำไปคัดลอก ดัดแปลง แจกจ่าย หรือใช้งานในเชิงพาณิชย์ได้อย่างเป็นอิสระ โดยอ่านรายละเอียดข้อตกลงฉบับเต็มได้ที่ไฟล์ [LICENSE](./LICENSE)
