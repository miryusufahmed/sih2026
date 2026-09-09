import React, { useState, useRef } from 'react';
import {
  Check,
  ScanLine,
  UploadCloud,
  FileText,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Eye,
  Loader2,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, Label, Input, Select, Badge } from '@/components/ui';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { DISTRICTS, INDUSTRY_TYPES } from '@/data/schemes';
import { MOCK_OCR_RESULT } from '@/data/mockData';
import { createMockPdfFile } from '@/lib/pdfHelper';

const STEPS = ['step1', 'step2', 'step3'];

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

const DOCUMENT_SLOTS = [
  {
    key: 'panDocument',
    label: 'PAN Card Document',
    hint: 'Company or Director PAN card (PDF/JPG)',
    defaultName: 'PAN_Card.pdf',
    required: true,
  },
  {
    key: 'gstDocument',
    label: 'GST Registration Certificate',
    hint: 'Form GST REG-06 registration certificate (PDF)',
    defaultName: 'GST_Certificate.pdf',
    required: true,
  },
  {
    key: 'landDocument',
    label: 'Land Records (7/12 Extract)',
    hint: '7/12 extract or MIDC allotment letter (PDF)',
    defaultName: '7_12_Extract.pdf',
    required: false,
  },
  {
    key: 'projectReport',
    label: 'Detailed Project Report (DPR)',
    hint: 'Project cost breakdown, machinery & layout plans (PDF)',
    defaultName: 'Project_Report.pdf',
    required: false,
  },
];

