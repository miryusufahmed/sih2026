import React from 'react';
import { FileStack, Clock3, PiggyBank, TimerReset, ArrowRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, Badge } from '@/components/ui';
import Button from '@/components/ui/Button';
import { DEPARTMENTS } from '@/data/mockData';

const STATUS_VARIANT = { approved: 'approved', review: 'review', action: 'action', pending: 'pending' };

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

export default function EntrepreneurHome() {
  const { t, applications, setActiveView } = useApp();

  const myApp = applications[0];
  const clearedCount = myApp
    ? Object.values(myApp.timeline).filter((s) => s === 'approved').length
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t.dashboard.welcome}, {myApp?.ownerName?.split(' ')[0] || ''}</h1>
        <p className="mt-1 text-sm text-slate-500">{t.dashboard.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FileStack} label={t.dashboard.activeApplications} value={applications.length} accent="bg-governance-700" />
        <StatCard icon={Clock3} label={t.dashboard.pendingClearances} value={4 - clearedCount} accent="bg-amber-500" />
        <StatCard icon={PiggyBank} label={t.dashboard.subsidyEligible} value="₹1.4 Cr" accent="bg-saffron-500" />
        <StatCard icon={TimerReset} label={t.dashboard.avgTat} value="18 days" accent="bg-emerald-600" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="pt-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900">{t.tracker.title}</h3>
              <button onClick={() => setActiveView('tracker')} className="flex items-center gap-1 text-sm font-medium text-governance-700 hover:underline">
                {t.nav.approvalTracker} <ArrowRight size={14} />
              </button>
            </div>
            <div className="space-y-3">
              {DEPARTMENTS.map((dept) => {
                const status = myApp?.timeline?.[dept.key] || 'pending';
                return (
                  <div key={dept.key} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-25 px-4 py-3">
                    <span className="text-sm font-medium text-slate-700">{t.tracker.departments[dept.labelKey]}</span>
                    <Badge variant={STATUS_VARIANT[status]}>{t.tracker.status[status]}</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <h3 className="mb-2 text-base font-semibold text-slate-900">{t.dashboard.startApplication}</h3>
            <p className="mb-4 text-sm text-slate-500">{t.form.subtitle}</p>
            <Button className="w-full" onClick={() => setActiveView('application')}>
              {t.nav.newApplication} <ArrowRight size={16} />
            </Button>
            <div className="mt-4 rounded-lg bg-saffron-50 p-3 text-xs text-saffron-800 ring-1 ring-saffron-200">
              {t.subsidy.eligible} <strong>PSI 2019</strong> · {t.subsidy.totalBenefit}: ₹1.4 Cr
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
