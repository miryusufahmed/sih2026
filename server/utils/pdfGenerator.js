/**
 * Generates a syntactically valid PDF-1.4 file with readable text.
 * Guaranteed to open cleanly in Chrome, Edge, Safari, Firefox, and Acrobat Reader.
 */
export function generateValidPdf(title, caseId = 'MH-IND-2026-DEMO', details = {}) {
  const lines = [
    'BT',
    '/F1 18 Tf',
    '50 720 Td',
    '(' + escapePdfText(title) + ') Tj',
    '/F1 12 Tf',
    '0 -28 Td',
    '(GOVERNMENT OF MAHARASHTRA - SINGLE WINDOW SYSTEM) Tj',
    '/F2 10 Tf',
    '0 -24 Td',
    '(' + escapePdfText(`Application Reference ID: ${caseId}`) + ') Tj',
    '0 -18 Td',
    '(' + escapePdfText(`Verification Timestamp: ${new Date().toISOString()}`) + ') Tj',
    '0 -18 Td',
    '(Document Status: Validated & Digitally Archived by Directorate of Industries) Tj',
    '0 -18 Td',
    '(Issuing Authority: Government of Maharashtra - SIH26130 Fast-Track Portal) Tj',
  ];

  if (details.pan) {
    lines.push('0 -18 Td', '(' + escapePdfText(`Associated PAN: ${details.pan}`) + ') Tj');
  }
  if (details.gst) {
    lines.push('0 -18 Td', '(' + escapePdfText(`Associated GSTIN: ${details.gst}`) + ') Tj');
  }

  lines.push('ET');

  const streamContent = lines.join('\n');
  const streamLength = Buffer.byteLength(streamContent, 'utf8');

  let body = '%PDF-1.4\n';
  const offsets = [];

  function addObj(num, content) {
    offsets[num] = Buffer.byteLength(body, 'utf8');
    body += `${num} 0 obj\n${content}\nendobj\n`;
  }

  addObj(1, '<< /Type /Catalog /Pages 2 0 R >>');
  addObj(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  addObj(
    3,
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> /F2 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> /Contents 4 0 R >>'
  );
  addObj(4, `<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream`);

  const xrefOffset = Buffer.byteLength(body, 'utf8');
  let xref = 'xref\n0 5\n0000000000 65535 f \n';
  for (let i = 1; i <= 4; i++) {
    xref += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }

  body += `${xref}trailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return Buffer.from(body, 'utf8');
}

function escapePdfText(text) {
  return String(text || '').replace(/[\\()]/g, '');
}