function StepIndicator({ current }) {
  const { t } = useApp();
  return (
    <div className="mb-8 flex items-center">
      {STEPS.map((stepKey, idx) => {
        const stepNum = idx + 1;
        const isDone = stepNum < current;
        const isActive = stepNum === current;
        return (
          <React.Fragment key={stepKey}>
            <div className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors',
                  isDone && 'border-governance-700 bg-governance-700 text-white',
                  isActive && !isDone && 'border-governance-700 text-governance-700 bg-white',
                  !isActive && !isDone && 'border-slate-200 text-slate-400 bg-white'
                )}
              >
                {isDone ? <Check size={16} /> : stepNum}
              </div>
              <span
                className={cn(
                  'w-24 text-center text-xs font-medium',
                  isActive || isDone ? 'text-slate-800' : 'text-slate-400'
                )}
              >
                {t.form[stepKey]}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={cn('mx-2 mb-5 h-0.5 flex-1', idx < current - 1 ? 'bg-governance-700' : 'bg-slate-200')} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

const EMPTY_FORM = {
  companyName: '',
  ownerName: '',
  pan: '',
  gst: '',
  industryType: INDUSTRY_TYPES[0],
  investmentCr: '',
  employment: '',
  district: DISTRICTS[0],
  taluka: '',
  village: '',
  plotArea: '',
  landType: 'MIDC Allotted',
};

export default function ApplicationForm() {
  const { t, addApplication, setActiveView } = useApp();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(EMPTY_FORM);
  const [touched, setTouched] = useState({ pan: false, gst: false });
  const [docFiles, setDocFiles] = useState({
    panDocument: null,
    gstDocument: null,
    landDocument: null,
    projectReport: null,
  });
  const [ocrState, setOcrState] = useState('idle'); // idle | scanning | done
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const fileInputRef = useRef(null);

  const update = (key) => (e) => {
    let value = e.target.value;
    if (key === 'pan' || key === 'gst') {
      value = value.toUpperCase();
      setTouched((prev) => ({ ...prev, [key]: true }));
    }
    setForm((f) => ({ ...f, [key]: value }));
  };

  const isPanValid = PAN_REGEX.test(form.pan.trim().toUpperCase());
  const isGstValid = GST_REGEX.test(form.gst.trim().toUpperCase());

  const canProceedStep1 = Boolean(
    form.companyName.trim() &&
    form.ownerName.trim() &&
    isPanValid &&
    isGstValid
  );
  const canProceedStep2 = Boolean(form.district && form.village && form.plotArea);
  const canProceedStep3 = Boolean(docFiles.panDocument && docFiles.gstDocument);

  const handleSingleFile = (key, file) => {
    if (!file) return;
    setDocFiles((prev) => ({ ...prev, [key]: file }));
  };

  const handleRemoveFile = (key) => {
    setDocFiles((prev) => ({ ...prev, [key]: null }));
  };

  const handleBatchFiles = (fileList) => {
    const newDocs = { ...docFiles };
    Array.from(fileList).forEach((file) => {
      const name = file.name.toLowerCase();
      if (name.includes('pan')) {
        newDocs.panDocument = file;
      } else if (name.includes('gst')) {
        newDocs.gstDocument = file;
      } else if (name.includes('land') || name.includes('7_12') || name.includes('extract')) {
        newDocs.landDocument = file;
      } else if (name.includes('project') || name.includes('report') || name.includes('dpr')) {
        newDocs.projectReport = file;
      } else {
        if (!newDocs.panDocument) newDocs.panDocument = file;
        else if (!newDocs.gstDocument) newDocs.gstDocument = file;
        else if (!newDocs.landDocument) newDocs.landDocument = file;
        else if (!newDocs.projectReport) newDocs.projectReport = file;
      }
    });
    setDocFiles(newDocs);
  };

  const runOcrAutofill = async () => {
    setOcrState('scanning');
    try {
      const res = await fetch('/api/ocr/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        setForm((f) => ({
          ...f,
          companyName: data.companyName || MOCK_OCR_RESULT.companyName,
          ownerName: data.ownerName || MOCK_OCR_RESULT.ownerName,
          pan: data.pan || MOCK_OCR_RESULT.pan,
          gst: data.gst || MOCK_OCR_RESULT.gst,
        }));
      } else {
        setForm((f) => ({
          ...f,
          companyName: MOCK_OCR_RESULT.companyName,
          ownerName: MOCK_OCR_RESULT.ownerName,
          pan: MOCK_OCR_RESULT.pan,
          gst: MOCK_OCR_RESULT.gst,
        }));
      }
    } catch {
      setForm((f) => ({
        ...f,
        companyName: MOCK_OCR_RESULT.companyName,
        ownerName: MOCK_OCR_RESULT.ownerName,
        pan: MOCK_OCR_RESULT.pan,
        gst: MOCK_OCR_RESULT.gst,
      }));
    }

    setTouched({ pan: true, gst: true });

    // Provide valid PDF demo files for documents
    const mockPan = createMockPdfFile('PERMANENT ACCOUNT NUMBER (PAN) CARD', 'PAN_Card.pdf');
    const mockGst = createMockPdfFile('GST REGISTRATION CERTIFICATE', 'GST_Certificate.pdf');
    const mockLand = createMockPdfFile('7/12 EXTRACT - LAND REVENUE RECORD', '7_12_Extract.pdf');
    const mockProject = createMockPdfFile('DETAILED PROJECT REPORT (DPR)', 'Project_Report.pdf');

    setDocFiles((prev) => ({
      panDocument: prev.panDocument || mockPan,
      gstDocument: prev.gstDocument || mockGst,
      landDocument: prev.landDocument || mockLand,
      projectReport: prev.projectReport || mockProject,
    }));

    setOcrState('done');
  };

  const handleSubmit = async () => {
    if (!docFiles.panDocument || !docFiles.gstDocument) {
      setSubmitError('Both PAN Card Document and GST Registration Certificate are mandatory to submit this application.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const formData = new FormData();
      formData.append('companyName', form.companyName.trim());
      formData.append('ownerName', form.ownerName.trim());
      formData.append('pan', form.pan.trim().toUpperCase());
      formData.append('gst', form.gst.trim().toUpperCase());
      formData.append('industryType', form.industryType);
      formData.append('district', form.district);
      formData.append('investmentCr', String(form.investmentCr || '1'));

      // Location details
      if (form.taluka) formData.append('taluka', form.taluka);
      if (form.village) formData.append('village', form.village);
      if (form.plotArea) formData.append('plotArea', form.plotArea);
      if (form.landType) formData.append('landType', form.landType);
      if (form.employment) formData.append('employment', form.employment);

      // Append files: panDocument, gstDocument, landDocument, projectReport
      if (docFiles.panDocument) {
        formData.append('panDocument', docFiles.panDocument);
      }
      if (docFiles.gstDocument) {
        formData.append('gstDocument', docFiles.gstDocument);
      }
      if (docFiles.landDocument) {
        formData.append('landDocument', docFiles.landDocument);
      }
      if (docFiles.projectReport) {
        formData.append('projectReport', docFiles.projectReport);
      }

      await addApplication(formData);
      setSubmitted(true);
    } catch (err) {
      console.error('Failed to submit application:', err);
      setSubmitError(err.message || 'Failed to submit application. Please check backend connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreviewFile = (file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    window.open(url, '_blank');
  };

  if (submitted) {
    return (
      <div className="mx-auto flex max-w-lg animate-fade-in flex-col items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 px-8 py-14 text-center">
        <CheckCircle2 size={52} className="mb-4 text-emerald-600" />
        <h2 className="text-xl font-bold text-slate-900">{t.form.submitted}</h2>
        <p className="mt-2 text-sm text-slate-600">{t.form.submittedDesc}</p>
        <div className="mt-6 flex gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setSubmitted(false);
              setStep(1);
              setForm(EMPTY_FORM);
              setTouched({ pan: false, gst: false });
              setDocFiles({
                panDocument: null,
                gstDocument: null,
                landDocument: null,
                projectReport: null,
              });
              setOcrState('idle');
            }}
          >
            {t.nav.newApplication}
          </Button>
          <Button onClick={() => setActiveView('tracker')}>{t.nav.approvalTracker}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{t.form.title}</h1>
        <p className="mt-1 text-sm text-slate-500">{t.form.subtitle}</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <StepIndicator current={step} />

          {step === 1 && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <Label>{t.form.companyName} *</Label>
                <Input
                  value={form.companyName}
                  onChange={update('companyName')}
                  placeholder="e.g. Sahyadri Precision Engineering Pvt. Ltd."
                  required
                />
              </div>
              <div>
                <Label>{t.form.ownerName} *</Label>
                <Input
                  value={form.ownerName}
                  onChange={update('ownerName')}
                  placeholder="e.g. Rajendra S. Deshmukh"
                  required
                />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <Label>{t.form.pan} *</Label>
                  {form.pan && (
                    <span className="text-xs">
                      {isPanValid ? (
                        <span className="flex items-center gap-1 font-medium text-emerald-600">
                          <CheckCircle2 size={12} /> Valid PAN
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 font-medium text-red-600">
                          <AlertCircle size={12} /> Invalid format
                        </span>
                      )}
                    </span>
                  )}
                </div>
                <Input
                  name="pan"
                  value={form.pan}
                  onChange={update('pan')}
                  onBlur={() => setTouched((t) => ({ ...t, pan: true }))}
                  placeholder="AAAAA0000A"
                  maxLength={10}
                  className={cn(
                    form.pan && !isPanValid && touched.pan && 'border-red-400 focus:border-red-500 focus:ring-red-100',
                    form.pan && isPanValid && 'border-emerald-400 focus:border-emerald-500 focus:ring-emerald-100'
                  )}
                />
                <p className="mt-1 text-[11px] text-slate-500">Format: 5 letters, 4 digits, 1 letter (e.g. AABCS1234D)</p>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <Label>{t.form.gst} *</Label>
                  {form.gst && (
                    <span className="text-xs">
                      {isGstValid ? (
                        <span className="flex items-center gap-1 font-medium text-emerald-600">
                          <CheckCircle2 size={12} /> Valid GSTIN
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 font-medium text-red-600">
                          <AlertCircle size={12} /> Invalid format
                        </span>
                      )}
                    </span>
                  )}
                </div>
                <Input
                  name="gst"
                  value={form.gst}
                  onChange={update('gst')}
                  onBlur={() => setTouched((t) => ({ ...t, gst: true }))}
                  placeholder="27AAAAA0000A1Z5"
                  maxLength={15}
                  className={cn(
                    form.gst && !isGstValid && touched.gst && 'border-red-400 focus:border-red-500 focus:ring-red-100',
                    form.gst && isGstValid && 'border-emerald-400 focus:border-emerald-500 focus:ring-emerald-100'
                  )}
                />
                <p className="mt-1 text-[11px] text-slate-500">Format: 15-character GSTIN (e.g. 27AABCS1234D1Z5)</p>
              </div>
              <div>
                <Label>{t.form.industryType}</Label>
                <Select value={form.industryType} onChange={update('industryType')}>
                  {INDUSTRY_TYPES.map((i) => (
                    <option key={i}>{i}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>{t.form.investment}</Label>
                <Input type="number" min="0" step="0.1" value={form.investmentCr} onChange={update('investmentCr')} placeholder="e.g. 12" />
              </div>
              <div className="sm:col-span-2">
                <Label>{t.form.employment}</Label>
                <Input type="number" min="0" value={form.employment} onChange={update('employment')} placeholder="e.g. 85" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <Label>{t.form.district}</Label>
                <Select value={form.district} onChange={update('district')}>
                  {DISTRICTS.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>{t.form.taluka}</Label>
                <Input value={form.taluka} onChange={update('taluka')} placeholder="e.g. Khed" />
              </div>
              <div>
                <Label>{t.form.village}</Label>
                <Input value={form.village} onChange={update('village')} placeholder="e.g. Chakan MIDC" />
              </div>
              <div>
                <Label>{t.form.plotArea}</Label>
                <Input type="number" min="0" value={form.plotArea} onChange={update('plotArea')} placeholder="e.g. 4500" />
              </div>
              <div className="sm:col-span-2">
                <Label>{t.form.landType}</Label>
                <Select value={form.landType} onChange={update('landType')}>
                  <option>MIDC Allotted</option>
                  <option>Private Freehold</option>
                  <option>Agricultural (NA Pending)</option>
                  <option>Leasehold — State Government</option>
                </Select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <Label className="mb-0 text-base">{t.form.uploadDocs}</Label>
                <p className="mb-3 text-xs text-slate-500">{t.form.uploadDocsDesc}</p>

                {/* Batch drop zone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleBatchFiles(e.dataTransfer.files);
                  }}
                  className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-25 px-6 py-8 text-center transition-colors hover:border-governance-400 hover:bg-governance-50/40"
                >
                  <UploadCloud size={30} className="mb-2 text-governance-600" />
                  <p className="text-sm font-medium text-slate-700">{t.form.dragDrop}</p>
                  <p className="text-xs text-slate-400 mt-1">Uploads automatically match required documents below</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => handleBatchFiles(e.target.files)}
                  />
                </div>
              </div>

              {/* Dedicated 4 document slots */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {DOCUMENT_SLOTS.map((slot) => {
                  const file = docFiles[slot.key];
                  return (
                    <div
                      key={slot.key}
                      className={cn(
                        'flex flex-col justify-between rounded-xl border p-4 transition-colors',
                        file ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 bg-white'
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <FileText size={16} className={file ? 'text-emerald-600' : 'text-slate-400'} />
                            <span className="text-sm font-semibold text-slate-800">
                              {slot.label} {slot.required && <span className="text-red-500">*</span>}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{slot.hint}</p>
                        </div>
                        {file && (
                          <Badge variant="approved" className="shrink-0 text-[11px]">
                            <CheckCircle2 size={12} /> Ready
                          </Badge>
                        )}
                      </div>

                      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                        {file ? (
                          <div className="flex w-full items-center justify-between">
                            <span className="truncate text-xs font-mono text-slate-700 max-w-[180px]" title={file.name}>
                              {file.name}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handlePreviewFile(file)}
                                className="flex items-center gap-1 text-xs text-governance-700 hover:underline"
                                title="Preview document"
                              >
                                <Eye size={13} /> View
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveFile(slot.key)}
                                className="text-xs text-red-500 hover:text-red-700"
                                title="Remove document"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex w-full items-center justify-between">
                            <span className="text-xs text-slate-400">No file selected</span>
                            <label
                              htmlFor={`file-input-${slot.key}`}
                              className="cursor-pointer rounded-lg bg-governance-50 px-3 py-1 text-xs font-medium text-governance-700 hover:bg-governance-100"
                            >
                              Choose File
                            </label>
                          </div>
                        )}
                        <input
                          id={`file-input-${slot.key}`}
                          name={slot.key}
                          data-testid={slot.key}
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="hidden"
                          onChange={(e) => handleSingleFile(slot.key, e.target.files?.[0])}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* OCR Autofill Section */}
              <div className="rounded-xl border border-saffron-200 bg-saffron-50/60 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Sparkles size={18} className="text-saffron-600" />
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{t.form.ocrAutofill}</p>
                      <p className="text-xs text-slate-500">Reads PAN / GST certificates and auto-fills identity fields & files.</p>
                    </div>
                  </div>
                  <Button
                    variant="saffron"
                    size="sm"
                    onClick={runOcrAutofill}
                    disabled={ocrState === 'scanning'}
                  >
                    <ScanLine size={15} className={ocrState === 'scanning' ? 'animate-pulse' : ''} />
                    {ocrState === 'scanning' ? t.form.ocrScanning : t.form.ocrAutofill}
                  </Button>
                </div>

                {ocrState === 'scanning' && (
                  <div className="relative mt-4 h-24 overflow-hidden rounded-lg border border-saffron-200 bg-white">
                    <div className="absolute inset-x-2 top-0 h-8 rounded bg-gradient-to-b from-saffron-300/40 to-transparent animate-scan-line" />
                    <div className="flex h-full items-center justify-center gap-2 text-xs text-slate-400">
                      <ScanLine size={14} className="animate-pulse" /> {t.form.ocrScanning}
                    </div>
                  </div>
                )}

                {ocrState === 'done' && (
                  <div className="mt-4 flex items-start gap-2 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-700 ring-1 ring-emerald-200">
                    <CheckCircle2 size={15} className="mt-0.5 shrink-0" />
                    <span>
                      {t.form.ocrSuccess}: <strong>{form.companyName}</strong> · PAN {form.pan} · GST {form.gst}
                    </span>
                  </div>
                )}
              </div>

              {/* Mandatory document requirement alert */}
              {!canProceedStep3 && (
                <div className="mt-4 flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800 ring-1 ring-amber-200">
                  <AlertCircle size={16} className="shrink-0 text-amber-600" />
                  <span>
                    <strong>Mandatory Documents:</strong> Both <strong>PAN Card Document</strong> and <strong>GST Registration Certificate</strong> are required to submit (or click &quot;Run OCR Autofill&quot; for demo).
                  </span>
                </div>
              )}

              {/* Submission error feedback */}
              {submitError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5">
            <Button
              variant="outline"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1 || isSubmitting}
            >
              <ChevronLeft size={16} /> {t.form.back}
            </Button>

            {step < 3 ? (
              <Button
                onClick={() => setStep((s) => Math.min(3, s + 1))}
                disabled={(step === 1 && !canProceedStep1) || (step === 2 && !canProceedStep2)}
              >
                {t.form.next} <ChevronRight size={16} />
              </Button>
            ) : (
              <Button
                variant="saffron"
                onClick={handleSubmit}
                disabled={!canProceedStep3 || isSubmitting}
                title={!canProceedStep3 ? 'Please upload mandatory PAN and GST documents' : ''}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    {t.form.submit} <Check size={16} />
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
