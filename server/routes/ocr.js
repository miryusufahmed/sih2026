import { Router } from 'express';
import { upload } from '../middleware/upload.js';

const router = Router();

// Accept any uploaded file (e.g. field 'file', 'document', 'panDocument', 'gstDocument', etc.)
const ocrUpload = upload.any();

function handleOcrExtraction(req, res) {
  // Extract file information if provided
  let uploadedFile = null;
  if (req.file) {
    uploadedFile = req.file;
  } else if (req.files && req.files.length > 0) {
    uploadedFile = req.files[0];
  }

  // Realistic simulated delay representing document intelligence pipeline
  setTimeout(() => {
    res.json({
      success: true,
      companyName: 'Sahyadri Precision Engineering Pvt. Ltd.',
      ownerName: 'Rajendra S. Deshmukh',
      pan: 'AABCS1234D',
      gst: '27AABCS1234D1Z5',
      confidence: 0.97,
      file: uploadedFile
        ? {
            fieldname: uploadedFile.fieldname,
            originalname: uploadedFile.originalname,
            filename: uploadedFile.filename,
            mimetype: uploadedFile.mimetype,
            size: uploadedFile.size,
            url: `/uploads/${uploadedFile.filename}`,
            path: `/uploads/${uploadedFile.filename}`,
          }
        : null,
      extractedFields: {
        companyName: 'Sahyadri Precision Engineering Pvt. Ltd.',
        ownerName: 'Rajendra S. Deshmukh',
        pan: 'AABCS1234D',
        gst: '27AABCS1234D1Z5',
        incorporationDate: '2018-06-15',
        stateCode: '27',
        stateName: 'Maharashtra',
        documentClassification: uploadedFile?.originalname?.toLowerCase().includes('gst')
          ? 'GST_REGISTRATION_CERTIFICATE'
          : uploadedFile?.originalname?.toLowerCase().includes('pan')
          ? 'INCOME_TAX_PAN_CARD'
          : 'COMMON_BUSINESS_DOCUMENT',
      },
    });
  }, 400);
}

// POST /api/ocr/extract — original endpoint with multer file upload support
router.post('/extract', ocrUpload, handleOcrExtraction);

// POST /api/ocr — root endpoint with multer file upload support
router.post('/', ocrUpload, handleOcrExtraction);

export default router;
