import React, { useEffect, useState } from 'react';
import { FileText, CheckCircle2, ShieldAlert, CircleDashed, ThumbsUp, ThumbsDown, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import Drawer from '@/components/ui/Drawer';
import { Badge, Textarea, Label } from '@/components/ui';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { DEPARTMENTS } from '@/data/mockData';

export default function ApplicationDetailDrawer({ app, onClose }) {
  const { t, updateApplicationDecision } = useApp();
  const [remark, setRemark] = useState('');
  const [showRejectPanel, setShowRejectPanel] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [toast, setToast] = useState(false);

  useEffect(() => {
    setRemark(app?.officerRemark || '');
    setShowRejectPanel(false);
    setRejectReason('');
    setToast(false);
  }, [app?.id]);

  if (!app) return null;

  const finalize = async (decision, finalRemark) => {
    try {
      await updateApplicationDecision(app.id, { decision, remark: finalRemark });
      setToast(true);
      setTimeout(() => {
        setToast(false);
        onClose();
      }, 1300);
    } catch (err) {
      console.error('Failed to update decision:', err);
    }
  };

  return (
    <Drawer
      open={!!app}
      onClose={onClose}
      title={t.officer.detailTitle}
      subtitle={`${app.id} · ${app.companyName}`}
      footer={
        !showRejectPanel ? (
          <div className="flex gap-3">
            <Button variant="danger" className="flex-1" onClick={() => setShowRejectPanel(true)}>
              <ThumbsDown size={16} /> {t.officer.reject}
            </Button>
            <Button variant="success" className="flex-1" onClick={() => finalize('approve', remark)}>
              <ThumbsUp size={16} /> {t.officer.approve}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <Label className="mb-0 text-red-700">{t.officer.rejectReasonTitle}</Label>
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder={t.officer.feedbackPlaceholder}
              className="border-red-200 focus:border-red-400 focus:ring-red-100"
            />
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowRejectPanel(false)}>
                {t.officer.cancel}
              </Button>
              <Button variant="danger" className="flex-1" disabled={!rejectReason.trim()} onClick={() => finalize('reject', rejectReason)}>
                {t.officer.confirmReject}
              </Button>
            </div>
          </div>
        )
      }
    >
      {toast ? (
        <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
          <CheckCircle2 size={40} className="text-emerald-600" />
          <p className="text-sm font-medium text-slate-700">{t.officer.actionSuccess}</p>
        </div>
      ) : (
        <div className="space-y-6">
          <section>
            <h4 className="mb-3 text-sm font-semibold text-slate-800">{t.officer.applicantDetails}</h4>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-lg border border-slate-100 bg-slate-25 p-4 text-sm">
              <div>
                <dt className="text-xs text-slate-400">{t.form.companyName}</dt>
                <dd className="font-medium text-slate-800">{app.companyName}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">{t.form.ownerName}</dt>
                <dd className="font-medium text-slate-800">{app.ownerName}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">{t.form.pan}</dt>
                <dd className="font-mono text-slate-700">{app.pan}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">{t.form.gst}</dt>
                <dd className="font-mono text-slate-700">{app.gst}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">{t.officer.table.industry}</dt>
                <dd className="font-medium text-slate-800">{app.industryType}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">{t.officer.table.district}</dt>
                <dd className="font-medium text-slate-800">{app.district} · {app.village}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">{t.form.investment}</dt>
                <dd className="font-medium text-slate-800">₹{app.investmentCr} Cr</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">{t.form.plotArea}</dt>
                <dd className="font-medium text-slate-800">{app.plotArea} sq.m</dd>
              </div>
            </dl>
          </section>

          <section>
            <h4 className="mb-3 text-sm font-semibold text-slate-800">{t.officer.submittedDocs}</h4>
            <ul className="space-y-2">
              {app.documents && app.documents.length > 0 ? (
                app.documents.map((doc, idx) => {
                  const docName = typeof doc === 'string' ? doc : (doc.name || doc.filename || `Document ${idx + 1}`);
                  const filename = typeof doc === 'string' ? doc : (doc.filename || doc.name || '');
                  const fileUrl = doc.url || (filename.startsWith('http://') || filename.startsWith('https://')
                    ? filename
                    : `/uploads/${encodeURIComponent(filename)}`);
                  const isVerified = typeof doc === 'object' ? doc.verified : false;

                  return (
                    <li key={docName + idx} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5">
                      <span className="flex items-center gap-2 text-sm text-slate-700">
                        <FileText size={15} className="text-governance-600" /> {docName}
                      </span>
                      <div className="flex items-center gap-3">
                        {isVerified ? (
                          <Badge variant="approved">
                            <CheckCircle2 size={12} /> {t.officer.verified}
                          </Badge>
                        ) : (
                          <Badge variant="pending">
                            <CircleDashed size={12} /> Pending
                          </Badge>
                        )}
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-medium text-governance-700 hover:underline"
                        >
                          {t.officer.viewDoc}
                        </a>
                      </div>
                    </li>
                  );
                })
              ) : (
                <li className="py-2 text-xs text-slate-400">No documents attached.</li>
              )}
            </ul>
          </section>

          <section>
            <h4 className="mb-2 text-sm font-semibold text-slate-800">Department Clearance Status</h4>
            <div className="grid grid-cols-2 gap-2">
              {DEPARTMENTS.map((dept) => {
                const status = app.timeline[dept.key];
                const variant = status === 'approved' ? 'approved' : status === 'review' ? 'review' : status === 'action' ? 'action' : 'pending';
                return (
                  <div key={dept.key} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs">
                    <span className="text-slate-600">{t.tracker.departments[dept.labelKey]}</span>
                    <Badge variant={variant}>{t.tracker.status[status]}</Badge>
                  </div>
                );
              })}
            </div>
          </section>

          {!showRejectPanel && (
            <section>
              <Label>{t.officer.feedback}</Label>
              <Textarea value={remark} onChange={(e) => setRemark(e.target.value)} placeholder={t.officer.feedbackPlaceholder} />
            </section>
          )}
        </div>
      )}
    </Drawer>
  );
}
