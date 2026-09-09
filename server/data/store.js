import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize SQLite Database
const dbPath = path.join(__dirname, 'mitra.db');
const db = new Database(dbPath);

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS applications (
    id TEXT PRIMARY KEY,
    companyName TEXT,
    ownerName TEXT,
    industryType TEXT,
    district TEXT,
    investmentCr REAL,
    submittedOn TEXT,
    pan TEXT,
    gst TEXT,
    plotArea TEXT,
    village TEXT,
    taluka TEXT,
    fireTimeline TEXT,
    pollutionTimeline TEXT,
    landTimeline TEXT,
    msmeTimeline TEXT,
    officerRemark TEXT,
    lastDecision TEXT
  );

  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    application_id TEXT,
    name TEXT,
    filename TEXT,
    url TEXT,
    path TEXT,
    field TEXT,
    size INTEGER,
    mimetype TEXT,
    verified INTEGER,
    uploadedAt TEXT,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS schemes (
    id TEXT PRIMARY KEY,
    name TEXT,
    shortName TEXT,
    department TEXT,
    category TEXT,
    overview TEXT,
    objectives TEXT,
    eligibility TEXT,
    financialIncentives TEXT,
    applicationProcess TEXT,
    active INTEGER
  );
`);

// Seed data from JSON if the database is empty
const stmtCount = db.prepare('SELECT COUNT(*) as count FROM applications');
if (stmtCount.get().count === 0) {
  try {
    const applicationsPath = path.join(__dirname, 'applications.json');
    const appsData = JSON.parse(fs.readFileSync(applicationsPath, 'utf8'));
    
    const insertApp = db.prepare(`
      INSERT INTO applications (
        id, companyName, ownerName, industryType, district, investmentCr, submittedOn, pan, gst, plotArea, village, taluka,
        fireTimeline, pollutionTimeline, landTimeline, msmeTimeline, officerRemark
      ) VALUES (
        @id, @companyName, @ownerName, @industryType, @district, @investmentCr, @submittedOn, @pan, @gst, @plotArea, @village, @taluka,
        @fireTimeline, @pollutionTimeline, @landTimeline, @msmeTimeline, @officerRemark
      )
    `);

    const insertDoc = db.prepare(`
      INSERT INTO documents (
        application_id, name, filename, url, path, field, size, mimetype, verified, uploadedAt
      ) VALUES (
        @application_id, @name, @filename, @url, @path, @field, @size, @mimetype, @verified, @uploadedAt
      )
    `);

    const insertMany = db.transaction((apps) => {
      for (const app of apps) {
        insertApp.run({
          id: app.id,
          companyName: app.companyName,
          ownerName: app.ownerName,
          industryType: app.industryType,
          district: app.district,
          investmentCr: app.investmentCr,
          submittedOn: app.submittedOn,
          pan: app.pan,
          gst: app.gst,
          plotArea: app.plotArea || null,
          village: app.village || null,
          taluka: app.taluka || null,
          fireTimeline: app.timeline?.fire || 'review',
          pollutionTimeline: app.timeline?.pollution || 'review',
          landTimeline: app.timeline?.land || 'review',
          msmeTimeline: app.timeline?.msme || 'review',
          officerRemark: app.officerRemark || ''
        });

        if (app.documents && Array.isArray(app.documents)) {
          for (const doc of app.documents) {
            insertDoc.run({
              application_id: app.id,
              name: doc.name || doc.filename,
              filename: doc.filename || doc.name,
              url: doc.url || `/uploads/${doc.filename || doc.name}`,
              path: doc.path || `/uploads/${doc.filename || doc.name}`,
              field: doc.field || null,
              size: doc.size || null,
              mimetype: doc.mimetype || null,
              verified: doc.verified ? 1 : 0,
              uploadedAt: doc.uploadedAt || new Date().toISOString()
            });
          }
        }
      }
    });

    insertMany(appsData);
    console.log(`Seeded ${appsData.length} applications into SQLite database.`);
  } catch (err) {
    console.warn('Could not load applications.json for seeding.', err.message);
  }
}

const stmtSchemesCount = db.prepare('SELECT COUNT(*) as count FROM schemes');
if (stmtSchemesCount.get().count === 0) {
  try {
    const schemesPath = path.join(__dirname, 'schemes.json');
    const schemesData = JSON.parse(fs.readFileSync(schemesPath, 'utf8'));

    const insertScheme = db.prepare(`
      INSERT INTO schemes (
        id, name, shortName, department, category, overview, objectives, eligibility, financialIncentives, applicationProcess, active
      ) VALUES (
        @id, @name, @shortName, @department, @category, @overview, @objectives, @eligibility, @financialIncentives, @applicationProcess, @active
      )
    `);

    const insertManySchemes = db.transaction((schemes) => {
      for (const s of schemes) {
        insertScheme.run({
          id: s.id,
          name: s.name,
          shortName: s.shortName,
          department: s.department,
          category: s.category,
          overview: s.overview,
          objectives: JSON.stringify(s.objectives || []),
          eligibility: JSON.stringify(s.eligibility || {}),
          financialIncentives: JSON.stringify(s.financialIncentives || {}),
          applicationProcess: JSON.stringify(s.applicationProcess || {}),
          active: s.active ? 1 : 0
        });
      }
    });

    insertManySchemes(schemesData);
    console.log(`Seeded ${schemesData.length} schemes into SQLite database.`);
  } catch (err) {
    console.warn('Could not load schemes.json for seeding.', err.message);
  }
}

/**
 * Normalizes document items into rich metadata objects with filename and static route URL.
 */
function normalizeDocument(doc) {
  if (!doc) return null;
  if (typeof doc === 'string') {
    return {
      name: doc,
      filename: doc,
      url: `/uploads/${doc}`,
      path: `/uploads/${doc}`,
      size: null,
      mimetype: null,
      field: null,
      verified: false,
      uploadedAt: new Date().toISOString(),
    };
  }

  const filename = doc.filename || doc.name || 'document';
  return {
    name: doc.name || doc.originalname || filename,
    filename: filename,
    url: doc.url || `/uploads/${filename}`,
    path: doc.path || `/uploads/${filename}`,
    size: doc.size || null,
    mimetype: doc.mimetype || null,
    field: doc.field || doc.fieldname || null,
    verified: Boolean(doc.verified),
    uploadedAt: doc.uploadedAt || new Date().toISOString(),
  };
}

// Helper to format DB row back to the expected nested object
function formatApplicationRow(row, docs) {
  return {
    id: row.id,
    companyName: row.companyName,
    ownerName: row.ownerName,
    industryType: row.industryType,
    district: row.district,
    investmentCr: row.investmentCr,
    submittedOn: row.submittedOn,
    pan: row.pan,
    gst: row.gst,
    plotArea: row.plotArea,
    village: row.village,
    taluka: row.taluka,
    timeline: {
      fire: row.fireTimeline,
      pollution: row.pollutionTimeline,
      land: row.landTimeline,
      msme: row.msmeTimeline
    },
    officerRemark: row.officerRemark,
    lastDecision: row.lastDecision,
    documents: docs.map(d => ({
      ...d,
      verified: Boolean(d.verified)
    }))
  };
}

export function listApplications() {
  const apps = db.prepare('SELECT * FROM applications ORDER BY submittedOn DESC, id DESC').all();
  const docs = db.prepare('SELECT * FROM documents').all();
  
  // Group docs by application_id
  const docsByApp = {};
  for (const doc of docs) {
    if (!docsByApp[doc.application_id]) {
      docsByApp[doc.application_id] = [];
    }
    docsByApp[doc.application_id].push(doc);
  }

  return apps.map(app => formatApplicationRow(app, docsByApp[app.id] || []));
}

export function getApplication(id) {
  const app = db.prepare('SELECT * FROM applications WHERE id = ?').get(id);
  if (!app) return null;
  const docs = db.prepare('SELECT * FROM documents WHERE application_id = ?').all(id);
  return formatApplicationRow(app, docs);
}

export function createApplication(payload) {
  const newId = payload.id || `MH-IND-2026-${Math.floor(400 + Math.random() * 599)}`;
  const submittedOn = payload.submittedOn || new Date().toISOString().slice(0, 10);
  const fireTimeline = payload.timeline?.fire || 'review';
  const pollutionTimeline = payload.timeline?.pollution || 'review';
  const landTimeline = payload.timeline?.land || 'review';
  const msmeTimeline = payload.timeline?.msme || 'review';
  const officerRemark = payload.officerRemark || '';

  const insertApp = db.prepare(`
    INSERT INTO applications (
      id, companyName, ownerName, industryType, district, investmentCr, submittedOn, pan, gst, plotArea, village, taluka,
      fireTimeline, pollutionTimeline, landTimeline, msmeTimeline, officerRemark
    ) VALUES (
      @id, @companyName, @ownerName, @industryType, @district, @investmentCr, @submittedOn, @pan, @gst, @plotArea, @village, @taluka,
      @fireTimeline, @pollutionTimeline, @landTimeline, @msmeTimeline, @officerRemark
    )
  `);

  insertApp.run({
    id: newId,
    companyName: payload.companyName,
    ownerName: payload.ownerName,
    industryType: payload.industryType,
    district: payload.district,
    investmentCr: payload.investmentCr != null ? Number(payload.investmentCr) : 1,
    submittedOn: submittedOn,
    pan: payload.pan,
    gst: payload.gst,
    plotArea: payload.plotArea || null,
    village: payload.village || null,
    taluka: payload.taluka || null,
    fireTimeline,
    pollutionTimeline,
    landTimeline,
    msmeTimeline,
    officerRemark
  });

  const rawDocs = payload.documents || [];
  const normalizedDocs = rawDocs.map(normalizeDocument).filter(Boolean);

  const insertDoc = db.prepare(`
    INSERT INTO documents (
      application_id, name, filename, url, path, field, size, mimetype, verified, uploadedAt
    ) VALUES (
      @application_id, @name, @filename, @url, @path, @field, @size, @mimetype, @verified, @uploadedAt
    )
  `);

  for (const doc of normalizedDocs) {
    insertDoc.run({
      application_id: newId,
      name: doc.name,
      filename: doc.filename,
      url: doc.url,
      path: doc.path,
      field: doc.field,
      size: doc.size,
      mimetype: doc.mimetype,
      verified: doc.verified ? 1 : 0,
      uploadedAt: doc.uploadedAt
    });
  }

  return getApplication(newId);
}

export function addDocumentToApplication(id, document) {
  const normalized = normalizeDocument(document);
  if (!normalized) return null;

  const insertDoc = db.prepare(`
    INSERT INTO documents (
      application_id, name, filename, url, path, field, size, mimetype, verified, uploadedAt
    ) VALUES (
      @application_id, @name, @filename, @url, @path, @field, @size, @mimetype, @verified, @uploadedAt
    )
  `);

  try {
    insertDoc.run({
      application_id: id,
      name: normalized.name,
      filename: normalized.filename,
      url: normalized.url,
      path: normalized.path,
      field: normalized.field,
      size: normalized.size,
      mimetype: normalized.mimetype,
      verified: normalized.verified ? 1 : 0,
      uploadedAt: normalized.uploadedAt
    });
    return getApplication(id);
  } catch (err) {
    return null;
  }
}

export function updateDepartmentStatus(id, departmentKey, status) {
  const allowedKeys = ['fire', 'pollution', 'land', 'msme'];
  if (!allowedKeys.includes(departmentKey)) return null;

  const stmt = db.prepare(`UPDATE applications SET ${departmentKey}Timeline = ? WHERE id = ?`);
  const info = stmt.run(status, id);
  if (info.changes === 0) return null;
  
  return getApplication(id);
}

export function recordDecision(id, { decision, remark }) {
  const msmeStatus = decision === 'approve' ? 'approved' : 'action';
  const stmt = db.prepare('UPDATE applications SET msmeTimeline = ?, officerRemark = ?, lastDecision = ? WHERE id = ?');
  const info = stmt.run(msmeStatus, remark, decision, id);
  
  if (info.changes === 0) return null;
  return getApplication(id);
}

export function getSchemes() {
  const schemes = db.prepare('SELECT * FROM schemes').all();
  return schemes.map(s => ({
    ...s,
    objectives: JSON.parse(s.objectives || '[]'),
    eligibility: JSON.parse(s.eligibility || '{}'),
    financialIncentives: JSON.parse(s.financialIncentives || '{}'),
    applicationProcess: JSON.parse(s.applicationProcess || '{}'),
    active: Boolean(s.active)
  }));
}
