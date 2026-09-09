import React from 'react';
import { Inbox, AlertOctagon, CheckCircle2, TimerReset, ArrowRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent } from '@/components/ui';

function overallStatus(timeline) {
  const values = Object.values(timeline);
  if (values.some((v) => v === 'action')) return 'action';
  if (values.every((v) => v === 'approved')) return 'approved';
  if (values.some((v) => v === 'review')) return 'review';
  return 'pending';
}

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <Card className="p-0">
      <CardContent className="flex items-center gap-4 pt-5">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accent}`}>
          <Icon size={20} className="text-white" />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          <p className="text-xs font-medium text-slate-500">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function OfficerHome() {
  const { t, applications, setActiveView } = useApp();
  const pending = applications.filter((a) => overallStatus(a.timeline) === 'review').length;
  const flagged = applications.filter((a) => overallStatus(a.timeline) === 'action').length;
  const cleared = applications.filter((a) => overallStatus(a.timeline) === 'approved').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t.dashboard.welcome}, Officer</h1>
        <p className="mt-1 text-sm text-slate-500">{t.officer.queueSubtitle}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Inbox} label="Total Applications" value={applications.length} accent="bg-governance-700" />
        <StatCard icon={TimerReset} label="Pending Review" value={pending} accent="bg-amber-500" />
        <StatCard icon={AlertOctagon} label="Action Required" value={flagged} accent="bg-red-500" />
        <StatCard icon={CheckCircle2} label="Fully Cleared" value={cleared} accent="bg-emerald-600" />
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-5">
          <div>
            <h3 className="text-base font-semibold text-slate-900">{t.officer.queueTitle}</h3>
            <p className="text-sm text-slate-500">{applications.length} applications currently in the single-window system.</p>
          </div>
          <button
            onClick={() => setActiveView('queue')}
            className="flex items-center gap-1.5 rounded-lg bg-governance-800 px-4 py-2 text-sm font-medium text-white hover:bg-governance-900"
          >
            {t.nav.officerQueue} <ArrowRight size={15} />
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
