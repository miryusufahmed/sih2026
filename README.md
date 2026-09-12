# Udyam Setu (उद्यम सेतू)
### Single-Window Digital Fast-Track System for Industrial Clearances & Subsidies
**Smart India Hackathon 2026 — Problem Statement SIH26130**  
*Sponsored by: Government of Maharashtra · Directorate of Industries*

---

## 🌟 Overview

**Udyam Setu** (**उद्यम सेतू**) is an enterprise-grade digital single-window portal designed to eliminate bureaucracy, redundant paperwork, and departmental silos for entrepreneurs setting up industrial units in Maharashtra. 

Instead of filing separate applications across multiple department portals, an entrepreneur submits **one unified application** that simultaneously fans out to all required nodal departments:
1. **Directorate of Fire Services (Fire Safety Clearance / NOC)**
2. **Maharashtra Pollution Control Board (MPCB Consent to Establish / Operate)**
3. **Revenue & Forest Department (7/12 Land Records, NA Conversion & MIDC Clearances)**
4. **Directorate of Industries (MSME Incentives, Registration & Approval)**

---

## 🚀 Key Features

### 1. Unified Industrial Application Intake
- Multi-step guided application flow with strict format validation for Indian Income Tax **PAN** (`[A-Z]{5}[0-9]{4}[A-Z]{1}`) and **GSTIN** (`27...`).
- Automated document completeness enforcement: blocks incomplete submissions and requires mandatory PAN & GST certificates before routing to officers.

### 2. Google Gemini Vision AI OCR
- Document intelligence powered by Google's **Gemini Multimodal Vision API** (`gemini-3.1-flash-lite` / `gemini-3.5-flash-lite`).
- Automatically scans uploaded PAN cards and GST certificates to extract Company Name, Proprietor Name, PAN, and GSTIN without manual data entry.
- **In-Memory SHA-256 Document Caching & Throttling Guard**: Prevents unnecessary quota usage and respects free-tier rate limits (15 RPM / 500 RPD).
- Graceful offline fallback to simulated extraction if no API key is provided.

### 3. Real-Time Multi-Department Approval Tracker
- Vertical visual pipeline showing the live status of all 4 regulatory bodies.
- **Interactive Action Required Resolution**: When a department flags an issue (e.g. Land Revenue requesting a clearer 7/12 extract), the entrepreneur can upload the requested document directly from the tracker to automatically transition the status back to *Under Scrutiny*.

### 4. Dynamic Subsidy Matching Engine (110+ Maharashtra Schemes)
- Encodes state industrial policies including **PSI 2019 (Package Scheme of Incentives)**, **Maharashtra IT/ITES Policy 2023**, **CMEGP (Chief Minister's Employment Generation Programme)**, and the **Vidarbha & Marathwada Accelerated Development Package**.
- Dynamically classifies industrial zones (A, B, C, D, D+), scale (Micro, Small, Medium, Large), and backward district incentives to compute estimated capital subsidies, power tariff subsidies, stamp duty exemptions, and interest subventions.
- Database contains **110+ pre-seeded official Maharashtra state schemes** across manufacturing, EV, agriculture, IT, textiles, and green energy.

### 5. Nodal Officer Management Queue
- Searchable administrative dashboard with status filters.
- Document inspection panel with built-in viewer for submitted PDF evidence (digitally stamped and formatted).
- Terminal decision workflow (Approve or Reject with mandatory audit justification remark).

### 6. Bilingual Support
- Instant toggle between **English** and **मराठी (Marathi)** with localization for all forms, departmental workflows, and labels.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons, Custom UI components |
| **Backend API** | Node.js, Express 4, Multer (multipart uploads) |
| **Database** | SQLite 3 (`better-sqlite3`), auto-seeding engine |
| **AI / OCR** | Google Gemini Vision API (`gemini-3.1-flash-lite`, REST) |
| **Deployment** | Render Web Service (`render.yaml`), unified SPA serving |

---

## 📦 Quick Start (Local Setup)

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### 1. Clone the repository
```bash
git clone https://github.com/miryusufahmed/sih2026.git
cd sih2026
```

### 2. Install dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server && npm install && cd ..
```

### 3. Run the application
You can run both tiers concurrently or use the Express backend to serve everything:

```bash
# Option A: Start backend API & static frontend server
cd server
npm start
# Server starts at http://localhost:4000 (serving API and pre-built frontend)
```

```bash
# Option B: Run Vite development server with hot-reloading
npm run dev
# Vite runs at http://localhost:5173 (proxies /api and /uploads to port 4000)
```

---

## ☁️ Deployment (Render Cloud)

The repository is configured for zero-configuration, single-service deployment on **Render's Free Tier**:

1. Log in to [Render](https://render.com).
2. Click **New +** &rarr; **Blueprint**.
3. Select your repository: `miryusufahmed/sih2026`.
4. Render will read [`render.yaml`](./render.yaml), run the build:
   ```bash
   npm install --include=dev && npm run build && cd server && npm install
   ```
   and start the service with:
   ```bash
   cd server && node index.js
   ```
5. *(Optional)* Add `GEMINI_API_KEY` under the Web Service **Environment** tab to activate real-time Gemini AI document parsing.

---

## 📁 Repository Structure

```
├── index.html                   # HTML entry point with Udyam Setu branding
├── package.json                 # Frontend dependencies and Vite build scripts
├── render.yaml                  # Infrastructure-as-code configuration for Render
├── vite.config.js               # Vite bundler & local dev proxy configuration
├── src/
│   ├── components/
│   │   ├── entrepreneur/        # Intake form, approval tracker, subsidy matcher
│   │   ├── officer/             # Officer queue, review drawer, decision controls
│   │   ├── layout/              # Sidebar, topbar, role switcher
│   │   └── ui/                  # Accessible UI primitives (Button, Card, Badge, etc.)
│   ├── context/AppContext.jsx   # Global state, API integration, role management
│   ├── data/                    # Mock applications and scheme definitions
│   ├── i18n/translations.js     # English & Marathi localization dictionary
│   └── lib/pdfHelper.js         # Client-side valid PDF binary generator
└── server/
    ├── index.js                 # Express server & static asset handler
    ├── middleware/upload.js     # Multer file upload configuration
    ├── routes/
    │   ├── applications.js      # Application intake, updates, and document attachments
    │   ├── schemes.js           # Scheme queries and matching calculations
    │   └── ocr.js               # Rate-limit optimized Gemini Vision OCR engine
    ├── data/
    │   ├── store.js             # SQLite database layer (mitra.db)
    │   ├── schemes.json         # 110+ comprehensive Maharashtra schemes
    │   └── applications.json    # 60 pre-seeded mock cases across districts
    └── utils/pdfGenerator.js    # Conforming PDF-1.4 official document generator
```

---

## 📜 License & Acknowledgements

Developed for **Smart India Hackathon 2026** (Problem Statement SIH26130).  
Dedicated to empowering entrepreneurs across Maharashtra through transparent, accountable, and paperless industrial governance.
