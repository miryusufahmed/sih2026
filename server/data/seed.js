import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CATEGORIES = [
  'Manufacturing & Industrial Development',
  'MSME & Self-Employment Generation',
  'Single Window Clearance & Regulatory Facilitation',
  'Information Technology, Data Centers & DeepTech',
  'Textiles, Apparel & Ginning',
  'Electric Mobility & Clean Tech',
  'Agriculture, Cold Chain & Food Processing',
  'Social Justice & Affirmative Industrial Action',
  'Women Empowerment & Industrial Equity',
  'Regional Equity & Backward Area Acceleration'
];

const SECTORS = [
  'Automobile & Auto Components', 'Textile', 'Food Processing / Agro-based', 
  'Pharmaceuticals', 'Electronics & Electrical', 'Chemicals', 'General Manufacturing (MSME)',
  'Information Technology (IT/ITES)', 'Data Centers & Cloud Infrastructure', 
  'Artificial Intelligence & Machine Learning'
];

const DISTRICTS = [
  'Pune', 'Mumbai', 'Nagpur', 'Thane', 'Nashik', 'Chhatrapati Sambhajinagar', 'Solapur', 'Amravati', 'Kolhapur', 'Sangli'
];

function generateSchemes(count) {
  const schemes = [];
  for (let i = 1; i <= count; i++) {
    schemes.push({
      id: `scheme-${i}`,
      name: `Maharashtra Industrial Scheme ${i} - ${2020 + (i % 6)}`,
      shortName: `Maha-Scheme-${i}`,
      department: `Department ${i % 10}, Government of Maharashtra`,
      category: CATEGORIES[i % CATEGORIES.length],
      overview: `This is a generated mock scheme for testing purposes, focusing on ${CATEGORIES[i % CATEGORIES.length]}.`,
      objectives: [
        `Promote growth in sector ${i}`,
        `Create ${i * 100} jobs in the region`,
        `Support MSMEs with capital investment`
      ],
      eligibility: {
        scale: ['Micro', 'Small', 'Medium', 'Large', 'Mega'],
        sectors: [SECTORS[i % SECTORS.length], SECTORS[(i+1) % SECTORS.length]],
        districts: [DISTRICTS[i % DISTRICTS.length], DISTRICTS[(i+1) % DISTRICTS.length]],
        criteria: ['Must be registered in Maharashtra', 'Valid Udyam Registration']
      },
      financialIncentives: {
        capitalSubsidy: `${10 + (i % 30)}% on eligible capital investment`,
        interestSubsidy: `${2 + (i % 5)}% interest subvention`,
        stampDutyExemption: '100% stamp duty exemption'
      },
      applicationProcess: {
        portal: 'https://di.maharashtra.gov.in',
        nodalAgency: 'District Industries Centre (DIC)',
        turnaroundTime: `${15 + (i % 30)} working days`,
        requiredDocuments: ['Udyam Registration', 'DPR', 'PAN', 'GST']
      },
      active: true
    });
  }
  return schemes;
}

function generateApplications(count) {
  const apps = [];
  const statuses = ['pending', 'review', 'approved', 'action'];
  for (let i = 1; i <= count; i++) {
    apps.push({
      id: `MH-IND-2026-${String(5000 + i).padStart(4, '0')}`,
      companyName: `Mock Enterprise ${i} Pvt. Ltd.`,
      ownerName: `Owner Name ${i}`,
      industryType: SECTORS[i % SECTORS.length],
      district: DISTRICTS[i % DISTRICTS.length],
      investmentCr: (1 + (i % 50)) * 1.5,
      submittedOn: new Date(Date.now() - i * 86400000).toISOString().slice(0, 10),
      pan: `AABC${String(i).padStart(4, '0')}D`,
      gst: `27AABC${String(i).padStart(4, '0')}D1Z5`,
      documents: [
        { name: 'PAN_Card.pdf', verified: true, url: '/uploads/dummy_pan.pdf' },
        { name: 'GST_Certificate.pdf', verified: true, url: '/uploads/dummy_gst.pdf' }
      ],
      timeline: {
        fire: statuses[i % 4],
        pollution: statuses[(i + 1) % 4],
        land: statuses[(i + 2) % 4],
        msme: statuses[(i + 3) % 4]
      },
      officerRemark: i % 3 === 0 ? 'Needs more information.' : ''
    });
  }
  return apps;
}

const schemes = generateSchemes(110);
const apps = generateApplications(60);

fs.writeFileSync(path.join(__dirname, 'schemes.json'), JSON.stringify(schemes, null, 2));
fs.writeFileSync(path.join(__dirname, 'applications.json'), JSON.stringify(apps, null, 2));

console.log(`Generated ${schemes.length} schemes and ${apps.length} applications.`);
