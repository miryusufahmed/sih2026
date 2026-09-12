import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import applicationsRouter from './routes/applications.js';
import schemesRouter from './routes/schemes.js';
import ocrRouter from './routes/ocr.js';
import { upload, uploadsDir } from './middleware/upload.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { generateValidPdf } from './utils/pdfGenerator.js';

// Ensure uploads/ directory exists
const localUploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(localUploadsDir)) {
  fs.mkdirSync(localUploadsDir, { recursive: true });
}

// Auto-populate valid mock document PDFs for the demo so "View Document" opens cleanly in browser
const mockPdfs = [
  { file: 'dummy_pan.pdf', title: 'PERMANENT ACCOUNT NUMBER (PAN) CARD' },
  { file: 'dummy_gst.pdf', title: 'GST REGISTRATION CERTIFICATE (FORM GST REG-06)' },
  { file: 'PAN_Card.pdf', title: 'PERMANENT ACCOUNT NUMBER (PAN) CARD' },
  { file: 'GST_Certificate.pdf', title: 'GST REGISTRATION CERTIFICATE' },
  { file: '7_12_Extract.pdf', title: '7/12 EXTRACT - LAND REVENUE RECORD (MAHARASHTRA)' },
  { file: 'Project_Report.pdf', title: 'DETAILED PROJECT REPORT (DPR) - INDUSTRIAL PROJECT' },
];

for (const { file, title } of mockPdfs) {
  const target = path.join(localUploadsDir, file);
  // Write if missing or if it's the broken older dummy file (< 400 bytes)
  if (!fs.existsSync(target) || fs.statSync(target).size < 400) {
    try {
      fs.writeFileSync(target, generateValidPdf(title, 'MH-IND-2026-5001'));
    } catch (_e) {
      // Ignore if write fails
    }
  }
}

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the uploads/ directory
app.use('/uploads', express.static('uploads'));
app.use('/uploads', express.static(localUploadsDir));
app.use('/uploads', express.static(uploadsDir));

// Simple request logger — replace with pino/winston in production.
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'udyam-setu-api' }));

app.use('/api/applications', applicationsRouter);
app.use('/api/schemes', schemesRouter);
app.use('/api/ocr', ocrRouter);

// Central error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

export { upload, app };

// Serve static frontend in production
const frontendDist = path.join(__dirname, '../dist');
app.use(express.static(frontendDist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) {
    return next();
  }
  res.sendFile(path.join(frontendDist, 'index.html'));
});

// Only listen if this module is run directly
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Udyam Setu API listening on http://0.0.0.0:${PORT}`);
  });
}
