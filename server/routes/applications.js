import { Router } from 'express';
import {
  listApplications,
  getApplication,
  createApplication,
  updateDepartmentStatus,
  recordDecision,
  addDocumentToApplication,
} from '../data/store.js';
import { upload } from '../middleware/upload.js';

const router = Router();

// Multer middleware configured for specific document fields
const uploadFields = upload.fields([
  { name: 'panDocument', maxCount: 1 },
  { name: 'gstDocument', maxCount: 1 },
  { name: 'landDocument', maxCount: 1 },
  { name: 'projectReport', maxCount: 1 },
  { name: 'documents', maxCount: 10 },
  { name: 'files', maxCount: 10 },
]);

// GET /api/applications — officer queue + entrepreneur "my applications"
router.get('/', (_req, res) => {
  res.json(listApplications());
});

// GET /api/applications/:id
router.get('/:id', (req, res) => {
  const app = getApplication(req.params.id);
  if (!app) return res.status(404).json({ error: 'Application not found' });
  res.json(app);
});

// POST /api/applications — submit the Unified Application Form with multipart/form-data
router.post('/', uploadFields, (req, res) => {
  const { companyName, ownerName, pan } = req.body;
  if (!companyName || !ownerName || !pan) {
    return res.status(400).json({ error: 'companyName, ownerName and pan are required' });
  }

  // Extract metadata for all files saved by multer to uploads/
  const uploadedDocs = [];
  if (req.files) {
    Object.keys(req.files).forEach((field) => {
      const fileList = req.files[field];
      if (Array.isArray(fileList)) {
        fileList.forEach((file) => {
          uploadedDocs.push({
            name: file.originalname,
            filename: file.filename,
            url: `/uploads/${file.filename}`,
            path: `/uploads/${file.filename}`,
            size: file.size,
            mimetype: file.mimetype,
            field: file.fieldname,
            verified: false,
            uploadedAt: new Date().toISOString(),
          });
        });
      }
    });
  }

  // Also include any documents provided in body (e.g., from existing list or json)
  let bodyDocs = [];
  if (req.body.documents) {
    try {
      const parsed = typeof req.body.documents === 'string' ? JSON.parse(req.body.documents) : req.body.documents;
      if (Array.isArray(parsed)) {
        bodyDocs = parsed;
      }
    } catch (_err) {
      if (typeof req.body.documents === 'string') {
        bodyDocs = req.body.documents.split(',').map((name) => ({ name: name.trim(), verified: false }));
      }
    }
  }

  const allDocuments = [...uploadedDocs, ...bodyDocs];

  // Enforce mandatory documents
  const hasPanDoc =
    (req.files && req.files.panDocument && req.files.panDocument.length > 0) ||
    allDocuments.some((d) => d.field === 'panDocument' || (d.name && d.name.toLowerCase().includes('pan')));
  const hasGstDoc =
    (req.files && req.files.gstDocument && req.files.gstDocument.length > 0) ||
    allDocuments.some((d) => d.field === 'gstDocument' || (d.name && d.name.toLowerCase().includes('gst')));

  if (!hasPanDoc || !hasGstDoc) {
    return res.status(400).json({
      error: 'PAN Card Document and GST Registration Certificate are mandatory for application submission.',
    });
  }

  const payload = {
    ...req.body,
    documents: allDocuments,
  };

  if (payload.investmentCr !== undefined && payload.investmentCr !== '') {
    payload.investmentCr = Number(payload.investmentCr);
  }

  const created = createApplication(payload);
  res.status(201).json(created);
});

// POST /api/applications/:id/documents — attach an extra document
router.post('/:id/documents', upload.single('document'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const docMetadata = {
    name: req.file.originalname,
    filename: req.file.filename,
    url: `/uploads/${req.file.filename}`,
    path: `/uploads/${req.file.filename}`,
    size: req.file.size,
    mimetype: req.file.mimetype,
    field: req.file.fieldname,
    verified: false,
    uploadedAt: new Date().toISOString(),
  };
  const updated = addDocumentToApplication(req.params.id, docMetadata);
  if (!updated) return res.status(404).json({ error: 'Application not found' });
  res.status(201).json(updated);
});

// PATCH /api/applications/:id/department — a single department updates its own lane
router.patch('/:id/department', (req, res) => {
  const { department, status } = req.body;
  const valid = ['fire', 'pollution', 'land', 'msme'];
  const validStatus = ['pending', 'review', 'approved', 'action'];
  if (!valid.includes(department) || !validStatus.includes(status)) {
    return res.status(400).json({ error: 'Invalid department or status' });
  }
  const updated = updateDepartmentStatus(req.params.id, department, status);
  if (!updated) return res.status(404).json({ error: 'Application not found' });
  res.json(updated);
});

// PATCH /api/applications/:id/decision — officer approves or rejects with reason
router.patch('/:id/decision', (req, res) => {
  const { decision, remark } = req.body;
  if (!['approve', 'reject'].includes(decision)) {
    return res.status(400).json({ error: 'decision must be "approve" or "reject"' });
  }
  if (decision === 'reject' && !remark?.trim()) {
    return res.status(400).json({ error: 'A reason is required to reject an application' });
  }
  const updated = recordDecision(req.params.id, { decision, remark });
  if (!updated) return res.status(404).json({ error: 'Application not found' });
  res.json(updated);
});

export default router;
