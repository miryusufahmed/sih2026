# Maha-Udyog Mitra — SIH26130 Prototype

Single-window digital fast-track system for industrial approvals, compliance,
and automated subsidy matching. Built for Smart India Hackathon 2026,
Problem Statement **SIH26130** (Sponsor: Government of Maharashtra).

## Stack

- **Frontend:** React 18 + Vite, Tailwind CSS, Lucide React icons, a small
  local shadcn-style UI kit (`src/components/ui`) so the demo runs with zero
  external UI dependencies or CLI generation step.
- **Mock backend:** Two interchangeable layers —
  1. `src/context/AppContext.jsx` — in-memory React state, used by default so
     the frontend runs completely standalone.
  2. `server/` — an optional modular Express service with the **same shape**
     of endpoints, so you can point the frontend at a real API without
     touching any component.

## Quick start (frontend only — recommended for the demo)

```bash
cd sih26130-app
npm install
npm run dev
```

Open the printed local URL. Toggle **English / मराठी** and **Entrepreneur /
Government Officer** from the top bar to demo both sides of the workflow.

## Optional: run the mock Express API

```bash
cd sih26130-app/server
npm install
npm start
# → http://localhost:4000
```

Endpoints:

| Method | Path                                | Purpose |
|--------|--------------------------------------|---------|
| GET    | `/api/applications`                  | List all applications (officer queue) |
| GET    | `/api/applications/:id`              | Fetch one application |
| POST   | `/api/applications`                  | Submit the Unified Application Form |
| PATCH  | `/api/applications/:id/department`   | Update one department's clearance status |
| PATCH  | `/api/applications/:id/decision`     | Officer approve / reject-with-reason |
| POST   | `/api/schemes/match`                 | Run the subsidy matching engine |
| POST   | `/api/ocr/extract`                   | Simulated OCR document extraction |

To wire the frontend to this API instead of local state, replace the body of
the mutator functions in `AppContext.jsx` with `fetch` calls to these routes —
the component tree does not need to change.

## Folder structure

```
src/
  context/AppContext.jsx      Global state: language, role, applications
  i18n/translations.js        English + Marathi copy, keyed by feature
  data/schemes.js             Maharashtra scheme rules + matching engine
  data/mockData.js            Seed applications + mock OCR result
  components/ui/              Local shadcn-style primitives (Button, Card…)
  components/layout/          Sidebar, Topbar, DashboardLayout
  components/entrepreneur/    Module 1 & 2: form, tracker, subsidy matcher
  components/officer/         Module 3: queue table, detail drawer
  pages/                      Route-level composition per role
server/
  index.js                    Express entrypoint
  routes/                     applications.js · schemes.js · ocr.js
  services/schemeEngine.js    Server-side mirror of the matching logic
  data/store.js                In-memory store (swap for a real DB client)
```

## Design notes for the jury

- **Single form, four departments:** submitting the Unified Application Form
  fans out to Fire Safety, Pollution Control (MPCB), Land Revenue, and MSME
  Directorate simultaneously — visualised live in the vertical Approval
  Tracker, not as four separate portals.
- **OCR autofill** on the document upload step simulates a document-AI call
  (see `server/routes/ocr.js` for the production-shaped version) so the
  applicant never retypes PAN/GST details already on their certificate.
- **Subsidy engine** encodes real policy structure — zone classification
  (A/B/C/D/D+) drives PSI 2019 slabs, IT gets its own policy track, CMEGP
  applies below the ₹5 Cr threshold, and backward districts stack a regional
  equity package — rather than a flat lookup table.
- **Officer decisions are terminal and traceable:** approve/reject-with-reason
  updates the same `timeline` object the entrepreneur sees, so both roles are
  always looking at one shared source of truth.
