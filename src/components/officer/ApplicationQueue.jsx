import React, { useState } from 'react';
import { Eye, Search, FileText } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, Badge, Input } from '@/components/ui';
import Button from '@/components/ui/Button';
import ApplicationDetailDrawer from './ApplicationDetailDrawer';

function overallStatus(timeline) {
  const values = Object.values(timeline);
  if (values.some((v) => v === 'action')) return 'action';
  if (values.every((v) => v === 'approved')) return 'approved';
  if (values.some((v) => v === 'review')) return 'review';
  return 'pending';
}

const STATUS_VARIANT = { approved: 'approved', review: 'review', action: 'action', pending: 'pending' };

export default function ApplicationQueue() {
  const { t, applications } = useApp();
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  const filtered = applications.filter((app) =>
    [app.companyName, app.id, app.district, app.industryType]
      .join(' ')
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  const selectedApp = applications.find((a) => a.id === selectedId) || null;

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t.officer.queueTitle}</h1>
          <p className="mt-1 text-sm text-slate-500">{t.officer.queueSubtitle}</p>
        </div>
        <div className="relative w-full max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input className="pl-9" placeholder="Search applications…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">{t.officer.table.appId}</th>
                <th className="px-5 py-3 font-semibold">{t.officer.table.applicant}</th>
                <th className="px-5 py-3 font-semibold">{t.officer.table.industry}</th>
                <th className="px-5 py-3 font-semibold">{t.officer.table.district}</th>
                <th className="px-5 py-3 font-semibold">{t.officer.table.submitted}</th>
                <th className="px-5 py-3 font-semibold">{t.officer.table.status}</th>
                <th className="px-5 py-3 font-semibold text-right">{t.officer.table.action}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((app) => {
                const status = overallStatus(app.timeline);
                return (
                  <tr key={app.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-5 py-3.5 font-mono text-xs text-governance-700">{app.id}</td>
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-slate-800">{app.companyName}</p>
                      <p className="text-xs text-slate-400">{app.ownerName}</p>
                      {app.documents && app.documents.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {app.documents.map((doc, idx) => {
                            const docName = typeof doc === 'string' ? doc : (doc.name || doc.filename || `Doc ${idx + 1}`);
                            const filename = typeof doc === 'string' ? doc : (doc.filename || doc.name || '');
                            const fileUrl = doc.url || (filename.startsWith('http://') || filename.startsWith('https://')
                              ? filename
                              : `/uploads/${encodeURIComponent(filename)}`);
                            return (
                              <a
                                key={docName + idx}
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-governance-700 hover:bg-governance-50 hover:underline"
                                title={`View ${docName}`}
                              >
                                <FileText size={10} />
                                <span className="max-w-[110px] truncate">{docName}</span>
                              </a>
                            );
                          })}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{app.industryType}</td>
                    <td className="px-5 py-3.5 text-slate-600">{app.district}</td>
                    <td className="px-5 py-3.5 text-slate-500">{app.submittedOn}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={STATUS_VARIANT[status]}>{t.tracker.status[status]}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Button size="sm" variant="outline" onClick={() => setSelectedId(app.id)}>
                        <Eye size={14} /> {t.officer.review}
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-sm text-slate-400">
                    No applications match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <ApplicationDetailDrawer app={selectedApp} onClose={() => setSelectedId(null)} />
    </div>
  );
}
