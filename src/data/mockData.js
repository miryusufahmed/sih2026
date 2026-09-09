// Seed data for the officer queue + a mock "OCR" lookup table simulating
// what a real Textract/Tesseract-based PAN & GST parser would return.

export const DEPARTMENTS = [
  { key: 'fire', labelKey: 'fire' },
  { key: 'pollution', labelKey: 'pollution' },
  { key: 'land', labelKey: 'land' },
  { key: 'msme', labelKey: 'msme' },
];

// Simulated OCR extraction result — in production this would call a
// document-intelligence API (e.g. AWS Textract / Google Document AI).
export const MOCK_OCR_RESULT = {
  companyName: 'Sahyadri Precision Engineering Pvt. Ltd.',
  ownerName: 'Rajendra S. Deshmukh',
  pan: 'AABCS1234D',
  gst: '27AABCS1234D1Z5',
};

export const initialApplications = [
  {
    id: 'MH-IND-2026-00417',
    companyName: 'Sahyadri Precision Engineering Pvt. Ltd.',
    ownerName: 'Rajendra S. Deshmukh',
    industryType: 'Automobile & Auto Components',
    district: 'Pune',
    investmentCr: 12,
    submittedOn: '2026-08-14',
    pan: 'AABCS1234D',
    gst: '27AABCS1234D1Z5',
    plotArea: '4500',
    village: 'Chakan MIDC',
    documents: [
      { name: 'PAN_Card.pdf', verified: true },
      { name: 'GST_Certificate.pdf', verified: true },
      { name: '7_12_Extract.pdf', verified: false },
      { name: 'Project_Report.pdf', verified: true },
    ],
    timeline: {
      fire: 'review',
      pollution: 'review',
      land: 'pending',
      msme: 'approved',
    },
    officerRemark: '',
  },
  {
    id: 'MH-IND-2026-00418',
    companyName: 'Vidarbha AgroTech Foods LLP',
    ownerName: 'Snehal P. Kale',
    industryType: 'Food Processing / Agro-based',
    district: 'Nagpur',
    investmentCr: 3.5,
    submittedOn: '2026-08-20',
    pan: 'AAFCV5678K',
    gst: '27AAFCV5678K1Z2',
    plotArea: '2200',
    village: 'Butibori MIDC',
    documents: [
      { name: 'PAN_Card.pdf', verified: true },
      { name: 'GST_Certificate.pdf', verified: true },
      { name: '7_12_Extract.pdf', verified: true },
      { name: 'Project_Report.pdf', verified: false },
    ],
    timeline: {
      fire: 'action',
      pollution: 'pending',
      land: 'review',
      msme: 'review',
    },
    officerRemark: '',
  },
  {
    id: 'MH-IND-2026-00421',
    companyName: 'Gadchiroli Bamboo Craft Cooperative',
    ownerName: 'Ashok M. Netam',
    industryType: 'General Manufacturing (MSME)',
    district: 'Gadchiroli',
    investmentCr: 0.8,
    submittedOn: '2026-08-27',
    pan: 'AAJCG4321P',
    gst: '27AAJCG4321P1Z9',
    plotArea: '900',
    village: 'Gadchiroli MIDC',
    documents: [
      { name: 'PAN_Card.pdf', verified: true },
      { name: 'GST_Certificate.pdf', verified: false },
      { name: '7_12_Extract.pdf', verified: true },
      { name: 'Project_Report.pdf', verified: true },
    ],
    timeline: {
      fire: 'pending',
      pollution: 'pending',
      land: 'pending',
      msme: 'review',
    },
    officerRemark: '',
  },
  {
    id: 'MH-IND-2026-00429',
    companyName: 'NeoStack Software Solutions Pvt. Ltd.',
    ownerName: 'Ananya R. Kulkarni',
    industryType: 'Information Technology (IT/ITES)',
    district: 'Pune',
    investmentCr: 6,
    submittedOn: '2026-09-01',
    pan: 'AAECN9988L',
    gst: '27AAECN9988L1Z4',
    plotArea: '1500',
    village: 'Hinjewadi IT Park',
    documents: [
      { name: 'PAN_Card.pdf', verified: true },
      { name: 'GST_Certificate.pdf', verified: true },
      { name: '7_12_Extract.pdf', verified: true },
      { name: 'Project_Report.pdf', verified: true },
    ],
    timeline: {
      fire: 'approved',
      pollution: 'approved',
      land: 'approved',
      msme: 'review',
    },
    officerRemark: '',
  },
];
