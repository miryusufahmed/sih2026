import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

process.env.NODE_ENV = 'test';

const { app } = await import('./index.js');

const server = app.listen(0, async () => {
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`Test server running at ${baseUrl}`);

  try {
    let passed = 0;
    let failed = 0;

    function assert(condition, message) {
      if (!condition) {
        console.error(`❌ FAIL: ${message}`);
        failed++;
        throw new Error(message);
      } else {
        console.log(`✅ PASS: ${message}`);
        passed++;
      }
    }

    // 1. Health check
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthData = await healthRes.json();
    assert(healthData.status === 'ok', 'GET /health returns ok');

    // 2. Schemes list
    const schemesRes = await fetch(`${baseUrl}/api/schemes`);
    const schemesData = await schemesRes.json();
    assert(Array.isArray(schemesData) && schemesData.length >= 8, `GET /api/schemes returns rich list (count: ${schemesData.length})`);
    
    const ids = schemesData.map(s => s.id);
    assert(ids.includes('psi-2019'), 'Schemes list contains PSI 2019');
    assert(ids.includes('cmegp'), 'Schemes list contains CMEGP');
    assert(ids.includes('maitri'), 'Schemes list contains MAITRI');
    assert(ids.includes('it-ites-policy-2023'), 'Schemes list contains IT/ITES Policy');
    assert(ids.includes('textile-policy-2028'), 'Schemes list contains Textile Policy');
    assert(ids.includes('ev-policy-2025'), 'Schemes list contains EV Policy');

    // 3. Single scheme details
    const maitriRes = await fetch(`${baseUrl}/api/schemes/maitri`);
    const maitriData = await maitriRes.json();
    assert(maitriData.name.includes('MAITRI') && maitriData.servicesOffered.length > 0, 'GET /api/schemes/maitri returns comprehensive scheme details');

    // 4. Match schemes
    const matchRes = await fetch(`${baseUrl}/api/schemes/match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        district: 'Pune',
        industryType: 'Automobile & Auto Components',
        investmentCr: 15,
      }),
    });
    const matchData = await matchRes.json();
    assert(Array.isArray(matchData.matched) && matchData.totalEstimatedBenefitCr > 0, 'POST /api/schemes/match returns matched schemes and benefits');

    // 5. OCR with file upload
    const ocrForm = new FormData();
    const mockPanBlob = new Blob(['SAMPLE PAN CARD CONTENT MOCK DATA'], { type: 'application/pdf' });
    ocrForm.append('file', mockPanBlob, 'pan_scan.pdf');

    const ocrRes = await fetch(`${baseUrl}/api/ocr/extract`, {
      method: 'POST',
      body: ocrForm,
    });
    const ocrData = await ocrRes.json();
    assert(ocrData.pan === 'AABCS1234D', 'POST /api/ocr/extract returns mock pan data');
    assert(ocrData.file && ocrData.file.filename.includes('pan_scan'), 'POST /api/ocr/extract saves file and returns file metadata');

    // 6. Test static file serving from uploads/
    const staticRes = await fetch(`${baseUrl}${ocrData.file.url}`);
    assert(staticRes.status === 200, `Static route ${ocrData.file.url} served file successfully`);
    const staticContent = await staticRes.text();
    assert(staticContent === 'SAMPLE PAN CARD CONTENT MOCK DATA', 'Static file content matches uploaded content');

    // 7. Applications POST with multipart/form-data
    const appForm = new FormData();
    appForm.append('companyName', 'Maha Tech Innovations Pvt. Ltd.');
    appForm.append('ownerName', 'Kavita Sharad Patil');
    appForm.append('pan', 'AAACM9876Q');
    appForm.append('gst', '27AAACM9876Q1Z1');
    appForm.append('industryType', 'Electronics & Electrical');
    appForm.append('district', 'Nashik');
    appForm.append('investmentCr', '8.5');
    appForm.append('plotArea', '3200');
    appForm.append('village', 'Ambad MIDC');

    // Attach multipart files
    appForm.append('panDocument', new Blob(['PAN CARD BLOB DATA'], { type: 'application/pdf' }), 'PAN_Card.pdf');
    appForm.append('gstDocument', new Blob(['GST CERT BLOB DATA'], { type: 'application/pdf' }), 'GST_Certificate.pdf');
    appForm.append('landDocument', new Blob(['7/12 EXTRACT BLOB DATA'], { type: 'application/pdf' }), '7_12_Extract.pdf');
    appForm.append('projectReport', new Blob(['PROJECT REPORT BLOB DATA'], { type: 'application/pdf' }), 'Project_Report.pdf');

    const createAppRes = await fetch(`${baseUrl}/api/applications`, {
      method: 'POST',
      body: appForm,
    });
    const createdApp = await createAppRes.json();
    assert(createAppRes.status === 201, 'POST /api/applications returned 201 Created');
    assert(createdApp.companyName === 'Maha Tech Innovations Pvt. Ltd.', 'Created app has correct companyName');
    assert(Array.isArray(createdApp.documents) && createdApp.documents.length === 4, `Created app has 4 uploaded documents (count: ${createdApp.documents.length})`);
    
    // Check file metadata stored in application
    const panDoc = createdApp.documents.find(d => d.field === 'panDocument');
    assert(panDoc && panDoc.filename && panDoc.url.startsWith('/uploads/'), 'Document has filename and static url metadata');
    assert(panDoc.name === 'PAN_Card.pdf', 'Document preserves original name');

    // Verify static serving for one of the application uploaded files
    const appDocStaticRes = await fetch(`${baseUrl}${panDoc.url}`);
    assert(appDocStaticRes.status === 200, `Uploaded application document accessible at ${panDoc.url}`);
    const appDocContent = await appDocStaticRes.text();
    assert(appDocContent === 'PAN CARD BLOB DATA', 'Application document static content matches uploaded bytes');

    // 8. Department update
    const patchDeptRes = await fetch(`${baseUrl}/api/applications/${createdApp.id}/department`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ department: 'fire', status: 'approved' }),
    });
    const patchDeptData = await patchDeptRes.json();
    assert(patchDeptData.timeline.fire === 'approved', 'PATCH /api/applications/:id/department updates timeline');

    // 9. Officer decision
    const patchDecRes = await fetch(`${baseUrl}/api/applications/${createdApp.id}/decision`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision: 'approve', remark: 'All industrial compliance verified.' }),
    });
    const patchDecData = await patchDecRes.json();
    assert(patchDecData.lastDecision === 'approve' && patchDecData.timeline.msme === 'approved', 'PATCH /api/applications/:id/decision updates decision and msme timeline');

    console.log(`\n========================================`);
    console.log(`ALL ${passed} CHECKS PASSED SUCCESSFULLY!`);
    console.log(`========================================\n`);

  } catch (err) {
    console.error('Test execution failed:', err);
    process.exitCode = 1;
  } finally {
    server.close();
  }
});
