import React, { useState } from 'react';
import {
  Flame,
  Leaf,
  MapPinned,
  Factory,
  CheckCircle2,
  Clock4,
  AlertTriangle,
  Circle,
  FileText,
  UploadCloud,
  Loader2,
  Check,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, Badge, Progress } from '@/components/ui';
import { DEPARTMENTS } from '@/data/mockData';
import { cn } from '@/lib/utils';

const DEPT_ICON = { fire: Flame, pollution: Leaf, land: MapPinned, msme: Factory };

const STATUS_META = {
  approved: { variant: 'approved', icon: CheckCircle2, dot: 'bg-emerald-500', ring: 'ring-emerald-200' },
  review: { variant: 'review', icon: Clock4, dot: 'bg-amber-500', ring: 'ring-amber-200' },
  action: { variant: 'action', icon: AlertTriangle, dot: 'bg-red-500', ring: 'ring-red-200' },
  pending: { variant: 'pending', icon: Circle, dot: 'bg-slate-300', ring: 'ring-slate-200' },
};

export default function ApprovalTracker() {
  const { t, applications, activeApplicationId, uploadDocument, updateDepartmentStatus, fetchApplications } = useApp();
  const [uploadingDept, setUploadingDept] = useState(null);
  const [resolvedMsg, setResolvedMsg] = useState(null);
  const [resolveError, setResolveError] = useState(null);

  const app = applications.find((a) => a.id === activeApplicationId) || applications[0];

  if (!app) {
    return (
      <div className="animate-fade-in py-12 text-center">
        <p className="text-base font-semibold text-slate-700">No applications found.</p>
        <p className="mt-1 text-sm text-slate-500">Submit an application to track clearances across all departments.</p>
      </div>
    );
  }

  const handleResolveAction = async (deptKey, file) => {
    if (!file || !app) return;
    try {
      setUploadingDept(deptKey);
      setResolveError(null);
      await uploadDocument(app.id, file);
      await updateDepartmentStatus(app.id, deptKey, 'review');
      if (fetchApplications) await fetchApplications();
      setResolvedMsg(`Document "${file.name}" uploaded successfully! Status updated to Under Scrutiny.`);
    } catch (err) {
      setResolveError(err.message || 'Failed to upload document');
    } finally {
      setUploadingDept(null);
    }
  };

  const statuses = DEPARTMENTS.map((d) => app.timeline[d.key] || 'pending');
  const progressPct = (statuses.filter((s) => s === 'approved').length / DEPARTMENTS.length) * 100;

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{t.tracker.title}</h1>
        <p className="mt-1 text-sm text-slate-500">{t.tracker.subtitle}</p>
      </div>

      {resolvedMsg && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{resolvedMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setResolvedMsg(null)}
            className="text-emerald-700 hover:text-emerald-900 font-medium ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {resolveError && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-800">
          <AlertTriangle size={16} className="text-red-600 shrink-0" />
          <span>{resolveError}</span>
        </div>
      )}

      <Card className="mb-6">
        <CardContent className="pt-5">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800">{app.companyName}</p>
              <p className="text-xs text-slate-500">{app.id} · {app.district}</p>
            </div>
            <span className="text-sm font-semibold text-governance-700">{Math.round(progressPct)}%</span>
          </div>
          <Progress value={progressPct} />
          <p className="mt-2 text-xs text-slate-400">{t.tracker.overallProgress}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <ol className="relative border-l-2 border-slate-100 pl-8">
            {DEPARTMENTS.map((dept, idx) => {
              const status = app.timeline[dept.key] || 'pending';
              const meta = STATUS_META[status];
              const Icon = DEPT_ICON[dept.key];
              const StatusIcon = meta.icon;
              return (
                <li key={dept.key} className={cn('relative pb-10', idx === DEPARTMENTS.length - 1 && 'pb-0')}>
                  <span
                    className={cn(
                      'absolute -left-[41px] flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-white',
                      meta.dot
                    )}
                  >
                    <StatusIcon size={16} className="text-white" />
                  </span>

                  <div className={cn('rounded-xl border border-slate-200 bg-white p-4 shadow-card ring-1', meta.ring)}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-governance-50">
                          <Icon size={17} className="text-governance-700" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{t.tracker.departments[dept.labelKey]}</p>
                          <p className="text-xs text-slate-400">Department {idx + 1} of {DEPARTMENTS.length}</p>
                        </div>
                      </div>
                      <Badge variant={meta.variant}>{t.tracker.status[status]}</Badge>
                    </div>

                    {status === 'action' && (
                      <div className="mt-3 rounded-lg border border-red-200 bg-red-50/80 p-3 text-xs">
                        <div className="flex items-center gap-1.5 font-semibold text-red-800">
                          <AlertTriangle size={14} className="text-red-600" />
                          <span>Action Required: Document Missing or Clarification Needed</span>
                        </div>
                        <p className="mt-1 text-red-700">
                          The department requested an updated/clear copy of the required document (e.g. 7/12 Land Extract or Revised NOC) to complete clearance.
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-red-200/60 pt-2.5">
                          <label
                            htmlFor={`resolve-file-${dept.key}`}
                            className={cn(
                              'inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-governance-700 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-governance-800',
                              uploadingDept === dept.key && 'pointer-events-none opacity-60'
                            )}
                          >
                            {uploadingDept === dept.key ? (
                              <>
                                <Loader2 size={13} className="animate-spin" /> Uploading & Resolving...
                              </>
                            ) : (
                              <>
                                <UploadCloud size={13} /> Upload & Resolve Action
                              </>
                            )}
                          </label>
                          <input
                            id={`resolve-file-${dept.key}`}
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="hidden"
                            disabled={uploadingDept === dept.key}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleResolveAction(dept.key, file);
                            }}
                          />
                          <span className="text-[11px] text-slate-500">PDF, PNG, or JPG (Up to 10MB)</span>
                        </div>
                      </div>
                    )}
                    {status === 'review' && (
                      <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                        Under scrutiny by the assigned officer. Expected update within 3 working days.
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </CardContent>
      </Card>

      {app.documents && app.documents.length > 0 && (
        <Card className="mt-6">
          <CardContent className="pt-5">
            <h3 className="mb-3 text-sm font-semibold text-slate-800">Submitted Documents</h3>
            <ul className="space-y-2">
              {app.documents.map((doc, idx) => {
                const docName = typeof doc === 'string' ? doc : (doc.name || doc.filename || `Document ${idx + 1}`);
                const filename = typeof doc === 'string' ? doc : (doc.filename || doc.name || '');
                const fileUrl = doc.url || (filename.startsWith('http://') || filename.startsWith('https://')
                  ? filename
                  : `/uploads/${encodeURIComponent(filename)}`);
                return (
                  <li key={docName + idx} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm">
                    <span className="flex items-center gap-2 text-slate-700">
                      <FileText size={15} className="text-governance-600" /> {docName}
                    </span>
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-governance-700 hover:underline"
                    >
                      View
                    </a>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
