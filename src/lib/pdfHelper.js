/**
 * Generates a valid 1-page PDF File in browser memory.
 * Useful for demo mock uploads so the resulting uploaded file is a valid PDF
 * that renders cleanly in any browser PDF viewer.
 */
export function createMockPdfFile(title, filename, caseId = 'MH-IND-2026-APPLICANT') {
  const lines = [
    'BT',
    '/F1 18 Tf',
    '50 720 Td',
    '(' + escapePdf(title) + ') Tj',
    '/F1 12 Tf',
    '0 -28 Td',
    '(GOVERNMENT OF MAHARASHTRA - SINGLE WINDOW SYSTEM) Tj',
    '/F2 10 Tf',
    '0 -24 Td',
    '(' + escapePdf(`Application Reference ID: ${caseId}`) + ') Tj',
    '0 -18 Td',
    '(' + escapePdf(`Verification Timestamp: ${new Date().toISOString()}`) + ') Tj',
    '0 -18 Td',
    '(Status: Validated & Digitally Archived for Industrial Clearance) Tj',
    '0 -18 Td',
    '(Issuing Authority: Directorate of Industries, Govt. of Maharashtra) Tj',
    'ET'
  ];

  const streamContent = lines.join('\n');
  const streamLength = new TextEncoder().encode(streamContent).length;

  let body = '%PDF-1.4\n';
  const offsets = [];

  function addObj(num, content) {
    offsets[num] = new TextEncoder().encode(body).length;
    body += `${num} 0 obj\n${content}\nendobj\n`;
  }

  addObj(1, '<< /Type /Catalog /Pages 2 0 R >>');
  addObj(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  addObj(
    3,
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> /F2 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> /Contents 4 0 R >>'
  );
  addObj(4, `<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream`);

  const xrefOffset = new TextEncoder().encode(body).length;
  let xref = 'xref\n0 5\n0000000000 65535 f \n';
  for (let i = 1; i <= 4; i++) {
    xref += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }

  body += `${xref}trailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  const blob = new Blob([body], { type: 'application/pdf' });
  return new File([blob], filename, { type: 'application/pdf' });
}

function escapePdf(text) {
  return String(text || '').replace(/[\\()]/g, '');
}
