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

// Ensure uploads/ directory exists
const localUploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(localUploadsDir)) {
  fs.mkdirSync(localUploadsDir, { recursive: true });
}
if (!fs.existsSync('uploads')) {
  try {
    fs.mkdirSync('uploads', { recursive: true });
  } catch (_err) {
    // Ignore if already created
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

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'maha-udyog-mitra-api' }));

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
  app.listen(PORT, () => {
    console.log(`Maha-Udyog Mitra mock API listening on http://localhost:${PORT}`);
  });
}
